import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redis = new Redis(redisUrl);

redis.on('connect', () => {
  // eslint-disable-next-line no-console
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Redis error', err.message || err);
});

export default redis;
