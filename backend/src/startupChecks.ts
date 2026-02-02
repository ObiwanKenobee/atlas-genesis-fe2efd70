import secrets from './secrets';

/**
 * Run startup checks for required secrets.
 * - If a secret is present in process.env it's used.
 * - Otherwise attempts to fetch from Key Vault via `secrets.getSecret`.
 * - In production, missing required secrets cause process exit(1).
 */
export async function runStartupChecks() {
  const required = (process.env.REQUIRED_SECRETS || 'JWT_ACCESS_SECRET,JWT_REFRESH_SECRET,SESSION_SECRET,ADMIN_API_KEY,DATABASE_URL').split(',').map(s => s.trim()).filter(Boolean);

  if (!required.length) return;

  const missing: string[] = [];

  for (const name of required) {
    const envKey = name.toUpperCase();
    if (process.env[envKey]) continue;

    try {
      const val = await secrets.getSecret(name);
      if (val !== undefined) {
        process.env[envKey] = val;
        continue;
      }
    } catch (err) {
      // ignore per-secret errors
    }

    missing.push(envKey);
  }

  if (missing.length > 0) {
    const msg = `Missing required secrets: ${missing.join(', ')}`;
    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line no-console
      console.error('[startupChecks] FATAL:', msg);
      // Give short delay to flush logs
      await new Promise((r) => setTimeout(r, 100));
      process.exit(1);
    } else {
      // eslint-disable-next-line no-console
      console.warn('[startupChecks] Warning (non-production):', msg);
    }
  } else {
    // eslint-disable-next-line no-console
    console.log('[startupChecks] All required secrets present');
  }
}

export default { runStartupChecks };
