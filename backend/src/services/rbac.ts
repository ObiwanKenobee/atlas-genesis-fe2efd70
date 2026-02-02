/**
 * RBAC (Role-Based Access Control) Service
 * 
 * Provides granular, hierarchical role management for enterprise clients.
 * Supports fine-grained permissions with resource-level access control.
 */

import { query } from '../db';

export interface Permission {
  id: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'admin';
  conditions?: Record<string, any>;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  organizationId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  ssoProvider?: string;
  ssoConfig?: Record<string, any>;
  settings: OrganizationSettings;
  subscriptionTier: 'starter' | 'professional' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  allowedDomains: string[];
  requireMFA: boolean;
  sessionTimeout: number;
  ipWhitelist: string[];
  auditLogRetention: number;
}

export class RBACService {
  /**
   * Predefined permissions for common resources
   */
  private readonly PERMISSIONS: Record<string, Permission> = {
    // User Management
    'user.create': {
      id: 'user.create',
      resource: 'user',
      action: 'create',
      description: 'Create new users',
    },
    'user.read': {
      id: 'user.read',
      resource: 'user',
      action: 'read',
      description: 'View user information',
    },
    'user.update': {
      id: 'user.update',
      resource: 'user',
      action: 'update',
      description: 'Update user information',
    },
    'user.delete': {
      id: 'user.delete',
      resource: 'user',
      action: 'delete',
      description: 'Delete users',
    },
    'user.admin': {
      id: 'user.admin',
      resource: 'user',
      action: 'admin',
      description: 'Full administrative access to users',
    },

    // Organization Management
    'organization.create': {
      id: 'organization.create',
      resource: 'organization',
      action: 'create',
      description: 'Create organizations',
    },
    'organization.read': {
      id: 'organization.read',
      resource: 'organization',
      action: 'read',
      description: 'View organization information',
    },
    'organization.update': {
      id: 'organization.update',
      resource: 'organization',
      action: 'update',
      description: 'Update organization information',
    },
    'organization.delete': {
      id: 'organization.delete',
      resource: 'organization',
      action: 'delete',
      description: 'Delete organizations',
    },
    'organization.admin': {
      id: 'organization.admin',
      resource: 'organization',
      action: 'admin',
      description: 'Full administrative access to organizations',
    },

    // Role Management
    'role.create': {
      id: 'role.create',
      resource: 'role',
      action: 'create',
      description: 'Create roles',
    },
    'role.read': {
      id: 'role.read',
      resource: 'role',
      action: 'read',
      description: 'View roles',
    },
    'role.update': {
      id: 'role.update',
      resource: 'role',
      action: 'update',
      description: 'Update roles',
    },
    'role.delete': {
      id: 'role.delete',
      resource: 'role',
      action: 'delete',
      description: 'Delete roles',
    },
    'role.assign': {
      id: 'role.assign',
      resource: 'role',
      action: 'admin',
      description: 'Assign roles to users',
    },
    'role.revoke': {
      id: 'role.revoke',
      resource: 'role',
      action: 'admin',
      description: 'Revoke roles from users',
    },

    // RIU Management
    'riu.create': {
      id: 'riu.create',
      resource: 'riu',
      action: 'create',
      description: 'Create RIUs (Regenerative Impact Units)',
    },
    'riu.read': {
      id: 'riu.read',
      resource: 'riu',
      action: 'read',
      description: 'View RIU information',
    },
    'riu.update': {
      id: 'riu.update',
      resource: 'riu',
      action: 'update',
      description: 'Update RIU information',
    },
    'riu.delete': {
      id: 'riu.delete',
      resource: 'riu',
      action: 'delete',
      description: 'Delete RIUs',
    },
    'riu.transfer': {
      id: 'riu.transfer',
      resource: 'riu',
      action: 'admin',
      description: 'Transfer RIUs between organizations',
    },
    'riu.retire': {
      id: 'riu.retire',
      resource: 'riu',
      action: 'admin',
      description: 'Retire RIUs',
    },

    // Project Management
    'project.create': {
      id: 'project.create',
      resource: 'project',
      action: 'create',
      description: 'Create projects',
    },
    'project.read': {
      id: 'project.read',
      resource: 'project',
      action: 'read',
      description: 'View project information',
    },
    'project.update': {
      id: 'project.update',
      resource: 'project',
      action: 'update',
      description: 'Update project information',
    },
    'project.delete': {
      id: 'project.delete',
      resource: 'project',
      action: 'delete',
      description: 'Delete projects',
    },
    'project.approve': {
      id: 'project.approve',
      resource: 'project',
      action: 'admin',
      description: 'Approve projects',
    },
    'project.reject': {
      id: 'project.reject',
      resource: 'project',
      action: 'admin',
      description: 'Reject projects',
    },

    // Audit & Compliance
    'audit.read': {
      id: 'audit.read',
      resource: 'audit',
      action: 'read',
      description: 'View audit logs',
    },
    'audit.export': {
      id: 'audit.export',
      resource: 'audit',
      action: 'admin',
      description: 'Export audit logs',
    },
    'compliance.read': {
      id: 'compliance.read',
      resource: 'compliance',
      action: 'read',
      description: 'View compliance reports',
    },
    'compliance.generate': {
      id: 'compliance.generate',
      resource: 'compliance',
      action: 'admin',
      description: 'Generate compliance reports',
    },

    // Security
    'security.read': {
      id: 'security.read',
      resource: 'security',
      action: 'read',
      description: 'View security events',
    },
    'security.manage': {
      id: 'security.manage',
      resource: 'security',
      action: 'admin',
      description: 'Manage security settings',
    },

    // API Management
    'api_key.create': {
      id: 'api_key.create',
      resource: 'api_key',
      action: 'create',
      description: 'Create API keys',
    },
    'api_key.read': {
      id: 'api_key.read',
      resource: 'api_key',
      action: 'read',
      description: 'View API keys',
    },
    'api_key.update': {
      id: 'api_key.update',
      resource: 'api_key',
      action: 'update',
      description: 'Update API keys',
    },
    'api_key.delete': {
      id: 'api_key.delete',
      resource: 'api_key',
      action: 'delete',
      description: 'Delete API keys',
    },
    'api_key.revoke': {
      id: 'api_key.revoke',
      resource: 'api_key',
      action: 'admin',
      description: 'Revoke API keys',
    },

    // Billing
    'billing.read': {
      id: 'billing.read',
      resource: 'billing',
      action: 'read',
      description: 'View billing information',
    },
    'billing.manage': {
      id: 'billing.manage',
      resource: 'billing',
      action: 'admin',
      description: 'Manage billing settings',
    },

    // System
    'system.config': {
      id: 'system.config',
      resource: 'system',
      action: 'admin',
      description: 'Modify system configuration',
    },
    'system.feature_flags': {
      id: 'system.feature_flags',
      resource: 'system',
      action: 'admin',
      description: 'Toggle feature flags',
    },
  };

