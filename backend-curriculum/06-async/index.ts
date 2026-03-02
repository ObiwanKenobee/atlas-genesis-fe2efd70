/**
 * Module 6: Asynchronous Programming
 * 
 * Async/await patterns, event emitters, and background job processing
 */

// ============================================================================
// 6.1 ASYNC/AWAIT PATTERNS
// ============================================================================

/**
 * Retry with exponential backoff
 */
async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    jitter?: boolean;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelay = options.baseDelay ?? 1000;
  const maxDelay = options.maxDelay ?? 30000;
  const jitter = options.jitter ?? true;
  const onRetry = options.onRetry;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      let delay = baseDelay * Math.pow(2, attempt - 1);
      delay = Math.min(delay, maxDelay);
      
      // Add jitter
      if (jitter) {
        delay = delay * (0.5 + Math.random());
      }
      
      if (onRetry) {
        onRetry(lastError, attempt);
      }
      
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parallel execution with concurrency limit
 */
async function parallel<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: { concurrency?: number } = {}
): Promise<R[]> {
  const concurrency = options.concurrency ?? 10;
  const results: R[] = [];
  const executing = new Set<Promise<R>>();
  
  for (const item of items) {
    const promise = Promise.resolve().then(() => processor(item));
    results.push(promise);
    executing.add(promise);
    
    promise.finally(() => executing.delete(promise));
    
    // Wait if we've reached the concurrency limit
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  
  return Promise.all(results);
}

/**
 * Batch processing
 */
async function batchProcess<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  options: { batchSize?: number } = {}
): Promise<R[]> {
  const batchSize = options.batchSize ?? 100;
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Debounced async function
 */
function debounceAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  delayMs: number
): T {
  let timeoutId: NodeJS.Timeout;
  let currentPromise: Promise<unknown> | null = null;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          currentPromise = fn(...args);
          resolve(await currentPromise);
        } catch (error) {
          reject(error);
        }
      }, delayMs);
    }) as ReturnType<T>;
  }) as T;
}

/**
 * Rate limited async function
 */
function rateLimitAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: {
    maxRequests: number;
    windowMs: number;
  }
): T {
  const { maxRequests, windowMs } = options;
  const timestamps: number[] = [];
  
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Remove old timestamps
    while (timestamps.length > 0 && timestamps[0] < windowStart) {
      timestamps.shift();
    }
    
    if (timestamps.length >= maxRequests) {
      const oldest = timestamps[0];
      const waitTime = oldest + windowMs - now;
      
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          rateLimitAsync(fn, options)(...args)
            .then(resolve)
            .catch(reject);
        }, waitTime);
      }) as ReturnType<T>;
    }
    
    timestamps.push(now);
    return fn(...args) as ReturnType<T>;
  }) as T;
}

// ============================================================================
// 6.2 EVENT EMITTERS
// ============================================================================

import { EventEmitter } from "events";

interface EventMap {
  "user:created": { userId: string; email: string; username: string };
  "user:updated": { userId: string; changes: Record<string, unknown> };
  "user:deleted": { userId: string; email: string };
  "order:created": { orderId: string; userId: string; total: number };
  "order:updated": { orderId: string; status: string };
  "payment:completed": { orderId: string; amount: number };
  "payment:failed": { orderId: string; reason: string };
  "error": { error: Error; context?: Record<string, unknown> };
}

class AtlasEventEmitter extends EventEmitter {
  on<K extends keyof EventMap>(
    event: K,
    listener: (data: EventMap[K]) => void
  ): this {
    return super.on(event, listener);
  }
  
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): boolean {
    return super.emit(event, data);
  }
  
  once<K extends keyof EventMap>(
    event: K,
    listener: (data: EventMap[K]) => void
  ): this {
    return super.once(event, listener);
  }
  
  off<K extends keyof EventMap>(
    event: K,
    listener: (data: EventMap[K]) => void
  ): this {
    return super.off(event, listener);
  }
}

// ============================================================================
// 6.3 EVENT BUS (Distributed)
// ============================================================================

class EventBus {
  private emitter: AtlasEventEmitter;
  private redisPub: any = null;
  private subscriber: any = null;
  private isMaster = false;
  private channelPrefix = "atlas-events:";
  
