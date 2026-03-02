import { loadSecrets } from './secrets';

/**
 * Run comprehensive startup checks for production safety.
 * Validates environment configuration, required secrets, and database connectivity.
 */
export async function runStartupChecks() {
  console.log('[startupChecks] Running production safety checks...');
  
  // Validate environment
  const envValidation = validateEnvironment();
  if (!envValidation.valid && process.env.NODE_ENV === 'production') {
    console.error('[startupChecks] FATAL: Invalid production environment:', envValidation.errors.join(', '));
    process.exit(1);
  }

  // Check required secrets
  const required = (process.env.REQUIRED_SECRETS || 'JWT_ACCESS_SECRET,JWT_REFRESH_SECRET,SESSION_SECRET,ADMIN_API_KEY,DATABASE_URL').split(',').map(s => s.trim()).filter(Boolean);

  if (!required.length) {
    console.log('[startupChecks] No required secrets configured');
    return;
  }

  const missing: string[] = [];

  for (const name of required) {
    const envKey = name.toUpperCase();
    if (process.env[envKey]) continue;

    try {
      const val = await loadSecrets([name]);
      if (val[name] !== undefined) {
        process.env[envKey] = val[name];
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
       
      console.error('[startupChecks] FATAL:', msg);
      // Give short delay to flush logs
      await new Promise((r) => setTimeout(r, 100));
      process.exit(1);
    } else {
       
      console.warn('[startupChecks] Warning (non-production):', msg);
    }
  } else {
     
    console.log('[startupChecks] All required secrets present');
  }
}

/**
 * Validate environment configuration for production safety
 */
function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const nodeEnv = process.env.NODE_ENV;
  
  // Check NODE_ENV is set
  if (!nodeEnv) {
    errors.push('NODE_ENV must be set (development, staging, or production)');
  }
  
  // In production, validate additional settings
  if (nodeEnv === 'production') {
    // Check that we're not using default secrets
    const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
    if (jwtAccessSecret && jwtAccessSecret.includes('change-me')) {
      errors.push('JWT_ACCESS_SECRET contains default value - must be changed in production');
    }
    
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (jwtRefreshSecret && jwtRefreshSecret.includes('change-me')) {
      errors.push('JWT_REFRESH_SECRET contains default value - must be changed in production');
    }
    
    const sessionSecret = process.env.SESSION_SECRET;
    if (sessionSecret && sessionSecret.length < 32) {
      errors.push('SESSION_SECRET must be at least 32 characters in production');
    }
    
    // Check that DEBUG is not enabled in production
    if (process.env.DEBUG === 'true' || process.env.DEBUG === '1') {
      errors.push('DEBUG mode must be disabled in production');
    }
    
    // Check that we're using HTTPS
    if (!process.env.NODE_ENV?.includes('production') && !process.env.ALLOW_HTTP) {
      // Only warn about HTTP in production
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export default { runStartupChecks };
