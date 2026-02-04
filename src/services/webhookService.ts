/**
 * WebhookService
 * Handles webhook registration, delivery, and retry logic
 */

import { LRUCache } from '../utils/cache';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface WebhookConfig {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  failureCount: number;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
}

export type WebhookEvent =
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'investment.created'
  | 'investment.completed'
  | 'payment.completed'
  | 'payment.failed'
  | 'carbon.credited'
  | 'verification.completed'
  | 'report.generated';

export interface WebhookPayload {
  id: string;
  event: WebhookEvent;
  timestamp: Date;
  data: Record<string, unknown>;
  attempt: number;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  payload: WebhookPayload;
  status: 'pending' | 'success' | 'failed';
  statusCode?: number;
  response?: string;
  attemptCount: number;
  nextRetryAt?: Date;
  createdAt: Date;
  completedAt?: Date;
}

export interface WebhookSignature {
  signature: string;
  timestamp: string;
}

export class WebhookServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'WebhookServiceError';
  }
}

// Signature verification
export function signWebhookPayload(payload: string, secret: string, timestamp: string): string {
  const signedPayload = `${timestamp}.${payload}`;
  return crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  timestamp: string,
  toleranceSeconds: number = 300
): boolean {
  // Check timestamp tolerance
  const now = Math.floor(Date.now() / 1000);
  const timestampAge = now - parseInt(timestamp);
  if (timestampAge > toleranceSeconds) {
    throw new WebhookServiceError('Webhook timestamp is too old', 'TIMESTAMP_TOO_OLD');
  }

  // Calculate expected signature
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  // Compare signatures
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export class WebhookService {
  private webhooks: Map<string, WebhookConfig> = new Map();
  private deliveries: Map<string, WebhookDelivery[]> = new Map();
  private retryQueue: Map<string, WebhookDelivery> = new Map();
  private cache: LRUCache<string, unknown>;

  constructor() {
    this.cache = new LRUCache<string, unknown>(1000, 5 * 60 * 1000); // 5 min TTL
  }

  // Webhook CRUD
  async createWebhook(
    url: string,
    events: WebhookEvent[],
    secret: string
  ): Promise<WebhookConfig> {
    if (!this.isValidUrl(url)) {
      throw new WebhookServiceError('Invalid webhook URL', 'INVALID_URL');
    }

    if (events.length === 0) {
      throw new WebhookServiceError('At least one event is required', 'NO_EVENTS');
    }

    const webhook: WebhookConfig = {
      id: uuidv4(),
      url,
      events,
      secret,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      failureCount: 0,
    };

    this.webhooks.set(webhook.id, webhook);
    return webhook;
  }

  async updateWebhook(
    id: string,
    updates: Partial<Pick<WebhookConfig, 'url' | 'events' | 'active'>>
  ): Promise<WebhookConfig> {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      throw new WebhookServiceError('Webhook not found', 'WEBHOOK_NOT_FOUND');
    }

    if (updates.url && !this.isValidUrl(updates.url)) {
      throw new WebhookServiceError('Invalid webhook URL', 'INVALID_URL');
    }

    const updated: WebhookConfig = {
      ...webhook,
      ...updates,
      updatedAt: new Date(),
    };

    this.webhooks.set(id, updated);
    return updated;
  }

  async deleteWebhook(id: string): Promise<void> {
    if (!this.webhooks.has(id)) {
      throw new WebhookServiceError('Webhook not found', 'WEBHOOK_NOT_FOUND');
    }
    this.webhooks.delete(id);
    this.deliveries.delete(id);
  }

  async getWebhook(id: string): Promise<WebhookConfig | null> {
    return this.webhooks.get(id) || null;
  }

  async listWebhooks(): Promise<WebhookConfig[]> {
    return Array.from(this.webhooks.values());
  }

  async listWebhooksByEvent(event: WebhookEvent): Promise<WebhookConfig[]> {
    return Array.from(this.webhooks.values()).filter(
      (w) => w.active && w.events.includes(event)
    );
  }

  // Delivery
  async triggerEvent(event: WebhookEvent, data: Record<string, unknown>): Promise<WebhookDelivery[]> {
    const webhooks = await this.listWebhooksByEvent(event);
    const deliveries: WebhookDelivery[] = [];

    for (const webhook of webhooks) {
      const delivery = await this.deliverToWebhook(webhook, event, data);
      deliveries.push(delivery);
    }

    return deliveries;
  }

  private async deliverToWebhook(
    webhook: WebhookConfig,
    event: WebhookEvent,
    data: Record<string, unknown>
  ): Promise<WebhookDelivery> {
    const payload: WebhookPayload = {
      id: uuidv4(),
      event,
      timestamp: new Date(),
      data,
      attempt: 1,
    };

    const delivery: WebhookDelivery = {
      id: uuidv4(),
      webhookId: webhook.id,
      payload,
      status: 'pending',
      attemptCount: 0,
      createdAt: new Date(),
    };

    // Add to deliveries
    const webhookDeliveries = this.deliveries.get(webhook.id) || [];
    webhookDeliveries.unshift(delivery);
    this.deliveries.set(webhook.id, webhookDeliveries.slice(0, 100)); // Keep last 100

    // Attempt delivery
    await this.attemptDelivery(webhook, delivery);

    return delivery;
  }

  private async attemptDelivery(
    webhook: WebhookConfig,
    delivery: WebhookDelivery
  ): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = JSON.stringify(delivery.payload);
    const signature = signWebhookPayload(payload, webhook.secret, timestamp);

    try {
      const response = await this.httpRequest(webhook.url, payload, {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': timestamp,
        'X-Webhook-Event': delivery.payload.event,
        'X-Webhook-ID': delivery.payload.id,
      });

      delivery.status = 'success';
      delivery.statusCode = response.status;
      delivery.completedAt = new Date();
      
      // Update webhook success
      const config = this.webhooks.get(webhook.id);
      if (config) {
        config.lastSuccessAt = new Date();
        config.failureCount = 0;
      }
    } catch (error) {
      delivery.attemptCount++;
      delivery.status = 'failed';
      
      if (error instanceof Error) {
        delivery.response = error.message;
      }

      // Check if should retry
      if (delivery.attemptCount < 3) {
        delivery.nextRetryAt = this.calculateRetryTime(delivery.attemptCount);
        this.retryQueue.set(delivery.id, delivery);
      }

      // Update webhook failure
      const config = this.webhooks.get(webhook.id);
      if (config) {
        config.lastFailureAt = new Date();
        config.failureCount++;
      }
    }
  }

  private async httpRequest(
    url: string,
    body: string,
    headers: Record<string, string>
  ): Promise<{ status: number; body: string }> {
    // Simulate HTTP request (in production, use actual fetch)
    const mockStatus = Math.random() > 0.1 ? 200 : 500;
    
    return {
      status: mockStatus,
      body: mockStatus === 200 ? 'OK' : 'Internal Server Error',
    };
  }

  private calculateRetryTime(attempt: number): Date {
    const delays = [60, 300, 900]; // 1min, 5min, 15min
    const delay = delays[attempt - 1] || 1800;
    return new Date(Date.now() + delay * 1000);
  }

  async retryDelivery(deliveryId: string): Promise<void> {
    const delivery = this.retryQueue.get(deliveryId);
    if (!delivery) {
      throw new WebhookServiceError('Delivery not found or not eligible for retry', 'DELIVERY_NOT_FOUND');
    }

    this.retryQueue.delete(deliveryId);
    const webhook = this.webhooks.get(delivery.webhookId);
    if (!webhook) {
      throw new WebhookServiceError('Webhook not found', 'WEBHOOK_NOT_FOUND');
    }

    delivery.payload.attempt++;
    await this.attemptDelivery(webhook, delivery);
  }

  async getDeliveries(webhookId: string, limit: number = 50): Promise<WebhookDelivery[]> {
    const deliveries = this.deliveries.get(webhookId) || [];
    return deliveries.slice(0, limit);
  }

  async getDelivery(id: string): Promise<WebhookDelivery | null> {
    for (const deliveries of this.deliveries.values()) {
      const found = deliveries.find((d) => d.id === id);
      if (found) return found;
    }
    return null;
  }

  // Stats
  async getStats(): Promise<{
    totalWebhooks: number;
    activeWebhooks: number;
    totalDeliveries: number;
    successRate: number;
    recentDeliveries: WebhookDelivery[];
  }> {
    const webhooks = Array.from(this.webhooks.values());
    const deliveries = Array.from(this.deliveries.values()).flat();

    const successful = deliveries.filter((d) => d.status === 'success').length;
    const total = deliveries.length || 1;

    return {
      totalWebhooks: webhooks.length,
      activeWebhooks: webhooks.filter((w) => w.active).length,
      totalDeliveries: total,
      successRate: (successful / total) * 100,
      recentDeliveries: deliveries.slice(0, 10),
    };
  }

  // Utils
  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  }

  // Ping (health check)
  async ping(webhookId: string): Promise<boolean> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      throw new WebhookServiceError('Webhook not found', 'WEBHOOK_NOT_FOUND');
    }

    try {
      const response = await this.httpRequest(webhook.url, JSON.stringify({ type: 'ping' }), {
        'Content-Type': 'application/json',
      });
      return response.status >= 200 && response.status < 300;
    } catch {
      return false;
    }
  }
}

export const webhookService = new WebhookService();
