/**
 * Request Queue with Backpressure
 * 
 * Implements a priority-based request queue with configurable limits
 * and backpressure handling for AI provider requests.
 */

import { 
  QueueConfig, 
  QueueStats, 
  RequestPriority,
  QueueOverflowError,
  RequestTimeoutError
} from '../types';

interface QueuedRequest<T> {
  id: string;
  priority: RequestPriority;
  execute: () => Promise<T>;
  createdAt: number;
  priorityValue: number;
  attempts: number;
  metadata?: Record<string, any>;
}

/**
 * Priority Queue for managing AI provider requests
 */
export class RequestQueue<T> {
  private queue: QueuedRequest<T>[] = [];
  private processing: number = 0;
  private isPaused: boolean = false;
  private droppedRequests: number = 0;
  private totalWaitTimes: number[] = [];
  
  constructor(
    private config: QueueConfig,
    private maxConcurrent: number = 10
  ) {}

  /**
   * Enqueue a request with priority
   */
  async enqueue(
    execute: () => Promise<T>,
    priority: RequestPriority = 'normal',
    metadata?: Record<string, any>
  ): Promise<T> {
    const priorityMap: Record<RequestPriority, number> = {
      critical: 0,
      high: 1,
      normal: 2,
      low: 3
    };

    const request: QueuedRequest<T> = {
      id: this.generateId(),
      priority,
      execute,
      createdAt: Date.now(),
      priorityValue: priorityMap[priority],
      attempts: 0,
      metadata
    };

    // Insert based on priority
    const insertIndex = this.queue.findIndex(
      r => r.priorityValue > request.priorityValue
    );

    if (insertIndex === -1) {
      this.queue.push(request);
    } else {
      this.queue.splice(insertIndex, 0, request);
    }

    // Check if queue is full
    if (this.queue.length > this.config.maxSize) {
      // Remove lowest priority request
      const removed = this.queue.pop();
      this.droppedRequests++;
      throw new QueueOverflowError(
        `Request queue is full (max: ${this.config.maxSize})`,
        removed
      );
    }

    return this.process();
  }

  /**
   * Process the next request in queue
   */
  private async process(): Promise<T> {
    if (this.processing >= this.maxConcurrent || this.isPaused) {
      return this.waitForSlot();
    }

    const request = this.queue.shift();
    if (!request) {
      return Promise.reject(new Error('Queue is empty'));
    }

    // Check wait time
    const waitTime = Date.now() - request.createdAt;
    if (waitTime > this.config.maxWaitTime) {
      this.droppedRequests++;
      throw new RequestTimeoutError(
        `Request exceeded max wait time (${this.config.maxWaitTime}ms)`,
        request.id
      );
    }

    this.processing++;
    request.attempts++;

    try {
      const startTime = Date.now();
      const result = await request.execute();
      const processingTime = Date.now() - startTime;
      
      this.totalWaitTimes.push(waitTime + processingTime);
      if (this.totalWaitTimes.length > 1000) {
        this.totalWaitTimes = this.totalWaitTimes.slice(-1000);
      }

      return result;
    } finally {
      this.processing--;
      this.processNext();
    }
  }

  /**
   * Wait for a processing slot to become available
   */
  private async waitForSlot(): Promise<T> {
    return new Promise((resolve, reject) => {
      const checkInterval = 100;
      const startedAt = Date.now();

      const check = () => {
        const elapsed = Date.now() - startedAt;
        
        if (elapsed > this.config.maxWaitTime) {
          this.droppedRequests++;
          reject(new RequestTimeoutError(
            `Request exceeded max wait time`,
            this.generateId()
          ));
          return;
        }

        if (this.processing < this.maxConcurrent && !this.isPaused) {
          this.process().then(resolve).catch(reject);
        } else {
          setTimeout(check, checkInterval);
        }
      };
      
      check();
    });
  }

  /**
   * Process next request if capacity available
   */
  private processNext(): void {
    if (this.queue.length > 0 && !this.isPaused && this.processing < this.maxConcurrent) {
      this.process();
    }
  }

  /**
   * Pause queue processing
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume queue processing
   */
  resume(): void {
    this.isPaused = false;
    // Process as many as capacity allows
    while (this.queue.length > 0 && this.processing < this.maxConcurrent) {
      this.processNext();
    }
  }

  /**
   * Clear all queued requests
   */
  clear(): QueuedRequest<T>[] {
    const cleared = [...this.queue];
    this.queue = [];
    this.droppedRequests += cleared.length;
    return cleared;
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return {
      queued: this.queue.length,
      processing: this.processing,
      paused: this.isPaused,
      dropped: this.droppedRequests,
      avgWaitTime: this.calculateAvgWaitTime()
    };
  }

  /**
   * Calculate average wait time
   */
  private calculateAvgWaitTime(): number {
    if (this.totalWaitTimes.length === 0) return 0;
    const sum = this.totalWaitTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.totalWaitTimes.length);
  }

  /**
   * Get queue contents (for debugging)
   */
  peek(): QueuedRequest<T>[] {
    return [...this.queue];
  }

  /**
   * Generate unique request ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Batched Request Queue
 * Groups similar requests together for efficiency
 */
export class BatchedRequestQueue<T> {
  private batchQueue: Map<string, QueuedRequest<T>[]> = new Map();
  private processing: number = 0;
  private batchTimeout?: NodeJS.Timeout;

  constructor(
    private config: QueueConfig,
    private maxConcurrent: number = 10,
    private batchSize: number = 10,
    private batchWindowMs: number = 100
  ) {}

  /**
   * Add request to batch queue
   */
  async enqueue(
    batchKey: string,
    execute: () => Promise<T>
  ): Promise<T> {
    const existing = this.batchQueue.get(batchKey) || [];
    existing.push({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      priority: 'normal',
      execute,
      createdAt: Date.now(),
      priorityValue: 2,
      attempts: 0
    });
    this.batchQueue.set(batchKey, existing);

    // Schedule batch processing
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.processBatches(), this.batchWindowMs);
    }

    return this.waitForCompletion(batchKey);
  }

  /**
   * Wait for batch to complete
   */
  private async waitForCompletion(batchKey: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const check = () => {
        const batch = this.batchQueue.get(batchKey);
        if (!batch || batch.length === 0) {
          resolve(undefined as any);
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  /**
   * Process all batches
   */
  private async processBatches(): Promise<void> {
    this.batchTimeout = undefined;

    for (const [batchKey, batch] of this.batchQueue) {
      if (this.processing >= this.maxConcurrent) break;
      if (batch.length === 0) continue;

      this.processing++;

      try {
        // Process all requests in batch
        await Promise.all(
          batch.map(request => request.execute())
        );

        // Clear batch
        this.batchQueue.delete(batchKey);
      } finally {
        this.processing--;
      }
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    let totalQueued = 0;
    for (const batch of this.batchQueue.values()) {
      totalQueued += batch.length;
    }

    return {
      queued: totalQueued,
      processing: this.processing,
      paused: false,
      dropped: 0,
      avgWaitTime: 0
    };
  }
}
