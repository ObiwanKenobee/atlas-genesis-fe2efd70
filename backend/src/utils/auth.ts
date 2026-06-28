import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import { query } from '../db';

export interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  role: string;
  tenantId?: string;
  organizationId?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  mfaEnabled: boolean;
  lastLogin?: Date;
  profileData?: any;
  preferences?: any;
}

// Role hierarchy for access control
export const roleHierarchy = {
  'admin': 5,
  'moderator': 4,
  'institution': 3,
  'investor': 3,
  'researcher': 3,
  'producer': 2,
  'user': 1
};

// Role-specific capabilities
export const roleCapabilities = {
  'producer': ['view_projects', 'apply_for_funding', 'submit_measurements', 'access_educational_resources'],
  'investor': ['view_projects', 'invest', 'track_portfolio', 'access_impact_reports'],
  'institution': ['view_projects', 'fund_projects', 'monitor_compliance', 'access_admin_dashboard'],
  'researcher': ['view_data', 'submit_research', 'collaborate', 'access_api'],
  'admin': ['all'],
  'moderator': ['moderate_content', 'manage_users', 'monitor_system']
};

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  type: 'access' | 'refresh';
  version?: number;
  familyId?: string;
  deviceFingerprint?: string;
  iss?: string;
  aud?: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenData {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  revoked: boolean;
}

