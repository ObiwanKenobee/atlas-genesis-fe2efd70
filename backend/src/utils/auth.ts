import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { query } from '../db';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: string;
  tenantId?: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  lastLogin?: Date;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  type: 'access' | 'refresh';
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

// JWT Secret management
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

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
  return jwt.sign(tokenPayload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN });
};

export const generateRefreshToken = (payload: Omit<TokenPayload, 'type' | 'iat' | 'exp'>): string => {
  const tokenPayload: TokenPayload = {
    ...payload,
    type: 'refresh'
  };
  return jwt.sign(tokenPayload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
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
  const roleHierarchy = {
    'admin': 4,
    'moderator': 3,
    'investor': 2,
    'individual': 1
  };

  return (roleHierarchy[userRole as keyof typeof roleHierarchy] || 0) >=
         (roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0);
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