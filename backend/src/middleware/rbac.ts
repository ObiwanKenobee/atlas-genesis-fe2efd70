/**
 * RBAC (Role-Based Access Control) Middleware
 * 
 * Provides middleware functions for checking user permissions and roles.
 */

import { Request, Response, NextFunction } from 'express';
import { rbacService } from '../services/rbac';

/**
 * Require a specific permission
 */
export const requirePermission = (permissionId: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const organizationId = req.user?.organizationId || req.headers['x-organization-id'] as string;

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID required' });
      }

      const hasPermission = await rbacService.hasPermission(userId, permissionId);

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Permission '${permissionId}' required`,
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Require any of the specified permissions
 */
export const requireAnyPermission = (permissionIds: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const organizationId = req.user?.organizationId || req.headers['x-organization-id'] as string;

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID required' });
      }

      const hasPermission = await rbacService.hasAnyPermission(userId, permissionIds);

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `One of the following permissions required: ${permissionIds.join(', ')}`,
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Require a specific role
 */
export const requireRole = (roleName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const organizationId = req.user?.organizationId || req.headers['x-organization-id'] as string;

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID required' });
      }

      const userRoles = await rbacService.getUserRoles(userId, organizationId);

      const hasRole = userRoles.some((ur: any) => ur.role_name === roleName);

      if (!hasRole) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Role '${roleName}' required`,
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Require any of the specified roles
 */
export const requireAnyRole = (roleNames: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const organizationId = req.user?.organizationId || req.headers['x-organization-id'] as string;

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID required' });
      }

      const userRoles = await rbacService.getUserRoles(userId, organizationId);

      const hasRole = userRoles.some((ur: any) => roleNames.includes(ur.role_name));

      if (!hasRole) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `One of the following roles required: ${roleNames.join(', ')}`,
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Require super admin role
 */
export const requireSuperAdmin = requireRole('super_admin');

/**
 * Require admin role
 */
export const requireAdmin = requireAnyRole(['super_admin', 'admin']);

/**
 * Require organization membership
 */
export const requireOrganizationMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const organizationId = req.user?.organizationId || req.headers['x-organization-id'] as string;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    const userRoles = await rbacService.getUserRoles(userId, organizationId);

    if (userRoles.length === 0) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Organization membership required',
      });
    }

    next();
  } catch (error) {
    console.error('Organization membership check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Check if user has permission (non-blocking)
 */
export const hasPermission = (permissionId: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        req.hasPermission = false;
        return next();
      }

      const organizationId = req.user?.organizationId || req.headers['x-organization-id'] as string;

      if (!organizationId) {
        req.hasPermission = false;
        return next();
      }

      const hasPermission = await rbacService.hasPermission(userId, permissionId);
      req.hasPermission = hasPermission;

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      req.hasPermission = false;
      next();
    }
  };
};

/**
 * Check if user has role (non-blocking)
 */
export const hasRole = (roleName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        req.hasRole = false;
        return next();
      }

      const organizationId = req.user?.organizationId || req.headers['x-organization-id'] as string;

      if (!organizationId) {
        req.hasRole = false;
        return next();
      }

      const userRoles = await rbacService.getUserRoles(userId, organizationId);
      const hasRole = userRoles.some((ur: any) => ur.role_name === roleName);
      req.hasRole = hasRole;

      next();
    } catch (error) {
      console.error('Role check error:', error);
      req.hasRole = false;
      next();
    }
  };
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      hasPermission?: boolean;
      hasRole?: boolean;
    }
  }
}