// JWT Secret management with production-safe configuration
function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Required environment variable ${name} is not set in production`);
    }
    // Generate a secure random secret for development
    return require('crypto').randomBytes(64).toString('hex');
  }
  return value;
}

const JWT_ACCESS_SECRET = getEnvOrThrow('JWT_ACCESS_SECRET');
const JWT_REFRESH_SECRET = getEnvOrThrow('JWT_REFRESH_SECRET');
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const JWT_ISSUER = process.env.JWT_ISSUER || 'atlas-genesis-api';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'atlas-genesis-client';

// Session management configuration
const MAX_CONCURRENT_SESSIONS = parseInt(process.env.MAX_CONCURRENT_SESSIONS || '5');
const SESSION_TIMEOUT_MS = parseInt(process.env.SESSION_TIMEOUT_MS || (24 * 60 * 60 * 1000).toString()); // 24 hours

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// JWT token generation
export const generateAccessToken = (payload: Omit<TokenPayload, 'type' | 'iat' | 'exp'>): string => {
  const tokenPayload: TokenPayload = {
    ...payload,
    type: 'access'
  };
  return jwt.sign(tokenPayload, JWT_ACCESS_SECRET as string, { expiresIn: JWT_ACCESS_EXPIRES_IN as any });
};

export const generateRefreshToken = (payload: Omit<TokenPayload, 'type' | 'iat' | 'exp'>): string => {
  const tokenPayload: TokenPayload = {
    ...payload,
    type: 'refresh'
  };
  return jwt.sign(tokenPayload, JWT_REFRESH_SECRET as string, { expiresIn: JWT_REFRESH_EXPIRES_IN as any });
};

// JWT token verification
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};

// Refresh token management
export const createRefreshToken = async (userId: string, deviceInfo?: any): Promise<RefreshTokenData> => {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const result = await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at, device_info) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, token, expiresAt, deviceInfo || {}]
  );

  return {
    id: result.rows[0].id,
    userId: result.rows[0].user_id,
    token: result.rows[0].token,
    expiresAt: result.rows[0].expires_at,
    revoked: result.rows[0].revoked
  };
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await query('UPDATE refresh_tokens SET revoked = true WHERE token = $1', [token]);
};

export const revokeAllUserRefreshTokens = async (userId: string): Promise<void> => {
  await query('UPDATE refresh_tokens SET revoked = true WHERE user_id = $1', [userId]);
};

export const findRefreshToken = async (token: string): Promise<RefreshTokenData | null> => {
  const result = await query(
    'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = false AND expires_at > NOW()',
    [token]
  );

  if (result.rowCount === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    token: row.token,
    expiresAt: row.expires_at,
    revoked: row.revoked
  };
};

// Concurrent session management
export const getActiveSessionsCount = async (userId: string): Promise<number> => {
  const result = await query(
    'SELECT COUNT(*) as count FROM refresh_tokens WHERE user_id = $1 AND revoked = false AND expires_at > NOW()',
    [userId]
  );
  return parseInt(result.rows[0].count);
};

export const enforceConcurrentSessionLimit = async (userId: string): Promise<void> => {
  const activeCount = await getActiveSessionsCount(userId);

  if (activeCount >= MAX_CONCURRENT_SESSIONS) {
    // Revoke oldest sessions to make room for new one
    const sessionsToRevoke = activeCount - MAX_CONCURRENT_SESSIONS + 1;
    await query(
      `UPDATE refresh_tokens
       SET revoked = true
       WHERE user_id = $1 AND revoked = false AND expires_at > NOW()
       ORDER BY created_at ASC
       LIMIT $2`,
      [userId, sessionsToRevoke]
    );
  }
};

// Session timeout and cleanup
export const cleanupExpiredSessions = async (): Promise<void> => {
  await query('UPDATE refresh_tokens SET revoked = true WHERE expires_at <= NOW()');
  await query('DELETE FROM user_sessions WHERE expires_at <= NOW()');
};

// Session invalidation on logout
export const invalidateAllUserSessions = async (userId: string): Promise<void> => {
  await query('UPDATE refresh_tokens SET revoked = true WHERE user_id = $1', [userId]);
  await query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
};

// Email verification tokens
export const createEmailVerificationToken = async (userId: string): Promise<string> => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await query(
    'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );

  return token;
};

export const verifyEmailToken = async (token: string): Promise<string | null> => {
  const result = await query(
    'SELECT user_id FROM email_verification_tokens WHERE token = $1 AND used = false AND expires_at > NOW()',
    [token]
  );

  if (result.rowCount === 0) return null;

  const userId = result.rows[0].user_id;

  // Mark token as used
  await query('UPDATE email_verification_tokens SET used = true WHERE token = $1', [token]);

  return userId;
};

// Password reset tokens
export const createPasswordResetToken = async (userId: string): Promise<string> => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await query(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );

  return token;
};

export const verifyPasswordResetToken = async (token: string): Promise<string | null> => {
  const result = await query(
    'SELECT user_id FROM password_reset_tokens WHERE token = $1 AND used = false AND expires_at > NOW()',
    [token]
  );

  if (result.rowCount === 0) return null;

  const userId = result.rows[0].user_id;

  // Mark token as used
  await query('UPDATE password_reset_tokens SET used = true WHERE token = $1', [token]);

  return userId;
};

// User session management
export const createUserSession = async (
  userId: string,
  sessionToken: string,
  refreshTokenId: string,
  deviceInfo?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await query(
    `INSERT INTO user_sessions
     (user_id, session_token, refresh_token_id, device_info, ip_address, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId, sessionToken, refreshTokenId, deviceInfo || {}, ipAddress, userAgent, expiresAt]
  );
};

export const findUserSession = async (sessionToken: string): Promise<any | null> => {
  const result = await query(
    'SELECT * FROM user_sessions WHERE session_token = $1 AND expires_at > NOW()',
    [sessionToken]
  );

  return result.rowCount > 0 ? result.rows[0] : null;
};

export const updateUserSessionActivity = async (sessionId: string): Promise<void> => {
  await query('UPDATE user_sessions SET last_activity = NOW() WHERE id = $1', [sessionId]);
};

// Role-based access control helpers
export const checkPermission = (userRole: string, requiredRole: string): boolean => {
  return (roleHierarchy[userRole as keyof typeof roleHierarchy] || 0) >=
         (roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0);
};

// Alias for verifyRole used in routes
export const verifyRole = (userRole: string, requiredRole: string): boolean => {
  return checkPermission(userRole, requiredRole);
};

export const hasCapability = (userRole: string, capability: string): boolean => {
  const capabilities = roleCapabilities[userRole as keyof typeof roleCapabilities];
  return capabilities && (capabilities.includes('all') || capabilities.includes(capability));
};

