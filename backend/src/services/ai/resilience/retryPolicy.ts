/**
 * Retry Policy Implementation
 * 
 * Implements configurable retry logic with exponential backoff and jitter
 * for handling transient failures in AI provider calls.
 */

import { RetryConfig, RetryExhaustedError } from '../types';

/**
 * Retry Policy with exponential backoff
 */
export class RetryPolicy {
  private readonly defaultConfig: Required<RetryConfig>;

  constructor(config?: Partial<RetryConfig>) {
    this.defaultConfig = {
      maxRetries: config?.maxRetries ?? 3,
      baseDelay: config?.baseDelay ?? 1000,
      maxDelay: config?.maxDelay ?? 30000,
      backoffMultiplier: config?.backoffMultiplier ?? 2,
      jitter: config?.jitter ?? 0.1,
      retryOnStatusCodes: config?.retryOnStatusCodes ?? [429, 500, 502, 503, 504],
      retryOnErrors: config?.retryOnErrors ?? []
    };
  }

  /**
   * Execute a function with retry logic
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;
    let attempt = 0;

    while (attempt <= this.defaultConfig.maxRetries) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        attempt++;

        // Check if we should retry
        if (!this.shouldRetry(lastError, attempt)) {
          throw lastError;
        }

        // Check if we've exhausted retries
        if (attempt > this.defaultConfig.maxRetries) {
          throw new RetryExhaustedError(
            `Retry attempts exhausted after ${attempt} attempts`,
            this.getProviderId(lastError),
            attempt,
            lastError
          );
        }

        // Calculate and wait before retry
        const delay = this.calculateDelay(attempt);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Determine if an error should trigger a retry
   */
  private shouldRetry(error: Error, attempt: number): boolean {
    // Don't retry if we've exceeded max attempts
    if (attempt > this.defaultConfig.maxRetries) {
      return false;
    }

    // Check status code if available
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode && !this.defaultConfig.retryOnStatusCodes.includes(statusCode)) {
      return false;
    }

    // Check if error type is in the non-retryable list
    const errorType = error.constructor.name;
    if (this.defaultConfig.retryOnErrors.includes(errorType)) {
      return false;
    }

    // Don't retry on authentication errors
    if (errorType === 'AuthenticationError' || errorType === 'AIError') {
      const code = (error as { code?: string }).code;
      if (code === 'AUTHENTICATION_ERROR' || code === 'INVALID_REQUEST') {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number): number {
    // Exponential backoff
    const delay = this.defaultConfig.baseDelay * 
      Math.pow(this.defaultConfig.backoffMultiplier, attempt - 1);

    // Cap at max delay
    const cappedDelay = Math.min(delay, this.defaultConfig.maxDelay);

    // Add jitter (±10% by default)
    const jitterAmount = cappedDelay * (this.defaultConfig.jitter || 0.1);
    const jitter = (Math.random() - 0.5) * 2 * jitterAmount;

    return Math.max(0, Math.floor(cappedDelay + jitter));
  }

  /**
   * Sleep for a given duration
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get provider ID from error for retry exhausted error
   */
  private getProviderId(error: Error): string {
    return (error as { provider?: string }).provider || 'unknown';
  }
}

/**
 * Adaptive Retry Policy
 * Adjusts retry parameters based on observed behavior
 */
export class AdaptiveRetryPolicy extends RetryPolicy {
  private successCount: number = 0;
  private failureCount: number = 0;
  private observedDelays: number[] = [];
  private readonly windowSize: number = 100;

  constructor(config?: Partial<RetryConfig>) {
    super(config);
  }

  /**
   * Execute with adaptive retry
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await super.execute(fn);
      this.recordSuccess(Date.now() - startTime);
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Record a successful request
   */
  private recordSuccess(duration: number): void {
    this.successCount++;
    this.observedDelays.push(duration);

    // Keep only recent observations
    if (this.observedDelays.length > this.windowSize) {
      this.observedDelays.shift();
    }
  }

  /**
   * Record a failed request
   */
  private recordFailure(): void {
    this.failureCount++;
  }

  /**
   * Get observed latency statistics
   */
  getLatencyStats(): { avg: number; p50: number; p95: number; p99: number } {
    if (this.observedDelays.length === 0) {
      return { avg: 0, p50: 0, p95: 0, p99: 0 };
    }

    const sorted = [...this.observedDelays].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const avg = sum / sorted.length;

    const percentile = (p: number): number => {
      const index = Math.floor(sorted.length * (p / 100));
      return sorted[Math.min(index, sorted.length - 1)];
    };

    return {
      avg,
      p50: percentile(50),
      p95: percentile(95),
      p99: percentile(99)
    };
  }

  /**
   * Get success rate
   */
  getSuccessRate(): number {
    const total = this.successCount + this.failureCount;
    if (total === 0) return 1;
    return this.successCount / total;
  }
}

/**
 * Rate Limited Retry Policy
 * Incorporates rate limit information into retry decisions
 */
export class RateLimitedRetryPolicy extends RetryPolicy {
  private rateLimitReset?: number;
  private remainingRequests: number = 0;

  constructor(config?: Partial<RetryConfig>) {
    super(config);
  }

  /**
   * Set rate limit information from response
   */
  setRateLimitInfo(resetAt: number, remaining: number): void {
    this.rateLimitReset = resetAt;
    this.remainingRequests = remaining;
  }

  /**
   * Execute with rate limit awareness
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // If we're rate limited, wait for reset
    if (this.rateLimitReset && this.rateLimitReset > Date.now()) {
      const waitTime = this.rateLimitReset - Date.now();
      await this.sleep(waitTime);
      this.rateLimitReset = undefined;
    }

    return super.execute(fn);
  }
}
