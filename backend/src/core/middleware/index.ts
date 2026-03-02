/**
 * Core Middleware Index
 * 
 * Central export for core middleware.
 */

export * from './auth';
export * from './security';

// Re-export from rbac
export {
  requireRole,
  requireCapability,
  requireAnyCapability,
  requireOwnership,
  requireResourceAccess,
  requireAll,
  getRoleLevel,
  isRoleHigherOrEqual,
  getRoleCapabilities,
  canAccessTenant,
  canManageUser,
  filterByPermission
} from '../rbac';

// Re-export from tenant
export {
  setTenantContext,
  requireTenant,
  requireTenantAccess,
  addTenantFilter,
  buildTenantQuery,
  checkTenantLimit,
  requireOrganizationMember,
  requireOrganization,
  filterByTenant,
  ensureTenantAccess
} from '../tenant';
