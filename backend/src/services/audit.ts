/**
 * Audit Logging Service
 * 
 * Comprehensive audit logging for compliance, security, and accountability.
 * Tracks all system actions with full context and metadata.
 */

import { db } from '../db';
import { Request } from 'express';

export interface AuditLog {
  id: string;
  userId?: string;
  organizationId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;
  status: 'success' | 'failure' | 'warning';
  errorMessage?: string;
  timestamp: Date;
}

export interface AuditFilters {
  userId?: string;
  organizationId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  status?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export class AuditService {
  /**
   * Log an audit event
   */
  async log(data: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const result = await db.query(
      `INSERT INTO audit_logs (
        user_id, organization_id, action, resource, resource_id,
        details, ip_address, user_agent, request_id, session_id,
        status, error_message, timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING *`,
      [
        data.userId || null,
        data.organizationId || null,
        data.action,
        data.resource,
        data.resourceId || null,
        JSON.stringify(data.details || {}),
        data.ipAddress || null,
        data.userAgent || null,
        data.requestId || null,
        data.sessionId || null,
        data.status,
        data.errorMessage || null,
      ]
    );

    return result[0];
  }

  /**
   * Log an audit event from an Express request
   */
  async logFromRequest(
    req: Request,
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, any>,
    status: 'success' | 'failure' | 'warning' = 'success',
    errorMessage?: string
  ): Promise<AuditLog> {
    return this.log({
      userId: (req as any).user?.id,
      organizationId: (req as any).user?.organizationId,
      action,
      resource,
      resourceId,
      details: details || {},
      ipAddress: this.getClientIP(req),
      userAgent: req.get('user-agent'),
      requestId: (req as any).id,
      sessionId: (req as any).sessionID,
      status,
      errorMessage,
    });
  }

  /**
   * Query audit logs with filters
   */
  async query(filters: AuditFilters): Promise<AuditLog[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      values.push(filters.userId);
    }

    if (filters.organizationId) {
      conditions.push(`organization_id = $${paramIndex++}`);
      values.push(filters.organizationId);
    }

    if (filters.action) {
      conditions.push(`action = $${paramIndex++}`);
      values.push(filters.action);
    }

    if (filters.resource) {
      conditions.push(`resource = $${paramIndex++}`);
      values.push(filters.resource);
    }

    if (filters.resourceId) {
      conditions.push(`resource_id = $${paramIndex++}`);
      values.push(filters.resourceId);
    }

    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(filters.status);
    }

    if (filters.from) {
      conditions.push(`timestamp >= $${paramIndex++}`);
      values.push(filters.from);
    }

    if (filters.to) {
      conditions.push(`timestamp <= $${paramIndex++}`);
      values.push(filters.to);
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';

    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    const result = await db.query(
      `SELECT * FROM audit_logs
       ${whereClause}
       ORDER BY timestamp DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...values, limit, offset]
    );

    return result;
  }

  /**
   * Get audit log by ID
   */
  async getById(id: string): Promise<AuditLog | null> {
    const result = await db.query(
      'SELECT * FROM audit_logs WHERE id = $1',
      [id]
    );

    return result[0] || null;
  }

  /**
   * Get audit statistics for an organization
   */
  async getStatistics(organizationId: string, period: { from: Date; to: Date }) {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_events,
        COUNT(CASE WHEN status = 'failure' THEN 1 END) as failed_events,
        COUNT(CASE WHEN status = 'warning' THEN 1 END) as warning_events,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT action) as unique_actions,
        COUNT(DISTINCT resource) as unique_resources
       FROM audit_logs
       WHERE organization_id = $1
         AND timestamp >= $2
         AND timestamp <= $3`,
      [organizationId, period.from, period.to]
    );

    return result[0];
  }

  /**
   * Get action breakdown for an organization
   */
  async getActionBreakdown(organizationId: string, period: { from: Date; to: Date }) {
    const result = await db.query(
      `SELECT 
        action,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
        COUNT(CASE WHEN status = 'failure' THEN 1 END) as failed
       FROM audit_logs
       WHERE organization_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
       GROUP BY action
       ORDER BY count DESC
       LIMIT 20`,
      [organizationId, period.from, period.to]
    );

    return result;
  }

  /**
   * Get resource breakdown for an organization
   */
  async getResourceBreakdown(organizationId: string, period: { from: Date; to: Date }) {
    const result = await db.query(
      `SELECT 
        resource,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
       FROM audit_logs
       WHERE organization_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
       GROUP BY resource
       ORDER BY count DESC
       LIMIT 20`,
      [organizationId, period.from, period.to]
    );

    return result;
  }

  /**
   * Get user activity for an organization
   */
  async getUserActivity(organizationId: string, period: { from: Date; to: Date }, limit: number = 20) {
    const result = await db.query(
      `SELECT 
        user_id,
        COUNT(*) as total_actions,
        COUNT(DISTINCT action) as unique_actions,
        COUNT(DISTINCT resource) as unique_resources,
        MAX(timestamp) as last_activity
       FROM audit_logs
       WHERE organization_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
       GROUP BY user_id
       ORDER BY total_actions DESC
       LIMIT $4`,
      [organizationId, period.from, period.to, limit]
    );

    return result;
  }

