/**
 * Rate Limiting Management Service
 * 
 * Provides management capabilities for rate limiting configuration,
 * including custom limits per endpoint, user, and IP.
 */

import redisClient from '../redisClient';
import crypto from 'crypto';

export interface RateLimitConfig {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  windowMs: number;
  maxRequests: number;
  burstMax?: number;
  burstWindowMs?: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRateLimit {
  userId: string;
  endpoint: string;
  windowMs: number;
  maxRequests: number;
  expiresAt: Date;
}

export interface IPRateLimit {
  ip: string;
  endpoint: string;
  windowMs: number;
  maxRequests: number;
  expiresAt: Date;
  reason?: string;
}

export interface RateLimitStats {
  endpoint: string;
  totalRequests: number;
  blockedRequests: number;
  uniqueUsers: number;
  uniqueIPs: number;
  lastUpdated: Date;
}

class RateLimitingManagementService {
  private readonly RATE_LIMIT_PREFIX = 'ratelimit:config:';
  private readonly USER_LIMIT_PREFIX = 'ratelimit:user:';
  private readonly IP_LIMIT_PREFIX = 'ratelimit:ip:';
  private readonly STATS_PREFIX = 'ratelimit:stats:';
  private readonly DEFAULT_WINDOW = 15 * 60 * 1000; // 15 minutes
  private readonly DEFAULT_MAX = 100;

