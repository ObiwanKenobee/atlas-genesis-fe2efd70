/**
 * Tenant Isolation Middleware
 * 
 * Multi-tenant data isolation through tenant context.
 */

import { Response, NextFunction } from 'express';
import { TenantContext, AuthenticatedRequest, Tenant } from '../types';
import { logger } from '../utils/logger';

// ============================================================================
// Tenant Context
// ============================================================================

/**
 * Set tenant context from authenticated user
 */
export const setTenantContext = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user) {
    req.tenantContext = {
      tenantId: req.user.tenantId,
      organizationId: req.user.organizationId,
      userId: req.user.sub,
      role: req.user.role
    };
  }
  next();
};

/**
 * Require tenant context
 */
export const requireTenant = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.tenantContext?.tenantId) {
    res.status(400).json({
      success: false,
      error: {
        code: 'TENANT_REQUIRED',
        message: 'Tenant context is required for this operation'
      }
    });
    return;
  }
  next();
};

/**
 * Check tenant access for a resource
 */
export const requireTenantAccess = (
  getResourceTenantId: (req: AuthenticatedRequest) => Promise<string | null>
) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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
      const resourceTenantId = await getResourceTenantId(req);

      if (!resourceTenantId) {
        // Resource doesn't have a tenant (public resource)
        return next();
      }

      // Check tenant access
      if (req.user.tenantId !== resourceTenantId) {
        logger.warn('[tenant] Cross-tenant access attempt', {
          userId: req.user.sub,
          userTenantId: req.user.tenantId,
          resourceTenantId,
          path: req.path
        });

        res.status(403).json({
          success: false,
          error: {
            code: 'TENANT_ACCESS_DENIED',
            message: 'You do not have access to this resource'
          }
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('[tenant] Access check error', { error });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to verify tenant access'
        }
      });
    }
  };
};

// ============================================================================
// Query Builders
// ============================================================================

/**
 * Add tenant filter to SQL query
 */
export function addTenantFilter(
  query: string,
  params: unknown[],
  tenantId: string,
  columnName: string = 'tenant_id'
): { query: string; params: unknown[] } {
  const tenantIndex = params.length + 1;
  return {
    query: `${query} AND ${columnName} = $${tenantIndex}`,
    params: [...params, tenantId]
  };
}

/**
 * Build tenant-scoped query options
 */
export interface TenantQueryOptions {
  tenantId: string;
  tableName: string;
  tenantColumn?: string;
  userColumn?: string;
  userId?: string;
}

export function buildTenantQuery(options: TenantQueryOptions): {
  whereClause: string;
  params: unknown[];
} {
  const { tenantId, tableName, tenantColumn = 'tenant_id', userColumn, userId } = options;

  let conditions: string[] = [`${tenantColumn} = $1`];
  let params: unknown[] = [tenantId];

  if (userColumn && userId) {
    conditions.push(`${userColumn} = $2`);
    params.push(userId);
  }

  return {
    whereClause: `WHERE ${conditions.join(' AND ')}`,
    params
  };
}

// ============================================================================
// Tenant Limits Check
// ============================================================================

export interface TenantLimits {
  users: number;
  storage: number;
  apiCalls: number;
  rateLimit: number;
}

/**
 * Check if tenant has reached a limit
 */
export async function checkTenantLimit(
  redisClient: { get: (key: string) => Promise<string | null>; incr: (key: string) => Promise<number> },
  tenantId: string,
  limitType: keyof TenantLimits,
  limitValue: number,
  windowSeconds: number = 3600
): Promise<{ allowed: boolean; current: number; limit: number; retryAfter?: number }> {
  const key = `tenant_limit:${tenantId}:${limitType}`;
  
  try {
    const current = await redisClient.incr(key);
    
    // Set expiry on first request
    if (current === 1) {
      await redisClient.get(key); // Touch key to set expiry
    }

    const allowed = current <= limitValue;
    
    return {
      allowed,
      current,
      limit: limitValue,
      retryAfter: allowed ? undefined : windowSeconds
    };
  } catch (error) {
    logger.error('[tenant] Limit check error', { error });
    // Fail open for availability
    return { allowed: true, current: 0, limit: limitValue };
  }
}

// ============================================================================
// Organization Access
// ============================================================================

/**
 * Require organization membership
 */
export const requireOrganizationMember = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
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

  if (!req.user.organizationId) {
    res.status(403).json({
      success: false,
      error: {
        code: 'ORGANIZATION_REQUIRED',
        message: 'You must be a member of an organization to access this resource'
      }
    });
    return;
  }

  next();
};

/**
 * Require specific organization
 */
export const requireOrganization = (
  requiredOrgId: string | ((req: AuthenticatedRequest) => string)
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

    const orgId = typeof requiredOrgId === 'function' 
      ? requiredOrgId(req) 
      : requiredOrgId;

    if (req.user.organizationId !== orgId) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ORGANIZATION_MISMATCH',
          message: 'You do not have access to this organization'
        }
      });
      return;
    }

    next();
  };
};

// ============================================================================
// Tenant-scoped Data Access
// ============================================================================

/**
 * Filter results by tenant
 */
export function filterByTenant<T extends { tenantId?: string }>(
  items: T[],
  tenantId: string
): T[] {
  return items.filter(item => item.tenantId === tenantId);
}

/**
 * Ensure resource belongs to tenant
 */
export function ensureTenantAccess<T extends { tenantId?: string }>(
  resource: T | null,
  tenantId: string
): T | null {
  if (!resource) return null;
  if (resource.tenantId && resource.tenantId !== tenantId) return null;
  return resource;
}