  /**
   * Predefined system roles
   */
  private readonly SYSTEM_ROLES: Record<string, Omit<Role, 'id' | 'createdAt' | 'updatedAt'>> = {
    super_admin: {
      name: 'Super Admin',
      description: 'Full system access including all administrative functions',
      organizationId: 'system',
      permissions: Object.values(this.PERMISSIONS).map(p => p.id),
      isSystem: true,
    },
    admin: {
      name: 'Admin',
      description: 'Administrative access to manage users, roles, and organizations',
      organizationId: 'system',
      permissions: [
        'user.create',
        'user.read',
        'user.update',
        'user.delete',
        'organization.create',
        'organization.read',
        'organization.update',
        'organization.delete',
        'role.create',
        'role.read',
        'role.update',
        'role.delete',
        'role.assign',
        'role.revoke',
        'audit.read',
        'audit.export',
        'compliance.read',
        'compliance.generate',
        'security.read',
        'security.manage',
        'api_key.create',
        'api_key.read',
        'api_key.update',
        'api_key.delete',
        'api_key.revoke',
        'billing.read',
        'billing.manage',
      ],
      isSystem: true,
    },
    user: {
      name: 'User',
      description: 'Standard user access',
      organizationId: 'system',
      permissions: [
        'riu.create',
        'riu.read',
        'riu.update',
        'riu.delete',
        'project.create',
        'project.read',
        'project.update',
        'audit.read',
      ],
      isSystem: true,
    },
    viewer: {
      name: 'Viewer',
      description: 'Read-only access to view data',
      organizationId: 'system',
      permissions: [
        'riu.read',
        'project.read',
        'audit.read',
        'compliance.read',
      ],
      isSystem: true,
    },
  };