  // Default rate limit configurations
  private defaultConfigs: RateLimitConfig[] = [
    {
      id: 'general',
      name: 'General API',
      endpoint: '/api/*',
      method: 'ALL',
      windowMs: this.DEFAULT_WINDOW,
      maxRequests: this.DEFAULT_MAX,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'auth',
      name: 'Authentication',
      endpoint: '/api/auth/*',
      method: 'POST',
      windowMs: 15 * 60 * 1000,
      maxRequests: 5,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'payments',
      name: 'Payments',
      endpoint: '/api/payments/*',
      method: 'ALL',
      windowMs: 60 * 60 * 1000,
      maxRequests: 10,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'marketplace',
      name: 'Marketplace',
      endpoint: '/api/marketplace/*',
      method: 'ALL',
      windowMs: 60 * 1000,
      maxRequests: 30,
      burstMax: 10,
      burstWindowMs: 10 * 1000,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  /**
   * Get all rate limit configurations
   */
  async getConfigs(): Promise<RateLimitConfig[]> {
    // Try Redis first
    try {
      const configs = await redisClient.hgetall(this.RATE_LIMIT_PREFIX);
      if (Object.keys(configs).length > 0) {
        return Object.values(configs).map(c => JSON.parse(c));
      }
    } catch {
      // Ignore Redis errors
    }

    // Return defaults if none in Redis
    return this.defaultConfigs;
  }

  /**
   * Get a specific configuration
   */
  async getConfig(id: string): Promise<RateLimitConfig | null> {
    try {
      const config = await redisClient.hget(this.RATE_LIMIT_PREFIX, id);
      if (config) {
        return JSON.parse(config);
      }
    } catch {
      // Ignore Redis errors
    }

    return this.defaultConfigs.find(c => c.id === id) || null;
  }

  /**
   * Create or update a rate limit configuration
   */
  async upsertConfig(config: Partial<RateLimitConfig>): Promise<RateLimitConfig> {
    const id = config.id || crypto.randomUUID();
    const now = new Date();

    const fullConfig: RateLimitConfig = {
      id,
      name: config.name || 'Custom',
      endpoint: config.endpoint || '/api/*',
      method: config.method || 'ALL',
      windowMs: config.windowMs || this.DEFAULT_WINDOW,
      maxRequests: config.maxRequests || this.DEFAULT_MAX,
      burstMax: config.burstMax,
      burstWindowMs: config.burstWindowMs,
      enabled: config.enabled !== false,
      createdAt: now,
      updatedAt: now
    };

    try {
      await redisClient.hset(this.RATE_LIMIT_PREFIX, id, JSON.stringify(fullConfig));
    } catch (error) {
      console.error('[rate-limit] Failed to save config to Redis:', error);
    }

    return fullConfig;
  }

  /**
   * Delete a configuration
   */
  async deleteConfig(id: string): Promise<boolean> {
    try {
      await redisClient.hdel(this.RATE_LIMIT_PREFIX, id);
      return true;
    } catch (error) {
      console.error('[rate-limit] Failed to delete config from Redis:', error);
      return false;
    }
  }

  /**
   * Reset configuration to defaults
   */
  async resetToDefaults(): Promise<void> {
    try {
      await redisClient.del(this.RATE_LIMIT_PREFIX);
    } catch (error) {
      console.error('[rate-limit] Failed to reset configs:', error);
    }
  }

  /**
   * Set custom rate limit for a user
   */
  async setUserLimit(
    userId: string,
    endpoint: string,
    windowMs: number,
    maxRequests: number,
    expiresInHours: number = 24
  ): Promise<UserRateLimit> {
    const limit: UserRateLimit = {
      userId,
      endpoint,
      windowMs,
      maxRequests,
      expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
    };

    const key = `${this.USER_LIMIT_PREFIX}${userId}:${endpoint}`;
    
    try {
      await redisClient.setex(key, expiresInHours * 3600, JSON.stringify(limit));
    } catch (error) {
      console.error('[rate-limit] Failed to set user limit:', error);
    }

    return limit;
  }

  /**
   * Get user rate limit
   */
  async getUserLimit(userId: string, endpoint: string): Promise<UserRateLimit | null> {
    const key = `${this.USER_LIMIT_PREFIX}${userId}:${endpoint}`;
    
    try {
      const limit = await redisClient.get(key);
      if (limit) {
        return JSON.parse(limit);
      }
    } catch (error) {
      console.error('[rate-limit] Failed to get user limit:', error);
    }

    return null;
  }

  /**
   * Remove user rate limit
   */
  async removeUserLimit(userId: string, endpoint: string): Promise<boolean> {
    const key = `${this.USER_LIMIT_PREFIX}${userId}:${endpoint}`;
    
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('[rate-limit] Failed to remove user limit:', error);
      return false;
    }
  }

  /**
   * Block an IP address
   */
  async blockIP(
    ip: string,
    endpoint: string = '*',
    durationMinutes: number = 60,
    reason?: string
  ): Promise<IPRateLimit> {
    const limit: IPRateLimit = {
      ip,
      endpoint,
      windowMs: durationMinutes * 60 * 1000,
      maxRequests: 0,
      expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000),
      reason
    };

    const key = `${this.IP_LIMIT_PREFIX}${ip}:${endpoint}`;
    
    try {
      await redisClient.setex(key, durationMinutes * 60, JSON.stringify(limit));
    } catch (error) {
      console.error('[rate-limit] Failed to block IP:', error);
    }

    return limit;
  }

  /**
   * Check if IP is blocked
   */
  async isIPBlocked(ip: string, endpoint: string = '*'): Promise<{ blocked: boolean; reason?: string }> {
    const key = `${this.IP_LIMIT_PREFIX}${ip}:${endpoint}`;
    
    try {
      const block = await redisClient.get(key);
      if (block) {
        const blockData = JSON.parse(block);
        return { blocked: true, reason: blockData.reason };
      }
    } catch (error) {
      console.error('[rate-limit] Failed to check IP block:', error);
    }

    return { blocked: false };
  }

  /**
   * Unblock an IP address
   */
  async unblockIP(ip: string, endpoint: string = '*'): Promise<boolean> {
    const key = `${this.IP_LIMIT_PREFIX}${ip}:${endpoint}`;
    
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('[rate-limit] Failed to unblock IP:', error);
      return false;
    }
  }

  /**
   * Get all blocked IPs
   */
  async getBlockedIPs(): Promise<IPRateLimit[]> {
    const pattern = `${this.IP_LIMIT_PREFIX}*`;
    
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length === 0) return [];

      const blockedIPs: IPRateLimit[] = [];
      for (const key of keys) {
        const block = await redisClient.get(key);
        if (block) {
          blockedIPs.push(JSON.parse(block));
        }
      }