  constructor(useRedis: boolean = false) {
    this.emitter = new AtlasEventEmitter();
    
    if (useRedis && process.env.REDIS_URL) {
      this.setupRedis();
    }
  }
  
  private async setupRedis(): Promise<void> {
    // In production, this would use actual Redis client
    // this.redisPub = createRedisClient();
    // this.subscriber = createRedisClient();
    // await this.redisPub.connect();
    // await this.subscriber.connect();
    this.isMaster = true;
    
    // this.subscriber.on("message", async (channel: string, message: string) => {
    //   const eventName = channel.replace(this.channelPrefix, "");
    //   const data = JSON.parse(message);
    //   this.emitter.emit(eventName, data);
    // });
  }
  
  async publish<K extends keyof EventMap>(
    event: K,
    data: EventMap[K]
  ): Promise<void> {
    const message = JSON.stringify(data);
    
    if (this.redisPub && this.isMaster) {
      // await this.redisPub.publish(`${this.channelPrefix}${event}`, message);
      this.emitter.emit(event, data);
    } else {
      // Local emit for non-distributed mode
      this.emitter.emit(event, data);
    }
  }
  
  async subscribe<K extends keyof EventMap>(
    event: K,
    handler: (data: EventMap[K]) => void
  ): Promise<void> {
    this.emitter.on(event, handler);
    
    // if (this.subscriber && !this.isMaster) {
    //   await this.subscriber.subscribe(`${this.channelPrefix}${event}`);
    // }
  }
  
  async unsubscribe<K extends keyof EventMap>(
    event: K,
    handler?: (data: EventMap[K]) => void
  ): Promise<void> {
    if (handler) {
      this.emitter.off(event, handler);
    } else {
      this.emitter.removeAllListeners(event);
    }
  }
}

// ============================================================================
// 6.4 BACKGROUND JOB QUEUE (Simplified Bull-like)
// ============================================================================

interface QueueJob {
  id: string;
  name: string;
  data: unknown;
  attempts: number;
  maxAttempts: number;
  status: "waiting" | "active" | "completed" | "failed";
  createdAt: Date;
  processedAt?: Date;
  error?: string;
}

type JobProcessor = (job: QueueJob) => Promise<void>;

class JobQueue {
  private jobs: QueueJob[] = [];
  private processors: Map<string, JobProcessor> = new Map();
  private workers: number = 1;
  private processing: Set<string> = new Set();
  
  constructor(options: { workers?: number } = {}) {
    this.workers = options.workers ?? 1;
  }
  
  /**
   * Add a job to the queue
   */
  async add(name: string, data: unknown, options: {
    jobId?: string;
    maxAttempts?: number;
  } = {}): Promise<QueueJob> {
    const job: QueueJob = {
      id: options.jobId ?? `${name}-${Date.now()}-${Math.random()}`,
      name,
      data,
      attempts: 0,
      maxAttempts: options.maxAttempts ?? 3,
      status: "waiting",
      createdAt: new Date()
    };
    
    this.jobs.push(job);
    this.processQueue();
    
    return job;
  }
  
  /**
   * Register a processor for a job type
   */
  process(name: string, processor: JobProcessor): void {
    this.processors.set(name, processor);
  }
  
  /**
   * Process jobs from the queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing.size >= this.workers) {
      return;
    }
    
    const job = this.jobs.find(j => j.status === "waiting");
    if (!job) return;
    
    job.status = "active";
    this.processing.add(job.id);
    
    try {
      const processor = this.processors.get(job.name);
      if (!processor) {
        throw new Error(`No processor registered for job: ${job.name}`);
      }
      
      await processor(job);
      
      job.status = "completed";
      job.processedAt = new Date();
    } catch (error) {
      job.attempts++;
      job.error = (error as Error).message;
      
      if (job.attempts >= job.maxAttempts) {
        job.status = "failed";
      } else {
        job.status = "waiting";
        // Requeue with backoff
        setTimeout(() => {
          this.processQueue();
        }, Math.pow(2, job.attempts) * 1000);
      }
    } finally {
      this.processing.delete(job.id);
      this.processQueue();
    }
  }
  
  /**
   * Get job counts
   */
  getCounts(): { waiting: number; active: number; completed: number; failed: number } {
    return {
      waiting: this.jobs.filter(j => j.status === "waiting").length,
      active: this.jobs.filter(j => j.status === "active").length,
      completed: this.jobs.filter(j => j.status === "completed").length,
      failed: this.jobs.filter(j => j.status === "failed").length
    };
  }
  
