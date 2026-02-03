/**
 * Rate Limiting Service
 * 
 * Provides token bucket and sliding window rate limiting algorithms for API protection.
 */

import { query } from '../db';

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstSize?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter: number;
}

export interface TokenBucket {
  tokens: number;
  lastRefill: Date;
}

export interface SlidingWindowCounter {
  window: number;
  requests: number[];
}

export class RateLimitingService {
  private tokenBuckets: Map<string, TokenBucket> = new Map();
  private slidingWindows: Map<string, SlidingWindowCounter> = new Map();

  /**
   * Token bucket algorithm
   * Allows bursts up to burstSize, then refills at a constant rate
   */
  async checkTokenBucket(
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = new Date();
    const bucket = this.tokenBuckets.get(identifier);

    if (!bucket) {
      // Initialize new bucket
      this.tokenBuckets.set(identifier, {
        tokens: config.burstSize || config.requestsPerMinute,
        lastRefill: now,
      });
    }

    // Calculate time passed since last refill
    const timePassed = (now.getTime() - bucket.lastRefill.getTime()) / 1000; // in seconds

    // Refill tokens based on rate
    const tokensToAdd = Math.floor(timePassed * (config.requestsPerMinute / 60));
    bucket.tokens = Math.min(config.burstSize || config.requestsPerMinute, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check if request is allowed
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return {
        allowed: true,
        remaining: bucket.tokens,
        resetAt: new Date(bucket.lastRefill.getTime() + 60000), // Next minute
        retryAfter: 0,
      };
    }

    // Calculate when tokens will be available
    const tokensPerSecond = config.requestsPerMinute / 60;
    const retryAfter = Math.ceil((1 - bucket.tokens) / tokensPerSecond);

    return {
      allowed: false,
      remaining: bucket.tokens,
      resetAt: new Date(bucket.lastRefill.getTime() + 60000),
      retryAfter,
    };
  }

  /**
   * Sliding window algorithm
   * Tracks requests in a time window and allows if under limit
   */
  async checkSlidingWindow(
    identifier: string,
    windowSize: number,
    maxRequests: number
  ): Promise<RateLimitResult> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowSize * 1000);

    const counter = this.slidingWindows.get(identifier);

    if (!counter) {
      // Initialize new counter
      this.slidingWindows.set(identifier, {
        window: windowSize,
        requests: [],
      });
    }

    // Remove requests outside the window
    counter.requests = counter.requests.filter(
      timestamp => new Date(timestamp).getTime() >= windowStart.getTime()
    );

    // Check if request is allowed
    if (counter.requests.length < maxRequests) {
      counter.requests.push(now.toISOString());
      return {
        allowed: true,
        remaining: maxRequests - counter.requests.length,
        resetAt: new Date(windowStart.getTime() + windowSize * 1000),
        retryAfter: 0,
      };
    }

    // Calculate when oldest request will expire
    const oldestRequest = counter.requests[0];
    const oldestTime = new Date(oldestRequest).getTime();
    const windowEndTime = new Date(oldestTime + windowSize * 1000);
    const retryAfter = Math.ceil((windowEndTime.getTime() - now.getTime()) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetAt: windowEndTime,
      retryAfter,
    };
  }

  /**
   * Check rate limit using both algorithms
   * Uses token bucket for burst handling and sliding window for sustained rate
   */
  async checkRateLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    // First check token bucket (allows bursts)
    const bucketResult = await this.checkTokenBucket(identifier, config);

    if (bucketResult.allowed) {
      return bucketResult;
    }

    // If bucket is empty, check sliding window
    const windowResult = await this.checkSlidingWindow(
      identifier,
      60, // 1 minute window
      config.requestsPerMinute
    );

    return windowResult;
  }

  /**
   * Record rate limit hit
   */
  async recordRateLimitHit(
    identifier: string,
    ipAddress: string,
    endpoint: string,
    method: string
  ): Promise<void> {
    await query(
      `INSERT INTO rate_limit_hits (
        identifier, ip_address, endpoint, method, timestamp
      ) VALUES ($1, $2, $3, $4, NOW())`,
      [identifier, ipAddress, endpoint, method]
    );
  }

  /**
   * Get rate limit statistics for an identifier
   */
  async getRateLimitStatistics(
    identifier: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalHits: number;
    blockedHits: number;
    hitsByHour: Record<string, number>;
    topIPs: Array<{ ipAddress: string; hits: number }>;
  }> {
    const result = await query(
      `SELECT 
        COUNT(*) as total_hits,
        COUNT(CASE WHEN blocked = true THEN 1 END) as blocked_hits
       FROM rate_limit_hits
       WHERE identifier = $1
         AND timestamp >= $2
         AND timestamp <= $3`,
      [identifier, startDate, endDate]
    );

    const stats = result[0];

    // Get hits by hour
    const hourResult = await query(
      `SELECT 
        DATE_TRUNC('hour', timestamp) as hour,
        COUNT(*) as hits
       FROM rate_limit_hits
       WHERE identifier = $1
         AND timestamp >= $2
         AND timestamp <= $3
       GROUP BY hour
       ORDER BY hour DESC
       LIMIT 24`,
      [identifier, startDate, endDate]
    );

    const hitsByHour: Record<string, number> = {};
    hourResult.forEach((row: any) => {
      hitsByHour[row.hour] = parseInt(row.hits);
    });

    // Get top IPs by hit count
    const ipResult = await query(
      `SELECT 
        ip_address,
        COUNT(*) as hits
       FROM rate_limit_hits
       WHERE identifier = $1
         AND timestamp >= $2
         AND timestamp <= $3
       GROUP BY ip_address
       ORDER BY hits DESC
       LIMIT 10`,
      [identifier, startDate, endDate]
    );

    const topIPs = ipResult.map((row: any) => ({
      ipAddress: row.ip_address,
      hits: parseInt(row.hits),
    }));

    return {
      totalHits: parseInt(stats.total_hits),
      blockedHits: parseInt(stats.blocked_hits),
      hitsByHour,
      topIPs,
    };
  }

  /**
   * Clean up old rate limit records
   */
  async cleanupOldRecords(daysToKeep: number = 30): Promise<number> {
    const result = await query(
      `DELETE FROM rate_limit_hits 
       WHERE timestamp < NOW() - INTERVAL '${daysToKeep} days'
       RETURNING id`
    );

    return result.length;
  }

  /**
   * Reset rate limit for an identifier
   */
  async resetRateLimit(identifier: string): Promise<void> {
    this.tokenBuckets.delete(identifier);
    this.slidingWindows.delete(identifier);
  }

  /**
   * Get all active rate limiters
   */
  async getActiveLimiters(): Promise<string[]> {
    const result = await query(
      `SELECT DISTINCT identifier FROM rate_limit_hits 
       WHERE timestamp > NOW() - INTERVAL '1' hour`
    );

    return result.map((row: any) => row.identifier);
  }
}

// Export singleton instance
export const rateLimitingService = new RateLimitingService();
