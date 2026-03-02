/**
 * RBAC (Role-Based Access Control) Middleware
 * 
 * Hierarchical role checking with granular permissions.
 */

import { Response, NextFunction } from 'express';
import { ROLE_HIERARCHY, ROLE_CAPABILITIES, AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';

// ============================================================================
// Role Hierarchy
// ============================================================================

export type RoleLevel = typeof ROLE_HIERARCHY[keyof typeof ROLE_HIERARCHY];
export type Role = keyof typeof ROLE_HIERARCHY;

/**
 * Get the hierarchy level of a role
 */
export function getRoleLevel(role: string): number {
  return ROLE_HIERARCHY[role as Role] ?? 0;
}

/**
 * Check if role1 is higher or equal to role2 in the hierarchy
 */
export function isRoleHigherOrEqual(role1: string, role2: string): boolean {
  const level1 = getRoleLevel(role1);
  const level2 = getRoleLevel(role2);
  return level1 >= level2;
}

/**
 * Get capabilities for a role
 */
export function getRoleCapabilities(role: string): string[] {
  return ROLE_CAPABILITIES[role] ?? ['own:profile:read', 'own:profile:write'];
}

// ============================================================================
// Middleware Factories
// ============================================================================

/**
 * Require specific roles (or higher in hierarchy)
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const userRole = req.user.role;
    const hasAccess = allowedRoles.some(allowedRole => 
      isRoleHigherOrEqual(userRole, allowedRole)
    );

    if (!hasAccess) {
      logger.warn('[rbac] Role check failed', {
        userId: req.user.sub,
        userRole,
        requiredRoles: allowedRoles,
        path: req.path
      });

      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
        }
      });
      return;
    }

    next();
  };
};

/**
 * Require specific capabilities
 */
export const requireCapability = (...requiredCapabilities: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const userCapabilities = req.user.permissions || [];
    
    // Super admin bypass
    if (userCapabilities.includes('*')) {
      return next();
    }

    const hasAllCapabilities = requiredCapabilities.every(cap =>
      userCapabilities.includes(cap)
    );

    if (!hasAllCapabilities) {
      logger.warn('[rbac] Capability check failed', {
        userId: req.user.sub,
        userCapabilities,
        requiredCapabilities,
        path: req.path
      });

      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Missing required capabilities: ${requiredCapabilities.join(', ')}`
        }
      });
      return;
    }

    next();
  };
};

/**
 * Require at least one of the specified capabilities
 */
export const requireAnyCapability = (...capabilities: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const userCapabilities = req.user.permissions || [];
    
    // Super admin bypass
    if (userCapabilities.includes('*')) {
      return next();
    }

    const hasAnyCapability = capabilities.some(cap =>
      userCapabilities.includes(cap)
    );

    if (!hasAnyCapability) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `At least one capability required: ${capabilities.join(', ')}`
        }
      });
      return;
    }

    next();
  };
};

/**
 * Require ownership of resource OR elevated permissions
 */
export const requireOwnership = (
  getOwnerId: (req: AuthenticatedRequest) => Promise<string | null>
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    try {
      const resourceOwnerId = await getOwnerId(req);

      if (!resourceOwnerId) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Resource not found'
          }
        });
        return;
      }

      // Check ownership
      if (resourceOwnerId === req.user.sub) {
        return next();
      }

      // Check if user has elevated permissions (moderator or higher)
      const userRoleLevel = getRoleLevel(req.user.role);
      if (userRoleLevel >= getRoleLevel('moderator')) {
        return next();
      }

      logger.warn('[rbac] Ownership check failed', {
        userId: req.user.sub,
        resourceOwnerId,
        path: req.path
      });

      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this resource'
        }
      });
    } catch (error) {
      logger.error('[rbac] Ownership check error', { error });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to verify resource ownership'
        }
      });
    }
  };
};

/**
 * Resource-scoped permission check
 */
export const requireResourceAccess = (
  resourceType: string,
  action: 'read' | 'write' | 'delete' | 'manage'
) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const capability = `${resourceType}:${action}`;
    const userCapabilities = req.user.permissions || [];

    // Super admin bypass
    if (userCapabilities.includes('*')) {
      return next();
    }

    // Check specific capability
    if (userCapabilities.includes(capability)) {
      return next();
    }

    // Check own: scoped capability
    if (userCapabilities.includes(`own:${resourceType}:${action}`)) {
      return next();
    }

    logger.warn('[rbac] Resource access check failed', {
      userId: req.user.sub,
      resourceType,
      action,
      path: req.path
    });

    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: `Cannot ${action} this ${resourceType}`
      }
    });
  };
};

/**
 * Combine multiple checks
 */
export const requireAll = (
  ...middlewares: Array<(req: AuthenticatedRequest, res: Response, next: NextFunction) => void>
) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    let index = 0;

    const nextMiddleware = () => {
      if (index >= middlewares.length) {
        return next();
      }
      const middleware = middlewares[index++];
      middleware(req, res, nextMiddleware);
    };

    nextMiddleware();
  };
};

// ============================================================================
// Permission Check Utilities
// ============================================================================

/**
 * Check if user can access tenant
 */
export function canAccessTenant(userTenantId: string, resourceTenantId: string | null): boolean {
  // If no tenant isolation required
  if (!userTenantId && !resourceTenantId) return true;

  // User has tenant but resource doesn't
  if (userTenantId && !resourceTenantId) return true;

  // Tenants must match
  return userTenantId === resourceTenantId;
}

/**
 * Check if user can manage another user
 */
export function canManageUser(managerRole: string, targetRole: string): boolean {
  // Cannot manage super_admin
  if (targetRole === 'super_admin') return false;

  // Super admin can manage anyone
  if (managerRole === 'super_admin') return true;

  // Check hierarchy
  return isRoleHigherOrEqual(managerRole, targetRole);
}

/**
 * Filter resources based on user permissions
 */
export function filterByPermission<T extends { tenantId?: string }>(
  resources: T[],
  user: { tenantId: string; role: string },
  requiredCapability?: string
): T[] {
  const userRoleLevel = getRoleLevel(user.role);

  return resources.filter(resource => {
    // Tenant isolation
    if (resource.tenantId && resource.tenantId !== user.tenantId) {
      return false;
    }

    // Moderator+ can access all resources in tenant
    if (userRoleLevel >= getRoleLevel('moderator')) {
      return true;
    }

    // Regular users can only access their own resources
    return true;
  });
}

// ============================================================================
// Decorators for Route Handlers (Optional TypeScript Enhancement)
// ============================================================================

// Type for authenticated route handlers
export type AuthenticatedHandler<TRequest = AuthenticatedRequest> = (
  req: TRequest,
  res: Response,
  next: NextFunction
) => Promise<void> | void;