  /**
   * Get job by ID
   */
  getJob(id: string): QueueJob | undefined {
    return this.jobs.find(j => j.id === id);
  }
  
  /**
   * Clean up old jobs
   */
  async clean(graceMs: number = 3600000): Promise<number> {
    const cutoff = Date.now() - graceMs;
    const before = this.jobs.length;
    
    this.jobs = this.jobs.filter(j => 
      j.status === "active" || 
      (j.status === "completed" && j.createdAt.getTime() > cutoff)
    );
    
    return before - this.jobs.length;
  }
}

// ============================================================================
// 6.5 CRON JOB SCHEDULER
// ============================================================================

interface CronSchedule {
  cronExpression: string;  // minute hour day-of-month month day-of-week
  name: string;
  handler: () => Promise<void>;
}

class CronScheduler {
  private schedules: Map<string, CronSchedule> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  
  /**
   * Parse cron expression and calculate next run
   */
  private parseCron(expression: string): { nextRun: Date } {
    // Simplified parser - production would use cron-parser
    const parts = expression.split(" ");
    if (parts.length !== 5) {
      throw new Error("Invalid cron expression");
    }
    
    const now = new Date();
    const next = new Date(now);
    
    // Set to next minute
    next.setSeconds(0);
    next.setMilliseconds(0);
    next.setMinutes(next.getMinutes() + 1);
    
    return { nextRun: next };
  }
  
  /**
   * Schedule a cron job
   */
  schedule(cronExpression: string, name: string, handler: () => Promise<void>): void {
    const schedule: CronSchedule = {
      cronExpression,
      name,
      handler
    };
    
    this.schedules.set(name, schedule);
    
    const { nextRun } = this.parseCron(cronExpression);
    const delay = nextRun.getTime() - Date.now();
    
    const interval = setTimeout(async () => {
      await handler();
      // Reschedule
      this.schedule(cronExpression, name, handler);
    }, delay);
    
    this.intervals.set(name, interval);
  }
  
  /**
   * Cancel a scheduled job
   */
  cancel(name: string): void {
    const interval = this.intervals.get(name);
    if (interval) {
      clearTimeout(interval);
      this.intervals.delete(name);
    }
    this.schedules.delete(name);
  }
  
  /**
   * Get all scheduled jobs
   */
  getSchedules(): CronSchedule[] {
    return Array.from(this.schedules.values());
  }
}

// ============================================================================
// EXERCISES
// ============================================================================

/**
 * Exercise 6.1: Implement a Circuit Breaker
 */
class CircuitBreaker {
  private failures: number = 0;
  private lastFailure: Date | null = null;
  private state: "closed" | "open" | "half-open" = "closed";
  private threshold: number;
  private timeout: number;
  
  constructor(options: { failureThreshold?: number; timeoutMs?: number } = {}) {
    this.threshold = options.failureThreshold ?? 5;
    this.timeout = options.timeoutMs ?? 30000;
  }
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - (this.lastFailure?.getTime() ?? 0) > this.timeout) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit breaker is open");
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failures = 0;
    this.state = "closed";
  }
  
  private onFailure(): void {
    this.failures++;
    this.lastFailure = new Date();
    
    if (this.failures >= this.threshold) {
      this.state = "open";
    }
  }
  
  getState(): typeof this.state {
    return this.state;
  }
}

/**
 * Exercise 6.2: Implement a Worker Pool
 */
class WorkerPool<T, R> {
  private workers: Worker<R>[] = [];
  private queue: T[] = [];
  private results: R[] = [];
  private availableWorkers: Worker<R>[] = [];
  
  constructor(
    private workerCount: number,
    private processor: (data: T) => Promise<R>
  ) {
    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker<R>();
      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }
  
  async addTask(data: T): Promise<R> {
    const taskPromise = new Promise<R>((resolve, reject) => {
      this.queue.push({ data, resolve, reject });
      this.processQueue();
    });
    
    return taskPromise;
  }
  
