import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, checkPermission, checkTenantAccess, User } from '../utils/auth';
import { query } from '../db';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Authentication middleware
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 'unauthorized', message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    // Fetch user from database to ensure they still exist and get latest data
    const result = await query(
      'SELECT id, email, display_name, role, tenant_id, email_verified, mfa_enabled, last_login FROM users WHERE id = $1',
      [payload.userId]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ code: 'unauthorized', message: 'User not found' });
    }

    const user = result.rows[0];
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

    next();
  } catch (error) {
    return res.status(401).json({ code: 'unauthorized', message: 'Invalid token' });
  }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ code: 'unauthorized', message: 'Authentication required' });
    }

    const hasPermission = allowedRoles.some(role => checkPermission(req.user!.role, role));
    if (!hasPermission) {
      return res.status(403).json({ code: 'forbidden', message: 'Insufficient permissions' });
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

// MFA verification middleware (placeholder for future implementation)
export const requireMFA = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ code: 'unauthorized', message: 'Authentication required' });
  }

  // TODO: Implement MFA verification logic
  // For now, just check if MFA is enabled
  if (req.user.mfaEnabled) {
    return res.status(403).json({
      code: 'mfa_required',
      message: 'Multi-factor authentication required',
      requiresMFA: true
    });
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