/**
 * Atlas Sanctum — Kafka Event Bus Adapter
 * Implements EventBusPort using Apache Kafka for durable, ordered, replay-capable events.
 * Falls back to Redis Pub/Sub when Kafka is unavailable (dev / test).
 *
 * Design: Hexagonal Architecture — this is a secondary adapter (driven side).
 * The rest of the system only ever talks to EventBusPort.
 */

import { randomUUID } from 'crypto';
import {
  EventBusPort,
  DomainEvent,
  EventPattern,
  EventHandler,
  Subscription,
  SubscriptionOptions,
} from '../types';
import { logger } from '../../utils/logger';

// ─── Lazy-loaded to avoid hard dependency when Kafka is disabled ──────────────
// kafkajs is an optional peer dependency — install with: npm install kafkajs
let _kafkaAvailable = false;
async function tryImportKafka() {
  try {
    const mod = await import('kafkajs' as any);
    _kafkaAvailable = true;
    return mod;
  } catch {
    return null;
  }
}

// ─── Kafka-based adapter ──────────────────────────────────────────────────────

class KafkaEventBus implements EventBusPort {
  private producer: any;
  private consumers = new Map<string, any>();
  private subscriptions = new Map<string, Subscription>();
  private readonly defaultTopic: string;

  constructor(private readonly brokers: string[]) {
    this.defaultTopic = process.env.KAFKA_TOPIC_EVENTS || 'sanctum.events';
  }

  async connect(): Promise<void> {
    const kafkaMod = await tryImportKafka();
    if (!kafkaMod) throw new Error('kafkajs not installed. Run: npm install kafkajs');
    const { Kafka } = kafkaMod;
    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'atlas-sanctum',
      brokers: this.brokers,
      ssl: process.env.KAFKA_SSL_ENABLED === 'true',
      sasl: process.env.KAFKA_SASL_MECHANISM ? {
        mechanism: process.env.KAFKA_SASL_MECHANISM as any,
        username: process.env.KAFKA_SASL_USERNAME!,
        password: process.env.KAFKA_SASL_PASSWORD!,
      } : undefined,
      retry: { retries: 8, initialRetryTime: 300, factor: 2 },
    });

    this.producer = kafka.producer({
      transactionalId: `sanctum-producer-${randomUUID()}`,
      idempotent: true,
      maxInFlightRequests: 5,
    });

    await this.producer.connect();
    logger.info('[EventBus] Kafka producer connected');
  }

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    const topic = this.topicForEvent(event);
    await this.producer.send({
      topic,
      messages: [{
        key: event.aggregateId,
        value: JSON.stringify(event),
        headers: {
          'correlation-id': event.metadata.correlationId,
          'event-type': event.type,
          'event-version': String(event.version),
          'plane': event.plane,
          'tenant-id': event.tenantId,
        },
        timestamp: event.occurredAt.getTime().toString(),
      }],
    });
  }

  async publishBatch<T>(events: DomainEvent<T>[]): Promise<void> {
    if (events.length === 0) return;
    const byTopic = new Map<string, DomainEvent<T>[]>();
    for (const e of events) {
      const t = this.topicForEvent(e);
      if (!byTopic.has(t)) byTopic.set(t, []);
      byTopic.get(t)!.push(e);
    }
    const topicMessages = Array.from(byTopic.entries()).map(([topic, evts]) => ({
      topic,
      messages: evts.map(e => ({
        key: e.aggregateId,
        value: JSON.stringify(e),
        headers: { 'event-type': e.type, 'plane': e.plane },
      })),
    }));
    await this.producer.sendBatch({ topicMessages });
  }

  async subscribe<T>(
    pattern: EventPattern,
    handler: EventHandler<T>,
    options?: SubscriptionOptions
  ): Promise<Subscription> {
    const kafkaMod = await tryImportKafka();
    if (!kafkaMod) throw new Error('kafkajs not installed');
    const { Kafka } = kafkaMod;
    const subscriptionId = randomUUID();
    const groupId = `${process.env.KAFKA_GROUP_ID || 'sanctum'}-${subscriptionId.slice(0, 8)}`;

    const kafka = new Kafka({
      clientId: `${process.env.KAFKA_CLIENT_ID}-consumer-${subscriptionId.slice(0, 8)}`,
      brokers: this.brokers,
    });

    const consumer = kafka.consumer({
      groupId,
      minBytes: 1,
      maxBytes: 10485760, // 10MB
    });

    await consumer.connect();
    await consumer.subscribe({ topic: this.defaultTopic, fromBeginning: false });

    await consumer.run({
      autoCommit: true,
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        const event = JSON.parse(message.value.toString()) as DomainEvent<T>;
        if (!this.matchesPattern(event, pattern)) return;

        let attempt = 0;
        const maxAttempts = options?.retryPolicy?.maxAttempts ?? 3;
        while (attempt < maxAttempts) {
          try {
            await handler(event);
            return;
          } catch (err) {
            attempt++;
            if (attempt >= maxAttempts) {
              logger.error('[EventBus] Handler failed after retries', { event: event.id, err });
            } else {
              const delay = (options?.retryPolicy?.backoffMs ?? 500) *
                Math.pow(options?.retryPolicy?.backoffMultiplier ?? 2, attempt);
              await new Promise(r => setTimeout(r, delay));
            }
          }
        }
      },
    });

    this.consumers.set(subscriptionId, consumer);

    const subscription: Subscription = {
      id: subscriptionId,
      pattern,
      unsubscribe: async () => {
        await consumer.disconnect();
        this.consumers.delete(subscriptionId);
        this.subscriptions.delete(subscriptionId);
      },
    };

    this.subscriptions.set(subscriptionId, subscription);
    return subscription;
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    const sub = this.subscriptions.get(subscriptionId);
    if (sub) await sub.unsubscribe();
  }

  private topicForEvent(event: DomainEvent<unknown>): string {
    const topicMap: Record<string, string> = {
      intelligence: process.env.KAFKA_TOPIC_AI_TASKS || 'sanctum.ai.tasks',
      trust: process.env.KAFKA_TOPIC_BLOCKCHAIN || 'sanctum.blockchain',
      value: process.env.KAFKA_TOPIC_EVENTS || 'sanctum.events',
      coordination: process.env.KAFKA_TOPIC_COMMANDS || 'sanctum.commands',
      planetary: process.env.KAFKA_TOPIC_MEASUREMENTS || 'sanctum.measurements',
    };
    return topicMap[event.plane] ?? this.defaultTopic;
  }

  private matchesPattern(event: DomainEvent<unknown>, pattern: EventPattern): boolean {
    if (pattern.plane && event.plane !== pattern.plane) return false;
    if (pattern.aggregateType && event.aggregateType !== pattern.aggregateType) return false;
    if (pattern.type) {
      if (pattern.type instanceof RegExp) {
        if (!pattern.type.test(event.type)) return false;
      } else if (pattern.type !== event.type) return false;
    }
    return true;
  }

  async disconnect(): Promise<void> {
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect().catch(() => {});
    }
    await this.producer?.disconnect().catch(() => {});
  }
}

