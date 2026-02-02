import { query } from './db';
type Flags = Record<string, boolean>;

// Load initial flags from env: either FEATURE_FLAGS JSON or individual FEATURE_* vars
const parseEnvFlags = (): Flags => {
  const flags: Flags = {};

  if (process.env.FEATURE_FLAGS) {
    try {
      const parsed = JSON.parse(process.env.FEATURE_FLAGS);
      if (typeof parsed === 'object' && parsed !== null) {
        Object.keys(parsed).forEach((k) => {
          flags[k] = !!parsed[k];
        });
      }
    } catch (e) {
      // ignore parse errors
    }
  }

  // Scan env for FEATURE_ prefixed flags
  Object.keys(process.env).forEach((k) => {
    if (k.startsWith('FEATURE_')) {
      const name = k.replace(/^FEATURE_/, '').toLowerCase();
      const val = process.env[k];
      flags[name] = ['1', 'true', 'yes', 'on'].includes((val || '').toLowerCase());
    }
  });

  return flags;
};

// In-memory cache of flags (populated from DB at startup)
let cache: Flags = parseEnvFlags();

export const getAllFlags = async (): Promise<Flags> => {
  try {
    const res = await query('SELECT key, value FROM feature_flags');
    if (res && res.rows) {
      const dbFlags: Flags = {};
      for (const row of res.rows) {
        dbFlags[row.key] = !!row.value;
      }
      // Merge env defaults (don't override DB values)
      cache = { ...parseEnvFlags(), ...dbFlags };
      return { ...cache };
    }
  } catch (err) {
    // DB not available; fall back to env/cache
  }
  return { ...cache };
};

export const isFeatureEnabled = async (key: string): Promise<boolean> => {
  const all = await getAllFlags();
  return !!all[key];
};

export const setFeatureFlag = async (key: string, value: boolean) => {
  try {
    await query(
      `INSERT INTO feature_flags (key, value, updated_at) VALUES ($1, $2, now()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [key, value]
    );
    cache[key] = !!value;
  } catch (err) {
    // If DB not available, set in-memory cache
    cache[key] = !!value;
  }
};

// Express middleware to attach flags to request
export const attachFlagsMiddleware = async (req: any, res: any, next: any) => {
  req.featureFlags = await getAllFlags();
  next();
};

export default { getAllFlags, isFeatureEnabled, setFeatureFlag, attachFlagsMiddleware };
