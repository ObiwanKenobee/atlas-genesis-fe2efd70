/**
 * Atlas Sanctum — Internal Event Bus
 *
 * Redis Streams-backed event bus for async cross-bounded-context communication.
 * Falls back to an in-process EventEmitter when Redis is unavailable (dev/test).
 *
 * Usage:
 *   import { eventBus } from './bus';
 *
 *   // Publish
 *   await eventBus.publish({
 *     type: EventTypes.MARKETPLACE_CREDIT_ISSUED,
 *     source: 'marketplace',
 *     payload: { creditId, projectId, tonnes, ... },
 *   });
 *
 *   // Subscribe (consumer group — at-least-once delivery)
 *   eventBus.subscribe(EventTypes.MARKETPLACE_CREDIT_ISSUED, async (event) => {
 *     await notifyUser(event.payload.issuedTo);
 *   });
 */

import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';
import { redis } from '../redisClient';
import { logger } from '../utils/logger';
import type { DomainEvent, EventType, BoundedContext } from './catalog';

// ─── Types ────────────────────────────────────────────────────────────────────

type EventHandler<T = Record<string, unknown>> = (event: DomainEvent<T>) => Promise<void>;

interface PublishInput<T = Record<string, unknown>> {
  type: EventType;
  source: BoundedContext;
  payload: T;
  correlationId?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STREAM_KEY = 'atlas:events';
const CONSUMER_GROUP = 'atlas-consumers';
const CONSUMER_NAME = `consumer-${process.pid}`;
const POLL_INTERVAL_MS = 100;
const MAX_PENDING_REDELIVERY_MS = 30_000;
const BATCH_SIZE = 50;

// ─── Event Bus ────────────────────────────────────────────────────────────────

class AtlasEventBus {
  private readonly handlers = new Map<EventType, EventHandler[]>();
  private readonly fallback = new EventEmitter();
  private polling = false;
  private pollTimer: NodeJS.Timeout | null = null;

  // ─── Publish ──────────────────────────────────────────────────────────────

  async publish<T>(input: PublishInput<T>): Promise<string> {
    const event: DomainEvent<T> = {
      id: randomUUID(),
      type: input.type,
      schemaVersion: 1,
      occurredAt: new Date().toISOString(),
      correlationId: input.correlationId ?? randomUUID(),
      source: input.source,
      payload: input.payload,
    };

    if (redis) {
      try {
        const id = await redis.xadd(
          STREAM_KEY,
          '*',
          'type', event.type,
          'data', JSON.stringify(event),
        );
        logger.debug('[eventBus] published', { type: event.type, id, correlationId: event.correlationId });
        return id ?? event.id;
      } catch (err) {
        logger.warn('[eventBus] Redis publish failed, falling back to in-process', { error: (err as Error).message });
      }
    }

    // In-process fallback (dev / test)
    this.fallback.emit(event.type, event);
    return event.id;
  }

  // ─── Subscribe ────────────────────────────────────────────────────────────

  subscribe<T>(eventType: EventType, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventType) ?? [];
    this.handlers.set(eventType, [...existing, handler as EventHandler]);

    // Fallback: also register on the in-process emitter
    this.fallback.on(eventType, (event: DomainEvent<T>) => {
      handler(event).catch(err =>
        logger.error('[eventBus] handler error', { type: eventType, error: (err as Error).message })
      );
    });

    if (!this.polling) this.startPolling();
  }

  subscribeMany<T>(eventTypes: EventType[], handler: EventHandler<T>): void {
    for (const type of eventTypes) this.subscribe(type, handler);
  }

  // ─── Redis Streams Polling ────────────────────────────────────────────────

  private async startPolling(): Promise<void> {
    if (!redis || this.polling) return;
    this.polling = true;

    // Ensure consumer group exists
    try {
      await redis.xgroup('CREATE', STREAM_KEY, CONSUMER_GROUP, '$', 'MKSTREAM');
    } catch {
      // Group already exists — expected on restart
    }

    const poll = async () => {
      if (!redis) return;
      try {
        // Read new messages
        const results = await redis.xreadgroup(
          'GROUP', CONSUMER_GROUP, CONSUMER_NAME,
          'COUNT', BATCH_SIZE,
          'BLOCK', POLL_INTERVAL_MS,
          'STREAMS', STREAM_KEY, '>',
        ) as Array<[string, Array<[string, string[]]>]> | null;

        if (results) {
          for (const [, messages] of results) {
            for (const [msgId, fields] of messages) {
              await this.processMessage(msgId, fields);
            }
          }
        }

        // Reclaim stale pending messages
        await this.reclaimPending();
      } catch (err) {
        logger.warn('[eventBus] poll error', { error: (err as Error).message });
      }

      this.pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    this.pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
  }

  private async processMessage(msgId: string, fields: string[]): Promise<void> {
    if (!redis) return;

    // Redis fields come as flat [key, value, key, value, ...]
    const fieldMap: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
      fieldMap[fields[i]] = fields[i + 1];
    }

    const raw = fieldMap['data'];
    if (!raw) {
      await redis.xack(STREAM_KEY, CONSUMER_GROUP, msgId);
      return;
    }

    let event: DomainEvent;
    try {
      event = JSON.parse(raw) as DomainEvent;
    } catch {
      logger.error('[eventBus] failed to parse event', { msgId, raw: raw.slice(0, 200) });
      await redis.xack(STREAM_KEY, CONSUMER_GROUP, msgId);
      return;
    }

    const handlers = this.handlers.get(event.type) ?? [];
    await Promise.allSettled(
      handlers.map(h =>
        h(event).catch(err =>
          logger.error('[eventBus] handler error', {
            type: event.type,
            correlationId: event.correlationId,
            error: (err as Error).message,
          })
        )
      )
    );

    await redis.xack(STREAM_KEY, CONSUMER_GROUP, msgId);
  }

  private async reclaimPending(): Promise<void> {
    if (!redis) return;
    try {
      const pending = await redis.xautoclaim(
        STREAM_KEY, CONSUMER_GROUP, CONSUMER_NAME,
        MAX_PENDING_REDELIVERY_MS, '0-0', 'COUNT', 10,
      ) as [string, Array<[string, string[]]>] | null;

      if (pending?.[1]?.length) {
        for (const [msgId, fields] of pending[1]) {
          await this.processMessage(msgId, fields);
        }
      }
    } catch {
      // xautoclaim not available in older Redis — skip
    }
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  stop(): void {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    this.polling = false;
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const eventBus = new AtlasEventBus();
export type { DomainEvent, EventHandler, PublishInput };