export const checkTenantAccess = (userTenantId: string | null, resourceTenantId: string | null): boolean => {
  // If no tenant isolation, allow access
  if (!userTenantId && !resourceTenantId) return true;

  // If user has no tenant but resource does, deny
  if (!userTenantId && resourceTenantId) return false;

  // If user has tenant but resource doesn't, allow (public resource)
  if (userTenantId && !resourceTenantId) return true;

  // Both have tenants, must match
  return userTenantId === resourceTenantId;
};

// MFA (Multi-Factor Authentication) functions
export const generateMFASecret = (): { secret: string; otpauthUrl: string } => {
  const secret = speakeasy.generateSecret({
    name: 'Atlas Genesis',
    issuer: 'Atlas Humanitarian'
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url!
  };
};

export const verifyMFAToken = (secret: string, token: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 30 seconds window
  });
};

export const generateBackupCodes = (): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

export const hashBackupCodes = async (codes: string[]): Promise<string[]> => {
  return Promise.all(codes.map(code => bcrypt.hash(code, 10)));
};

export const verifyBackupCode = async (hashedCodes: string[], code: string): Promise<boolean> => {
  for (const hashedCode of hashedCodes) {
    if (await bcrypt.compare(code, hashedCode)) {
      return true;
    }
  }
  return false;
};

export const setupMFA = async (userId: string): Promise<{ secret: string; otpauthUrl: string; backupCodes: string[] }> => {
  const { secret, otpauthUrl } = generateMFASecret();
  const backupCodes = generateBackupCodes();
  const hashedBackupCodes = await hashBackupCodes(backupCodes);

  await query(
    'UPDATE users SET mfa_secret = $1, mfa_backup_codes = $2 WHERE id = $3',
    [secret, hashedBackupCodes, userId]
  );

  return { secret, otpauthUrl, backupCodes };
};

export const enableMFA = async (userId: string, token: string): Promise<boolean> => {
  const result = await query('SELECT mfa_secret FROM users WHERE id = $1', [userId]);
  if (result.rowCount === 0) return false;

  const secret = result.rows[0].mfa_secret;
  if (!secret) return false;

  const isValid = verifyMFAToken(secret, token);
  if (isValid) {
    await query('UPDATE users SET mfa_enabled = true WHERE id = $1', [userId]);
  }

  return isValid;
};

export const disableMFA = async (userId: string): Promise<void> => {
  await query(
    'UPDATE users SET mfa_enabled = false, mfa_secret = NULL, mfa_backup_codes = NULL WHERE id = $1',
    [userId]
  );
};

export const verifyMFAForLogin = async (userId: string, token: string): Promise<boolean> => {
  const result = await query('SELECT mfa_secret, mfa_backup_codes FROM users WHERE id = $1', [userId]);
  if (result.rowCount === 0) return false;

  const { mfa_secret, mfa_backup_codes } = result.rows[0];

  // Try TOTP first
  if (mfa_secret && verifyMFAToken(mfa_secret, token)) {
    return true;
  }

  // Try backup codes
  if (mfa_backup_codes && await verifyBackupCode(mfa_backup_codes, token)) {
    // Remove the used backup code (async filter — cannot use Array.filter with async predicates)
    const remaining: string[] = [];
    for (const hashed of mfa_backup_codes) {
      if (!(await bcrypt.compare(token, hashed))) {
        remaining.push(hashed);
      }
    }
    await query('UPDATE users SET mfa_backup_codes = $1 WHERE id = $2', [remaining, userId]);
    return true;
  }

  return false;
};

// Device fingerprinting
export const generateDeviceFingerprint = (req: any): string => {
  const components = [
    req.get('User-Agent') || '',
    req.ip || '',
    req.get('Accept-Language') || '',
    req.get('Accept-Encoding') || '',
    req.get('DNT') || '',
    req.get('Upgrade-Insecure-Requests') || ''
  ];

  return crypto.createHash('sha256').update(components.join('|')).digest('hex');
};