  /**
   * Export audit logs to CSV
   */
  async exportToCSV(filters: AuditFilters): Promise<string> {
    const logs = await this.query({ ...filters, limit: 10000 });
    
    const headers = [
      'timestamp',
      'user_id',
      'organization_id',
      'action',
      'resource',
      'resource_id',
      'status',
      'ip_address',
      'details',
    ];

    const rows = logs.map(log => [
      log.timestamp,
      log.userId || '',
      log.organizationId || '',
      log.action,
      log.resource,
      log.resourceId || '',
      log.status,
      log.ipAddress || '',
      JSON.stringify(log.details).replace(/"/g, '""'),
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
  }

  /**
   * Export audit logs to JSON
   */
  async exportToJSON(filters: AuditFilters): Promise<string> {
    const logs = await this.query({ ...filters, limit: 10000 });
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Get client IP address from request
   */
  private getClientIP(req: Request): string | undefined {
    return (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.socket.remoteAddress
    );
  }

  /**
   * Cleanup old audit logs based on retention policy
   */
  async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    const result = await db.query(
      `DELETE FROM audit_logs
       WHERE timestamp < NOW() - INTERVAL '1 day' * $1
       RETURNING id`,
      [retentionDays]
    );

    // Log the cleanup
    await this.log({
      action: 'audit.cleanup',
      resource: 'audit_logs',
      details: { deletedCount: result.length, retentionDays },
      status: 'success',
    });

    return result.length;
  }

  /**
   * Get audit log retention statistics
   */
  async getRetentionStats(): Promise<{
    totalLogs: number;
    logsOlderThan1Year: number;
    logsOlderThan6Months: number;
    logsOlderThan3Months: number;
    oldestLog?: Date;
    newestLog?: Date;
  }> {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_logs,
        COUNT(*) FILTER (WHERE timestamp < NOW() - INTERVAL '1 year') as logs_older_than_1_year,
        COUNT(*) FILTER (WHERE timestamp < NOW() - INTERVAL '6 months') as logs_older_than_6_months,
        COUNT(*) FILTER (WHERE timestamp < NOW() - INTERVAL '3 months') as logs_older_than_3_months,
        MIN(timestamp) as oldest_log,
        MAX(timestamp) as newest_log
      FROM audit_logs
    `);

    return {
      totalLogs: parseInt(result[0].total_logs),
      logsOlderThan1Year: parseInt(result[0].logs_older_than_1_year),
      logsOlderThan6Months: parseInt(result[0].logs_older_than_6_months),
      logsOlderThan3Months: parseInt(result[0].logs_older_than_3_months),
      oldestLog: result[0].oldest_log,
      newestLog: result[0].newest_log,
    };
  }
}

// Export singleton instance
export const auditService = new AuditService();

// Predefined action constants for type safety
export const AuditActions = {
  // Authentication
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_REGISTER: 'user.register',
  USER_PASSWORD_RESET: 'user.password_reset',
  USER_MFA_ENABLED: 'user.mfa_enabled',
  USER_MFA_DISABLED: 'user.mfa_disabled',

  // Organization
  ORG_CREATE: 'organization.create',
  ORG_UPDATE: 'organization.update',
  ORG_DELETE: 'organization.delete',
  ORG_INVITE_USER: 'organization.invite_user',
  ORG_REMOVE_USER: 'organization.remove_user',

  // Roles & Permissions
  ROLE_CREATE: 'role.create',
  ROLE_UPDATE: 'role.update',
  ROLE_DELETE: 'role.delete',
  ROLE_ASSIGN: 'role.assign',
  ROLE_REVOKE: 'role.revoke',

  // API Keys
  API_KEY_CREATE: 'api_key.create',
  API_KEY_UPDATE: 'api_key.update',
  API_KEY_DELETE: 'api_key.delete',
  API_KEY_REVOKE: 'api_key.revoke',

  // RIUs (Regenerative Impact Units)
  RIU_CREATE: 'riu.create',
  RIU_UPDATE: 'riu.update',
  RIU_DELETE: 'riu.delete',
  RIU_TRANSFER: 'riu.transfer',
  RIU_RETIRE: 'riu.retire',

  // Projects
  PROJECT_CREATE: 'project.create',
  PROJECT_UPDATE: 'project.update',
  PROJECT_DELETE: 'project.delete',
  PROJECT_APPROVE: 'project.approve',
  PROJECT_REJECT: 'project.reject',

  // Measurements
  MEASUREMENT_CREATE: 'measurement.create',
  MEASUREMENT_UPDATE: 'measurement.update',
  MEASUREMENT_DELETE: 'measurement.delete',

  // Governance
  GOVERNANCE_VOTE: 'governance.vote',
  GOVERNANCE_PROPOSAL_CREATE: 'governance.proposal_create',
  GOVERNANCE_PROPOSAL_APPROVE: 'governance.proposal_approve',

  // Security
  SECURITY_EVENT: 'security.event',
  SECURITY_INCIDENT: 'security.incident',
  SECURITY_ESCALATION: 'security.escalation',

  // Compliance
  COMPLIANCE_REPORT_GENERATE: 'compliance.report_generate',
  COMPLIANCE_AUDIT: 'compliance.audit',

  // Data
  DATA_EXPORT: 'data.export',
  DATA_IMPORT: 'data.import',
  DATA_DELETE: 'data.delete',

  // System
  SYSTEM_CONFIG_UPDATE: 'system.config_update',
  SYSTEM_FEATURE_FLAG: 'system.feature_flag',
  SYSTEM_MAINTENANCE: 'system.maintenance',
} as const;

// Predefined resource constants
export const AuditResources = {
  USER: 'user',
  ORGANIZATION: 'organization',
  ROLE: 'role',
  PERMISSION: 'permission',
  API_KEY: 'api_key',
  RIU: 'riu',
  PROJECT: 'project',
  MEASUREMENT: 'measurement',
  GOVERNANCE: 'governance',
  SECURITY: 'security',
  COMPLIANCE: 'compliance',
  DATA: 'data',
  SYSTEM: 'system',
} as const;
