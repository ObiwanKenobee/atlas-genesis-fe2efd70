import { Request, Response, NextFunction } from 'express';
import { verifySecureAccessToken, checkPermission, checkTenantAccess, User, getCurrentTokenVersion, generateDeviceFingerprint, verifyMFAForLogin } from '../utils/auth';
import { query } from '../db';
import { logSecurityEvent } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

// Authentication middleware
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logSecurityEvent('authentication_failed', null, {
        reason: 'no_token',
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }, 'low');
      return res.status(401).json({ code: 'unauthorized', message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const deviceFingerprint = generateDeviceFingerprint(req);
    const payload = verifySecureAccessToken(token, deviceFingerprint);

    // Fetch user from database to ensure they still exist and get latest data
    const result = await query(
      'SELECT id, email, display_name, role, tenant_id, email_verified, mfa_enabled, last_login, account_locked FROM users WHERE id = $1',
      [payload.userId]
    );

    if (result.rowCount === 0) {
      logSecurityEvent('authentication_failed', payload.userId, {
        reason: 'user_not_found',
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }, 'medium');
      return res.status(401).json({ code: 'unauthorized', message: 'User not found' });
    }

    const user = result.rows[0];

    // Check token version for forced logout capability
    const currentVersion = await getCurrentTokenVersion(user.id);
    if (payload.version && payload.version < currentVersion) {
      logSecurityEvent('authentication_failed', user.id, {
        reason: 'token_version_mismatch',
        tokenVersion: payload.version,
        currentVersion,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }, 'medium');
      return res.status(401).json({ code: 'token_expired', message: 'Token has been invalidated' });
    }

    // Check if account is locked
    if (user.account_locked) {
      logSecurityEvent('authentication_failed', user.id, {
        reason: 'account_locked',
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }, 'high');
      return res.status(403).json({ code: 'account_locked', message: 'Account is locked' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      tenantId: user.tenant_id,
      emailVerified: user.email_verified,
      mfaEnabled: user.mfa_enabled,
      lastLogin: user.last_login
    };

    // Log successful authentication
    logSecurityEvent('authentication_success', user.id, {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }, 'low');

    next();
  } catch (error) {
    logSecurityEvent('authentication_failed', null, {
      reason: 'invalid_token',
      error: (error as Error).message,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }, 'medium');
    return res.status(401).json({ code: 'unauthorized', message: 'Invalid token' });
  }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      logSecurityEvent('authorization_failed', null, {
        reason: 'not_authenticated',
        requiredRoles: allowedRoles,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }, 'medium');
      return res.status(401).json({ code: 'unauthorized', message: 'Authentication required' });
    }

    const hasPermission = allowedRoles.some(role => checkPermission(req.user!.role, role));
    if (!hasPermission) {
      logSecurityEvent('authorization_failed', req.user.id, {
        reason: 'insufficient_permissions',
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }, 'high');
      return res.status(403).json({
        code: 'forbidden',
        message: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Tenant isolation middleware
export const tenantGuard = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ code: 'unauthorized', message: 'Authentication required' });
  }

  // For now, allow all authenticated users
  // In a multi-tenant setup, you might want to check resource ownership
  next();
};

// Email verification middleware
export const requireEmailVerification = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ code: 'unauthorized', message: 'Authentication required' });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      code: 'email_not_verified',
      message: 'Email verification required',
      requiresVerification: true
    });
  }

  next();
};

// MFA verification middleware
export const requireMFA = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ code: 'unauthorized', message: 'Authentication required' });
  }

  if (req.user.mfaEnabled) {
    const mfaToken = req.headers['x-mfa-token'] as string;
    if (!mfaToken) {
      return res.status(403).json({
        code: 'mfa_required',
        message: 'Multi-factor authentication required',
        requiresMFA: true
      });
    }

    // Verify MFA token
    const isValidMFA = await verifyMFAForLogin(req.user.id, mfaToken);
    if (!isValidMFA) {
      logSecurityEvent('mfa_verification_failed', req.user.id, {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }, 'medium');
      return res.status(403).json({
        code: 'mfa_invalid',
        message: 'Invalid MFA token'
      });
    }
  }

  next();
};

// Rate limiting helper (basic implementation)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

export const checkLoginAttempts = (email: string): boolean => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const attempts = loginAttempts.get(email);
  if (!attempts || now > attempts.resetTime) {
    loginAttempts.set(email, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (attempts.count >= maxAttempts) {
    return false;
  }

  attempts.count++;
  return true;
};

export const resetLoginAttempts = (email: string): void => {
  loginAttempts.delete(email);
};

// Account lockout middleware
export const checkAccountLockout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // This would be called during login attempts
  // For now, just pass through
  next();
};