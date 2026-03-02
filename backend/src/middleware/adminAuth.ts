/**
 * Admin Authentication Middleware
 * 
 * Middleware for protecting admin routes with JWT authentication.
 */

import { Request, Response, NextFunction } from 'express';
import { adminAuthService, type AdminUser } from '../services/adminAuth';

export interface AdminAuthRequest extends Request {
  user?: AdminUser;
}

export const authenticateAdmin = async (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No authorization header provided',
        },
      });
      return;
    }

    // Check Bearer token format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN_FORMAT',
          message: 'Authorization header must be in format: Bearer <token>',
        },
      });
      return;
    }

    const token = parts[1];

    // Verify token
    const decoded = adminAuthService.verifyToken(token);
    if (!decoded) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      });
      return;
    }

    // Get user from database
    const user = await adminAuthService.getUserById(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DEACTIVATED',
          message: 'Your account has been deactivated',
        },
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during authentication',
      },
    });
  }
};

export const authorizeAdmin = (...allowedRoles: string[]) => {
  return (
    req: AdminAuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions to access this resource',
        },
      });
      return;
    }

    next();
  };
};

// Convenience export for routes that use adminAuth as middleware
// This is a function that can be used directly as middleware
export const adminAuth = authenticateAdmin;

export default { authenticateAdmin, authorizeAdmin };
