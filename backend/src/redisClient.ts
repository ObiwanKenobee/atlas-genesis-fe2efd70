import Redis from 'ioredis';
import { logger } from './utils/logger';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redis = new Redis(redisUrl);

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis error', err.message || err);
});

/**
 * Cache data with Redis
 */
export async function cacheWithRedis<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await fetchFn();
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    return data;
  } catch (error) {
    logger.error('Redis cache error', { key, error });
    return fetchFn();
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logger.error('Redis cache invalidation error', { pattern, error });
  }
}

export default redis;
