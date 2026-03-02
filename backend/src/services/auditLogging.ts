/**
 * User Activity Logging Service
 * 
 * Provides comprehensive audit trail logging for all user activities,
 * including authentication, data access, modifications, and security events.
 */

import { query } from '../db';
import { encryptSensitiveFields, decryptSensitiveFields } from './encryption';
import redisClient from '../redisClient';
import crypto from 'crypto';

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  status: 'success' | 'failure' | 'pending';
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AuditLogQuery {
  userId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  status?: 'success' | 'failure' | 'pending';
  severity?: 'info' | 'warning' | 'error' | 'critical';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  orderBy?: 'timestamp' | 'severity';
  order?: 'asc' | 'desc';
}

export interface AuditLogStats {
  totalLogs: number;
  logsByAction: Record<string, number>;
  logsByStatus: Record<string, number>;
  logsBySeverity: Record<string, number>;
  topUsers: { userId: string; count: number }[];
  recentActivity: { action: string; count: number }[];
}

class AuditLoggingService {
  private readonly CACHE_TTL = 3600; // 1 hour for cached stats
  private readonly SENSITIVE_FIELDS = ['password', 'token', 'secret', 'apiKey', 'creditCard'];

  /**
   * Sanitize sensitive data from details
   */
  private sanitizeDetails(details?: Record<string, any>): Record<string, any> | undefined {
    if (!details) return undefined;

    const sanitized = { ...details };
    
    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase();
      if (this.SENSITIVE_FIELDS.some(f => lowerKey.includes(f.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Find sensitive fields in details
   */
  private findSensitiveFields(details: Record<string, any>): string[] {
    const fields: string[] = [];
    
    for (const key of Object.keys(details)) {
      const lowerKey = key.toLowerCase();
      if (this.SENSITIVE_FIELDS.some(f => lowerKey.includes(f.toLowerCase()))) {
        fields.push(key);
      }
    }

    return fields;
  }

  /**
   * Publish audit event to Redis for real-time monitoring
   */
  private async publishToRedis(auditLog: AuditLog): Promise<void> {
    try {
      await redisClient.publish('audit-events', JSON.stringify(auditLog));
    } catch {
      // Ignore Redis publish errors
    }
  }

  // Predefined audit events
  readonly EVENTS = {
    // Authentication events
    LOGIN_SUCCESS: 'user.login.success',
    LOGIN_FAILURE: 'user.login.failure',
    LOGOUT: 'user.logout',
    PASSWORD_CHANGE: 'user.password.change',
    PASSWORD_RESET: 'user.password.reset',
    MFA_ENABLED: 'user.mfa.enabled',
    MFA_DISABLED: 'user.mfa.disabled',
    SESSION_CREATED: 'user.session.created',
    SESSION_EXPIRED: 'user.session.expired',
    SESSION_REVOKED: 'user.session.revoked',
    
    // Authorization events
    ACCESS_DENIED: 'access.denied',
    PERMISSION_GRANTED: 'permission.granted',
    PERMISSION_REVOKED: 'permission.revoked',
    ROLE_CHANGED: 'user.role.changed',
    
    // Data access events
    DATA_READ: 'data.read',
    DATA_EXPORT: 'data.export',
    DATA_DOWNLOAD: 'data.download',
    
    // Data modification events
    DATA_CREATED: 'data.created',
    DATA_UPDATED: 'data.updated',
    DATA_DELETED: 'data.deleted',
    DATA_RESTORED: 'data.restored',
    
    // Security events
    SUSPICIOUS_ACTIVITY: 'security.suspicious',
    RATE_LIMIT_EXCEEDED: 'security.rate_limit',
    IP_BLOCKED: 'security.ip_blocked',
    API_KEY_CREATED: 'api_key.created',
    API_KEY_REVOKED: 'api_key.revoked',
    
    // System events
    CONFIG_CHANGED: 'system.config.changed',
    BACKUP_CREATED: 'system.backup.created',
    BACKUP_RESTORED: 'system.backup.restored',
  };

  /**
   * Log an audit event
   */
  async log(event: Partial<AuditLog>): Promise<AuditLog> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    
    // Sanitize sensitive data from details
    const sanitizedDetails = this.sanitizeDetails(event.details);
    
    // Encrypt sensitive fields if present
    let encryptedDetails = sanitizedDetails;
    if (sanitizedDetails) {
      const sensitiveFields = this.findSensitiveFields(sanitizedDetails);
      if (sensitiveFields.length > 0) {
        encryptedDetails = await encryptSensitiveFields(sanitizedDetails, sensitiveFields) as Record<string, any>;
      }
    }

    const auditLog: AuditLog = {
      id,
      userId: event.userId,
      userEmail: event.userEmail,
      action: event.action || 'unknown',
      resourceType: event.resourceType || 'system',
      resourceId: event.resourceId,
      details: encryptedDetails,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      sessionId: event.sessionId,
      status: event.status || 'success',
      severity: event.severity || 'info',
      timestamp,
      metadata: event.metadata
    };

    try {
      // Store in database
      await query(
        `INSERT INTO audit_logs 
         (id, user_id, user_email, action, resource_type, resource_id, details, ip_address, user_agent, session_id, status, severity, timestamp, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          auditLog.id,
          auditLog.userId,
          auditLog.userEmail,
          auditLog.action,
          auditLog.resourceType,
          auditLog.resourceId,
          auditLog.details ? JSON.stringify(auditLog.details) : null,
          auditLog.ipAddress,
          auditLog.userAgent,
          auditLog.sessionId,
          auditLog.status,
          auditLog.severity,
          auditLog.timestamp,
          auditLog.metadata ? JSON.stringify(auditLog.metadata) : null
        ]
      );

      // Also emit to Redis for real-time monitoring
      await this.publishToRedis(auditLog);

      return auditLog;
    } catch (error) {
      // Log to console as fallback
      console.error('[audit] Failed to store audit log:', error);
      console.log('[audit] Fallback log:', JSON.stringify(auditLog));
      return auditLog;
    }
  }

  /**
   * Log with convenience method
   */
  async logEvent(
    action: string,
    userId: string | undefined,
    details?: Record<string, any>,
    options?: {
      resourceType?: string;
      resourceId?: string;
      status?: 'success' | 'failure' | 'pending';
      severity?: 'info' | 'warning' | 'error' | 'critical';
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<AuditLog> {
    return this.log({
      action,
      userId,
      resourceType: options?.resourceType,
      resourceId: options?.resourceId,
      details,
      status: options?.status,
      severity: options?.severity,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      sessionId: options?.sessionId,
      metadata: options?.metadata
    });
  }

  /**
   * Query audit logs with filters
   */
  async query(query: AuditLogQuery): Promise<{ logs: AuditLog[]; total: number }> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (query.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      params.push(query.userId);
    }

    if (query.action) {
      conditions.push(`action = $${paramIndex++}`);
      params.push(query.action);
    }

    if (query.resourceType) {
      conditions.push(`resource_type = $${paramIndex++}`);
      params.push(query.resourceType);
    }

    if (query.resourceId) {
      conditions.push(`resource_id = $${paramIndex++}`);
      params.push(query.resourceId);
    }

    if (query.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(query.status);
    }

    if (query.severity) {
      conditions.push(`severity = $${paramIndex++}`);
      params.push(query.severity);
    }

    if (query.startDate) {
      conditions.push(`timestamp >= $${paramIndex++}`);
      params.push(query.startDate);
    }

    if (query.endDate) {
      conditions.push(`timestamp <= $${paramIndex++}`);
      params.push(query.endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderBy = query.orderBy || 'timestamp';
    const order = query.order || 'desc';
    const limit = query.limit || 100;
    const offset = query.offset || 0;

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`,
      params
    );
    const total = parseInt(countResult[0]?.total || '0');

    // Get logs
    const result = await query(
      `SELECT * FROM audit_logs 
       ${whereClause} 
       ORDER BY ${orderBy} ${order} 
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    );

    // Decrypt sensitive details
    const logs: AuditLog[] = await Promise.all(
      result.map(async (row: any) => {
        let details = row.details;
        if (details && typeof details === 'string') {
          try {
            details = JSON.parse(details);
            // Try to decrypt sensitive fields
            details = await decryptSensitiveFields(details, this.SENSITIVE_FIELDS);
          } catch {
            // Not JSON or not decryptable
          }
        }
        return {
          id: row.id,
          userId: row.user_id,
          userEmail: row.user_email,
          action: row.action,
          resourceType: row.resource_type,
          resourceId: row.resource_id,
          details,
          ipAddress: row.ip_address,
          userAgent: row.user_agent,
          sessionId: row.session_id,
          status: row.status,
          severity: row.severity,
          timestamp: new Date(row.timestamp),
          metadata: row.metadata ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) : undefined
        };
      })
    );

    return { logs, total };
  }

  /**
   * Get audit statistics
   */
  async getStats(startDate?: Date, endDate?: Date): Promise<AuditLogStats> {
    const cacheKey = `audit_stats:${startDate?.toISOString() || 'all'}:${endDate?.toISOString() || 'all'}`;
    
    // Try cache first
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore cache errors
    }

    const hasDateFilter = startDate || endDate;
    let dateFilter = '';
    const params: any[] = [];
    
    if (hasDateFilter) {
      const conditions: string[] = [];
      if (startDate) {
        conditions.push('timestamp >= $1');
        params.push(startDate);
      }
      if (endDate) {
        conditions.push(`timestamp <= $${params.length + 1}`);
        params.push(endDate);
      }
      dateFilter = `WHERE ${conditions.join(' AND ')}`;
    }

    // Get total count
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM audit_logs ${dateFilter}`,
      params
    );

    // Get counts by action
    const actionResult = await query(
      `SELECT action, COUNT(*) as count FROM audit_logs ${dateFilter} GROUP BY action`,
      params
    );

    // Get counts by status
    const statusResult = await query(
      `SELECT status, COUNT(*) as count FROM audit_logs ${dateFilter} GROUP BY status`,
      params
    );

    // Get counts by severity
    const severityResult = await query(
      `SELECT severity, COUNT(*) as count FROM audit_logs ${dateFilter} GROUP BY severity`,
      params
    );

    // Get top users
    const usersResult = await query(
      `SELECT user_id, COUNT(*) as count FROM audit_logs ${dateFilter} AND user_id IS NOT NULL GROUP BY user_id ORDER BY count DESC LIMIT 10`,
      params
    );

    const stats: AuditLogStats = {
      totalLogs: parseInt(totalResult[0]?.total || '0'),
      logsByAction: Object.fromEntries(actionResult.map((r: any) => [r.action, parseInt(r.count)])),
      logsByStatus: Object.fromEntries(statusResult.map((r: any) => [r.status, parseInt(r.count)])),
      logsBySeverity: Object.fromEntries(severityResult.map((r: any) => [r.severity, parseInt(r.count)])),
      topUsers: usersResult.map((r: any) => ({ userId: r.user_id, count: parseInt(r.count) })),
      recentActivity: actionResult.map((r: any) => ({ action: r.action, count: parseInt(r.count) }))
    };

    // Cache the stats
    try {
      await redisClient.setex(cacheKey, this.CACHE_TTL, JSON.stringify(stats));
    } catch {
      // Ignore cache errors
    }

    return stats;
  }

  /**
   * Get recent activity for a user
   */
  async getUserActivity(userId: string, limit: number = 50): Promise<AuditLog[]> {
    const result = await query(
      `SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2`,
      [userId, limit]
    );

    return result.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      action: row.action,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      details: row.details,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      sessionId: row.session_id,
      status: row.status,
      severity: row.severity,
      timestamp: new Date(row.timestamp),
      metadata: row.metadata
    }));
  }

  /**
   * Get activity timeline for dashboard
   */
  async getActivityTimeline(hours: number = 24): Promise<{ hour: string; count: number }[]> {
    const result = await query(
      `SELECT date_trunc('hour', timestamp) as hour, COUNT(*) as count 
       FROM audit_logs 
       WHERE timestamp > NOW() - INTERVAL '${hours} hours'
       GROUP BY hour 
       ORDER BY hour`
    );

    return result.map((row: any) => ({
      hour: row.hour.toISOString(),
      count: parseInt(row.count)
    }));
  }

  /**
   * Create audit trail for a request
   */
  createRequestAuditData(req: any, userId?: string): Partial<AuditLog> {
    return {
      userId,
      userEmail: req.user?.email,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID
    };
  }
}

// Export singleton instance
export const auditLoggingService = new AuditLoggingService();

// Convenience exports
export const AUDIT_EVENTS = auditLoggingService.EVENTS;

export async function logAuditEvent(
  action: string,
  userId: string | undefined,
  details?: Record<string, any>,
  options?: {
    resourceType?: string;
    resourceId?: string;
    status?: 'success' | 'failure' | 'pending';
    severity?: 'info' | 'warning' | 'error' | 'critical';
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }
): Promise<AuditLog> {
  return auditLoggingService.logEvent(action, userId, details, options);
}

export async function queryAuditLogs(query: AuditLogQuery): Promise<{ logs: AuditLog[]; total: number }> {
  return auditLoggingService.query(query);
}

export async function getAuditStats(startDate?: Date, endDate?: Date): Promise<AuditLogStats> {
  return auditLoggingService.getStats(startDate, endDate);
}

export async function getUserAuditActivity(userId: string, limit?: number): Promise<AuditLog[]> {
  return auditLoggingService.getUserActivity(userId, limit);
}

export async function getActivityTimeline(hours?: number): Promise<{ hour: string; count: number }[]> {
  return auditLoggingService.getActivityTimeline(hours);
}