// Token versioning and family management
export const getCurrentTokenVersion = async (userId: string): Promise<number> => {
  const result = await query('SELECT token_version FROM users WHERE id = $1', [userId]);
  return result.rowCount > 0 ? result.rows[0].token_version || 1 : 1;
};

export const incrementTokenVersion = async (userId: string): Promise<void> => {
  await query('UPDATE users SET token_version = COALESCE(token_version, 1) + 1 WHERE id = $1', [userId]);
};

export const generateTokenFamilyId = (): string => {
  return crypto.randomUUID();
};

// Enhanced JWT token generation with security features
export const generateSecureAccessToken = (
  payload: Omit<TokenPayload, 'type' | 'iat' | 'exp' | 'iss' | 'aud'>,
  deviceFingerprint?: string
): string => {
  const tokenPayload: Omit<TokenPayload, 'iss' | 'aud'> = {
    ...payload,
    type: 'access',
    deviceFingerprint
  };
  return jwt.sign(tokenPayload, JWT_ACCESS_SECRET as string, {
    expiresIn: JWT_ACCESS_EXPIRES_IN as any,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE
  });
};

export const generateSecureRefreshToken = (
  payload: Omit<TokenPayload, 'type' | 'iat' | 'exp' | 'iss' | 'aud' | 'familyId'>,
  deviceFingerprint?: string
): string => {
  const familyId = generateTokenFamilyId();
  const tokenPayload: Omit<TokenPayload, 'iss' | 'aud'> = {
    ...payload,
    type: 'refresh',
    familyId,
    deviceFingerprint
  };
  return jwt.sign(tokenPayload, JWT_REFRESH_SECRET as string, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as any,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE
  });
};

// Enhanced JWT verification with security checks
export const verifySecureAccessToken = (token: string, expectedFingerprint?: string): TokenPayload => {
  const payload = jwt.verify(token, JWT_ACCESS_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE
  }) as TokenPayload;

  // Check token version
  if (payload.version) {
    // This would be checked against user's current version in middleware
  }

  // Check device fingerprint if provided
  if (expectedFingerprint && payload.deviceFingerprint !== expectedFingerprint) {
    throw new Error('Device fingerprint mismatch');
  }

  return payload;
};

export const verifySecureRefreshToken = (token: string, expectedFingerprint?: string): TokenPayload => {
  const payload = jwt.verify(token, JWT_REFRESH_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE
  }) as TokenPayload;

  // Check token version
  if (payload.version) {
    // This would be checked against user's current version in middleware
  }

  // Check device fingerprint if provided
  if (expectedFingerprint && payload.deviceFingerprint !== expectedFingerprint) {
    throw new Error('Device fingerprint mismatch');
  }

  return payload;
};

// Remember Me functionality
export const generateRememberMeToken = (userId: string): string => {
  const payload = {
    userId,
    type: 'remember_me',
    iat: Math.floor(Date.now() / 1000)
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });
};

export const verifyRememberMeToken = (token: string): { userId: string } | null => {
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    if (payload.type === 'remember_me') {
      return { userId: payload.userId };
    }
    return null;
  } catch {
    return null;
  }
};

// Suspicious login detection
export interface LoginContext {
  ip: string;
  userAgent: string;
  deviceFingerprint: string;
  timestamp: Date;
}