// ─── Redis Pub/Sub fallback (dev / test) ─────────────────────────────────────

class RedisEventBus implements EventBusPort {
  private subscriptions = new Map<string, Subscription>();

  constructor(private readonly redis: any) {}

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    await this.redis.publish('sanctum:events', JSON.stringify(event));
  }

  async publishBatch<T>(events: DomainEvent<T>[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    for (const e of events) pipeline.publish('sanctum:events', JSON.stringify(e));
    await pipeline.exec();
  }

  async subscribe<T>(
    pattern: EventPattern,
    handler: EventHandler<T>,
    _options?: SubscriptionOptions
  ): Promise<Subscription> {
    const subscriptionId = randomUUID();
    const subscriber = this.redis.duplicate();
    await subscriber.subscribe('sanctum:events');

    subscriber.on('message', async (_channel: string, message: string) => {
      const event = JSON.parse(message) as DomainEvent<T>;
      if (!this.matchesPattern(event, pattern)) return;
      try {
        await handler(event);
      } catch (err) {
        logger.error('[EventBus:Redis] Handler error', { eventId: event.id, err });
      }
    });

    const sub: Subscription = {
      id: subscriptionId,
      pattern,
      unsubscribe: async () => {
        await subscriber.unsubscribe('sanctum:events');
        await subscriber.quit();
        this.subscriptions.delete(subscriptionId);
      },
    };

    this.subscriptions.set(subscriptionId, sub);
    return sub;
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    const sub = this.subscriptions.get(subscriptionId);
    if (sub) await sub.unsubscribe();
  }

  private matchesPattern(event: DomainEvent<unknown>, pattern: EventPattern): boolean {
    if (pattern.plane && event.plane !== pattern.plane) return false;
    if (pattern.type && pattern.type !== event.type) return false;
    return true;
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

let _instance: EventBusPort | null = null;

export async function createEventBus(): Promise<EventBusPort> {
  if (_instance) return _instance;

  const kafkaBrokers = process.env.KAFKA_BROKERS;
  if (kafkaBrokers && process.env.FEATURE_KAFKA_STREAMING !== 'false') {
    const bus = new KafkaEventBus(kafkaBrokers.split(',').map(b => b.trim()));
    await bus.connect();
    _instance = bus;
    logger.info('[EventBus] Using Kafka');
  } else {
    const { default: redis } = await import('../../redisClient');
    _instance = new RedisEventBus(redis);
    logger.info('[EventBus] Using Redis Pub/Sub (Kafka not configured)');
  }

  return _instance;
}

// ─── Helper: build a domain event ────────────────────────────────────────────

export function buildEvent<T>(
  type: string,
  plane: import('../types').PlaneId,
  aggregateId: string,
  aggregateType: string,
  payload: T,
  meta: Partial<import('../types').EventMetadata> & { tenantId: string }
): DomainEvent<T> {
  return {
    id: randomUUID(),
    type,
    plane,
    tenantId: meta.tenantId,
    aggregateId,
    aggregateType,
    payload,
    metadata: {
      correlationId: meta.correlationId ?? randomUUID(),
      causationId: meta.causationId,
      userId: meta.userId,
      agentId: meta.agentId,
      source: meta.source ?? process.env.SERVICE_NAME ?? 'atlas-sanctum',
      schemaVersion: 1,
    },
    occurredAt: new Date(),
    version: 1,
  };
}