      return blockedIPs;
    } catch (error) {
      console.error('[rate-limit] Failed to get blocked IPs:', error);
      return [];
    }
  }

  /**
   * Record a rate limit hit for stats
   */
  async recordHit(endpoint: string, blocked: boolean = false): Promise<void> {
    const key = `${this.STATS_PREFIX}${endpoint}`;
    const field = blocked ? 'blocked' : 'total';
    
    try {
      await redisClient.hincrby(key, field, 1);
      await redisClient.hset(key, 'lastUpdated', new Date().toISOString());
      await redisClient.expire(key, 24 * 60 * 60); // 24 hours
    } catch (error) {
      // Ignore stats errors
    }
  }

  /**
   * Get rate limit statistics for an endpoint
   */
  async getStats(endpoint: string): Promise<RateLimitStats | null> {
    const key = `${this.STATS_PREFIX}${endpoint}`;
    
    try {
      const stats = await redisClient.hgetall(key);
      if (Object.keys(stats).length === 0) {
        return null;
      }

      return {
        endpoint,
        totalRequests: parseInt(stats.total || '0'),
        blockedRequests: parseInt(stats.blocked || '0'),
        uniqueUsers: parseInt(stats.uniqueUsers || '0'),
        uniqueIPs: parseInt(stats.uniqueIPs || '0'),
        lastUpdated: new Date(stats.lastUpdated || Date.now())
      };
    } catch (error) {
      console.error('[rate-limit] Failed to get stats:', error);
      return null;
    }
  }

  /**
   * Get all endpoint statistics
   */
  async getAllStats(): Promise<RateLimitStats[]> {
    const pattern = `${this.STATS_PREFIX}*`;
    
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length === 0) return [];

      const statsList: RateLimitStats[] = [];
      for (const key of keys) {
        const stats = await redisClient.hgetall(key);
        if (Object.keys(stats).length > 0) {
          const endpoint = key.replace(this.STATS_PREFIX, '');
          statsList.push({
            endpoint,
            totalRequests: parseInt(stats.total || '0'),
            blockedRequests: parseInt(stats.blocked || '0'),
            uniqueUsers: parseInt(stats.uniqueUsers || '0'),
            uniqueIPs: parseInt(stats.uniqueIPs || '0'),
            lastUpdated: new Date(stats.lastUpdated || Date.now())
          });
        }
      }

      return statsList;
    } catch (error) {
      console.error('[rate-limit] Failed to get all stats:', error);
      return [];
    }
  }

  /**
   * Clear statistics for an endpoint
   */
  async clearStats(endpoint: string): Promise<boolean> {
    const key = `${this.STATS_PREFIX}${endpoint}`;
    
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('[rate-limit] Failed to clear stats:', error);
      return false;
    }
  }

  /**
   * Get current usage for a user on an endpoint
   */
  async getCurrentUsage(userId: string, endpoint: string, windowMs: number): Promise<number> {
    const key = `ratelimit:usage:${userId}:${endpoint}`;
    
    try {
      // Clean old entries
      const now = Date.now();
      await redisClient.zremrangebyscore(key, 0, now - windowMs);
      
      // Count current entries
      return await redisClient.zcard(key);
    } catch (error) {
      console.error('[rate-limit] Failed to get current usage:', error);
      return 0;
    }
  }

  /**
   * Increment usage counter
   */
  async incrementUsage(userId: string, endpoint: string, windowMs: number): Promise<number> {
    const key = `ratelimit:usage:${userId}:${endpoint}`;
    const now = Date.now();
    
    try {
      // Clean old entries
      await redisClient.zremrangebyscore(key, 0, now - windowMs);
      
      // Add new entry
      await redisClient.zadd(key, now, `${now}:${Math.random()}`);
      
      // Set expiry
      await redisClient.expire(key, Math.ceil(windowMs / 1000));
      
      // Return count
      return await redisClient.zcard(key);
    } catch (error) {
      console.error('[rate-limit] Failed to increment usage:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const rateLimitingService = new RateLimitingManagementService();
