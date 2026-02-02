import { query } from './db';
import redis from './redisClient';

// Timeout helper
function withTimeout<T>(p: Promise<T>, ms = 2000): Promise<T> {
  const timeout = new Promise<T>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
  return Promise.race([p, timeout]);
}

export async function checkReadiness(): Promise<{ ok: boolean; details: any }> {
  const details: any = { db: false, redis: false };

  // Check DB
  try {
    await withTimeout(query('SELECT 1'), 2000);
    details.db = true;
  } catch (err: any) {
    details.db = false;
    details.dbError = err.message || String(err);
  }

  // Check Redis (if configured)
  try {
    if (process.env.REDIS_URL) {
      const res = await withTimeout(redis.ping(), 1500);
      details.redis = res === 'PONG' || res === 'OK' || !!res;
    } else {
      details.redis = 'not-configured';
    }
  } catch (err: any) {
    details.redis = false;
    details.redisError = err.message || String(err);
  }

  const ok = details.db === true && (details.redis === true || details.redis === 'not-configured');
  return { ok, details };
}

export default { checkReadiness };
