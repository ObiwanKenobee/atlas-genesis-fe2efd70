import Redis from 'ioredis';
import { logger } from './utils/logger';

const redisUrl = process.env.REDIS_URL;

// Only connect to Redis when a URL is explicitly configured.
// In development without Redis, all cache operations fall through to the
// data source directly — no errors, no noise.
const redisOptions = {
  lazyConnect: true,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 0,
  retryStrategy: (times: number) => {
    // Give up after 3 attempts; don't spam logs in dev
    if (times >= 3) return null;
    return Math.min(times * 200, 2000);
  },
};

export const redis = redisUrl
  ? new Redis(redisUrl, redisOptions)
  : new Redis({ ...redisOptions, host: '127.0.0.1', port: 6379 });

let redisAvailable = false;

if (redisUrl) {
  redis.connect().catch(() => { /* handled below */ });
}

redis.on('ready', () => {
  redisAvailable = true;
  console.log('[redis] Connected');
});

redis.on('error', (err) => {
  if (redisAvailable) {
    console.error('[redis] Error', err.message);
  }
  redisAvailable = false;
});

/**
 * Cache data with Redis
 */
export async function cacheWithRedis<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  if (!redisAvailable) return fetchFn();
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
    const data = await fetchFn();
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    return data;
  } catch {
    return fetchFn();
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (!redisAvailable) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // silent
  }
}

export default redis;