  /**
   * Create a new role
   */
  async createRole(data: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const result = await query(
      `INSERT INTO roles (name, description, organization_id, permissions, is_system, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [
        data.name,
        data.description,
        data.organizationId,
        JSON.stringify(data.permissions),
        data.isSystem || false,
      ]
    );

    return result[0];
  }

  /**
   * Update an existing role
   */
  async updateRole(roleId: string, data: Partial<Role>): Promise<Role> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = $1');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = $2');
      values.push(data.description);
    }
    if (data.permissions !== undefined) {
      updates.push('permissions = $3');
      values.push(JSON.stringify(data.permissions));
    }
    if (data.isSystem !== undefined) {
      updates.push('is_system = $4');
      values.push(data.isSystem);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    values.push('updated_at = NOW()');

    const result = await query(
      `UPDATE roles SET ${updates.join(', ')} WHERE id = $5 RETURNING *`,
      [...values, roleId]
    );

    return result[0];
  }

  /**
   * Delete a role
   */
  async deleteRole(roleId: string): Promise<void> {
    await query('DELETE FROM roles WHERE id = $1', [roleId]);
  }

  /**
   * Get a role by ID
   */
  async getRole(roleId: string): Promise<Role | null> {
    const result = await query(
      'SELECT * FROM roles WHERE id = $1',
      [roleId]
    );

    return result[0] || null;
  }

  /**
   * Get all roles for an organization
   */
  async getRolesForOrganization(organizationId: string): Promise<Role[]> {
    const result = await query(
      'SELECT * FROM roles WHERE organization_id = $1 ORDER BY name',
      [organizationId]
    );

    return result;
  }

  /**
   * Assign a role to a user
   */
  async assignRole(
     userId: string,
     roleId: string,
     organizationId: string,
     assignedBy: string,
     expiresAt?: Date
   ): Promise<UserRole> {
    const result = await query(
      `INSERT INTO user_roles (user_id, role_id, organization_id, assigned_by, assigned_at, expires_at)
       VALUES ($1, $2, $3, $4, NOW(), $5)
       RETURNING *`,
      [userId, roleId, organizationId, assignedBy, expiresAt || null]
    );

    return result[0];
  }

  /**
   * Revoke a role from a user
   */
  async revokeRole(userId: string, roleId: string, organizationId: string): Promise<void> {
    await query(
      `DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2 AND organization_id = $3`,
      [userId, roleId, organizationId]
    );
  }

  /**
   * Get user roles for an organization
   */
  async getUserRoles(userId: string, organizationId: string): Promise<UserRole[]> {
    const result = await query(
      `SELECT 
        ur.*,
        r.id as role_id,
        r.name as role_name,
        r.permissions as role_permissions,
        ur.expires_at as role_expires_at
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1 AND ur.organization_id = $2
       ORDER BY ur.assigned_at DESC`,
      [userId, organizationId]
    );

    return result;
  }

  /**
   * Check if a user has a specific permission
   */
  async hasPermission(
     userId: string,
     permissionId: string
   ): Promise<boolean> {
    const result = await query(
      `SELECT EXISTS(
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = $1
          AND r.permissions @> $2
          AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      )`,
      [userId, permissionId]
    );

    return result[0].exists;
  }

  /**
   * Check if a user has any of the specified permissions
   */
  async hasAnyPermission(
     userId: string,
     permissionIds: string[]
   ): Promise<boolean> {
    const permissionsArray = `{${permissionIds.join(',')}}`;
    const result = await query(
      `SELECT EXISTS(
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = $1
          AND r.permissions @> $2
          AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      )`,
      [userId, permissionsArray]
    );

    return result[0].exists;
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string, organizationId: string): Promise<Permission[]> {
    const result = await query(
      `SELECT DISTINCT r.permissions
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1 AND ur.organization_id = $2
         AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
       ORDER BY r.permissions`,
      [userId, organizationId]
    );

    return result.map(row => JSON.parse(row.permissions));
  }

  /**
   * Create a new organization
   */
  async createOrganization(data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    const result = await query(
      `INSERT INTO organizations (name, domain, sso_provider, sso_config, settings, subscription_tier, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [
        data.name,
        data.domain || null,
        data.ssoProvider || null,
        JSON.stringify(data.ssoConfig || {}),
        JSON.stringify(data.settings || {}),
        data.subscriptionTier || 'starter',
      ]
    );

    return result[0];
  }

  /**
   * Update an organization
   */
  async updateOrganization(organizationId: string, data: Partial<Organization>): Promise<Organization> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = $1');
      values.push(data.name);
    }
    if (data.domain !== undefined) {
      updates.push('domain = $2');
      values.push(data.domain);
    }
    if (data.ssoProvider !== undefined) {
      updates.push('sso_provider = $3');
      values.push(data.ssoProvider);
    }
    if (data.ssoConfig !== undefined) {
      updates.push('sso_config = $4');
      values.push(JSON.stringify(data.ssoConfig || {}));
    }
    if (data.settings !== undefined) {
      updates.push('settings = $5');
      values.push(JSON.stringify(data.settings || {}));
    }
    if (data.subscriptionTier !== undefined) {
      updates.push('subscription_tier = $6');
      values.push(data.subscriptionTier);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    values.push('updated_at = NOW()');

    const result = await query(
      `UPDATE organizations SET ${updates.join(', ')} WHERE id = $7 RETURNING *`,
      [...values, organizationId]
    );

    return result[0];
  }