  private async processQueue(): Promise<void> {
    while (this.queue.length > 0 && this.availableWorkers.length > 0) {
      const task = this.queue.shift()!;
      const worker = this.availableWorkers.shift()!;
      
      try {
        const result = await this.processor(task.data);
        task.resolve(result);
      } catch (error) {
        task.reject(error as Error);
      } finally {
        this.availableWorkers.push(worker);
        this.processQueue();
      }
    }
  }
  
  async shutdown(): Promise<void> {
    // Cleanup workers
    this.workers = [];
    this.availableWorkers = [];
    this.queue = [];
  }
}

interface Worker<R> {
  id: number;
}

// ============================================================================
// TESTS
// ============================================================================

describe("Module 6: Asynchronous Programming", () => {
  describe("Retry with backoff", () => {
    test("succeeds on first attempt", async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        return "success";
      };
      
      const result = await retry(fn, { maxAttempts: 3 });
      expect(result).toBe("success");
      expect(attempts).toBe(1);
    });
    
    test("retries on failure", async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error("Temporary failure");
        }
        return "success";
      };
      
      const result = await retry(fn, { maxAttempts: 3 });
      expect(result).toBe("success");
      expect(attempts).toBe(3);
    });
    
    test("throws after max attempts", async () => {
      const fn = async () => {
        throw new Error("Always fails");
      };
      
      await expect(retry(fn, { maxAttempts: 2 })).rejects.toThrow("Always fails");
    });
  });
  
  describe("Parallel processing", () => {
    test("processes items in parallel with limit", async () => {
      const items = [1, 2, 3, 4, 5];
      const processed: number[] = [];
      
      const result = await parallel(
        items,
        async (item) => {
          await sleep(50);
          processed.push(item);
          return item * 2;
        },
        { concurrency: 2 }
      );
      
      expect(result).toEqual([2, 4, 6, 8, 10]);
      expect(processed.length).toBe(5);
    });
  });
  
  describe("Batch processing", () => {
    test("processes items in batches", async () => {
      const items = [1, 2, 3, 4, 5, 6, 7];
      const batches: number[][] = [];
      
      const result = await batchProcess(
        items,
        async (batch) => {
          batches.push(batch);
          return batch.map(x => x * 2);
        },
        { batchSize: 3 }
      );
      
      expect(batches).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
      expect(result).toEqual([2, 4, 6, 8, 10, 12, 14]);
    });
  });
  
  describe("Job Queue", () => {
    test("adds and processes jobs", async () => {
      const queue = new JobQueue({ workers: 1 });
      let processed = false;
      
      queue.process("test-job", async (job) => {
        processed = true;
      });
      
      await queue.add("test-job", { test: "data" });
      
      // Wait for processing
      await sleep(100);
      
      expect(processed).toBe(true);
    });
    
    test("retries failed jobs", async () => {
      const queue = new JobQueue({ workers: 1 });
      let attempts = 0;
      
      queue.process("failing-job", async (job) => {
        attempts++;
        throw new Error("Test failure");
      });
      
      await queue.add("failing-job", {}, { maxAttempts: 3 });
      await sleep(500);
      
      expect(attempts).toBe(3);
      expect(queue.getCounts().failed).toBe(1);
    });
  });
  
  describe("Circuit Breaker", () => {
    test("executes successfully when closed", async () => {
      const breaker = new CircuitBreaker({ failureThreshold: 3 });
      
      const result = await breaker.execute(async () => "success");
      expect(result).toBe("success");
      expect(breaker.getState()).toBe("closed");
    });
    
    test("opens after threshold failures", async () => {
      const breaker = new CircuitBreaker({ failureThreshold: 2, timeoutMs: 1000 });
      
      await expect(breaker.execute(async () => {
        throw new Error("Fail");
      })).rejects.toThrow();
      
      await expect(breaker.execute(async () => {
        throw new Error("Fail");
      })).rejects.toThrow();
      
      expect(breaker.getState()).toBe("open");
      
      // Should throw immediately when open
      await expect(breaker.execute(async () => "success")).rejects.toThrow("Circuit breaker is open");
    });
  });
});

export { 
  retry, 
  sleep, 
  parallel, 
  batchProcess, 
  debounceAsync,
  rateLimitAsync,
  AtlasEventEmitter,
  EventBus,
  JobQueue,
  CronScheduler,
  CircuitBreaker,
  WorkerPool
};