export const detectSuspiciousLogin = async (userId: string, currentContext: LoginContext): Promise<{
  isSuspicious: boolean;
  reasons: string[];
  riskLevel: 'low' | 'medium' | 'high';
}> => {
  const reasons: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  // Get user's recent login history (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const result = await query(
    'SELECT ip_address, user_agent, device_info, created_at FROM user_sessions WHERE user_id = $1 AND created_at > $2 ORDER BY created_at DESC LIMIT 10',
    [userId, thirtyDaysAgo]
  );

  const recentSessions = result.rows;

  // Check for new IP address
  const knownIPs = new Set(recentSessions.map(s => s.ip_address));
  if (!knownIPs.has(currentContext.ip)) {
    reasons.push('New IP address detected');
    riskLevel = 'medium';
  }

  // Check for new device fingerprint
  const knownFingerprints = new Set(recentSessions.map(s => s.device_info?.deviceFingerprint).filter(Boolean));
  if (!knownFingerprints.has(currentContext.deviceFingerprint)) {
    reasons.push('New device detected');
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  // Check for unusual time patterns (login at unusual hours)
  const hour = currentContext.timestamp.getHours();
  const isUnusualHour = hour < 6 || hour > 22; // Outside 6 AM - 10 PM

  if (isUnusualHour && recentSessions.length > 0) {
    // Check if user has logged in at this hour before
    const hasLoggedAtThisHour = recentSessions.some(session => {
      const sessionHour = new Date(session.created_at).getHours();
      return Math.abs(sessionHour - hour) <= 2; // Within 2 hours
    });

    if (!hasLoggedAtThisHour) {
      reasons.push('Unusual login time');
      riskLevel = 'high';
    }
  }

  // Check for rapid successive logins from different IPs (potential account takeover)
  const recentLogins = recentSessions.filter(session => {
    const sessionTime = new Date(session.created_at);
    const timeDiff = currentContext.timestamp.getTime() - sessionTime.getTime();
    return timeDiff < 24 * 60 * 60 * 1000; // Within last 24 hours
  });

  const uniqueRecentIPs = new Set(recentLogins.map(s => s.ip_address));
  if (uniqueRecentIPs.size > 3) {
    reasons.push('Multiple IP addresses in short time period');
    riskLevel = 'high';
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
    riskLevel
  };
};

// Security dashboard data
export const getSecurityDashboardData = async (userId?: string): Promise<any> => {
  const dashboard = {
    totalUsers: 0,
    activeUsers: 0,
    lockedAccounts: 0,
    recentSecurityEvents: [] as any[],
    loginAttempts: {
      successful: 0,
      failed: 0,
      suspicious: 0
    },
    mfaStats: {
      enabled: 0,
      disabled: 0
    }
  };

  // Get user statistics
  const userStats = await query(`
    SELECT
      COUNT(*) as total_users,
      COUNT(CASE WHEN last_login > NOW() - INTERVAL '30 days' THEN 1 END) as active_users,
      COUNT(CASE WHEN account_locked = true THEN 1 END) as locked_accounts,
      COUNT(CASE WHEN mfa_enabled = true THEN 1 END) as mfa_enabled,
      COUNT(CASE WHEN mfa_enabled = false THEN 1 END) as mfa_disabled
    FROM users
  `);

  if (userStats.rows.length > 0) {
    const stats = userStats.rows[0];
    dashboard.totalUsers = parseInt(stats.total_users);
    dashboard.activeUsers = parseInt(stats.active_users);
    dashboard.lockedAccounts = parseInt(stats.locked_accounts);
    dashboard.mfaStats.enabled = parseInt(stats.mfa_enabled);
    dashboard.mfaStats.disabled = parseInt(stats.mfa_disabled);
  }

  // Get recent security events
  const eventsResult = await query(`
    SELECT event_type, severity, details, created_at, user_id
    FROM security_audit_log
    WHERE created_at > NOW() - INTERVAL '7 days'
    ORDER BY created_at DESC
    LIMIT 50
  `);

  dashboard.recentSecurityEvents = eventsResult.rows;

  // Get login attempt statistics
  const loginStats = await query(`
    SELECT
      COUNT(CASE WHEN event_type = 'login_success' THEN 1 END) as successful_logins,
      COUNT(CASE WHEN event_type = 'login_failed' THEN 1 END) as failed_logins,
      COUNT(CASE WHEN event_type = 'suspicious_login' THEN 1 END) as suspicious_logins
    FROM security_audit_log
    WHERE created_at > NOW() - INTERVAL '30 days'
  `);

  if (loginStats.rows.length > 0) {
    const stats = loginStats.rows[0];
    dashboard.loginAttempts.successful = parseInt(stats.successful_logins);
    dashboard.loginAttempts.failed = parseInt(stats.failed_logins);
    dashboard.loginAttempts.suspicious = parseInt(stats.suspicious_logins);
  }

  return dashboard;
};