  /**
   * Get organization by ID
   */
  async getOrganization(organizationId: string): Promise<Organization | null> {
    const result = await query(
      'SELECT * FROM organizations WHERE id = $1',
      [organizationId]
    );

    return result[0] || null;
  }

  /**
   * Get organization by domain
   */
  async getOrganizationByDomain(domain: string): Promise<Organization | null> {
    const result = await query(
      'SELECT * FROM organizations WHERE domain = $1',
      [domain]
    );

    return result[0] || null;
  }

  /**
   * Update organization settings
   */
  async updateOrganizationSettings(
     organizationId: string,
     settings: Partial<OrganizationSettings>
   ): Promise<void> {
    await query(
      `UPDATE organizations 
       SET settings = $1
       WHERE id = $2`,
      [JSON.stringify(settings), organizationId]
    );
  }

  /**
   * Get predefined permissions
   */
  getPermissions(): Record<string, Permission> {
    return this.PERMISSIONS;
  }

  /**
   * Get predefined roles
   */
  getRoles(): Record<string, Omit<Role, 'id' | 'createdAt' | 'updatedAt'>> {
    return this.SYSTEM_ROLES;
  }

  /**
   * Get role by name
   */
  getRoleByName(roleName: string): Omit<Role, 'id' | 'createdAt' | 'updatedAt'> | null {
    const role = Object.values(this.SYSTEM_ROLES).find(r => r.name === roleName);
    return role || null;
  }

  /**
   * Check if a role has a specific permission
   */
  roleHasPermission(roleName: string, permissionId: string): boolean {
    const role = this.getRoleByName(roleName);
    if (!role) return false;
    return role.permissions.some(p => p === permissionId);
  }

  /**
   * Get all permissions for a role
   */
  getRolePermissions(roleName: string): string[] {
    const role = this.getRoleByName(roleName);
    if (!role) return [];
    return role.permissions;
  }
}

// Export singleton instance
export const rbacService = new RBACService();
