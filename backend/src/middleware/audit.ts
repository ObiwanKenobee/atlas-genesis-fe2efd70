/**
 * Audit Trail Middleware
 * 
 * Automatic audit logging middleware for Express routes.
 * Captures request/response data and logs audit events.
 */

import { Request, Response, NextFunction } from 'express';
import { auditLoggingService, AUDIT_EVENTS, AuditLog } from '../services/auditLogging';

export interface AuditMiddlewareOptions {
  action: string;
  resourceType: string;
  resourceId?: ((req: Request, res: Response) => string) | string;
  includeBody?: boolean;
  includeResponse?: boolean;
  excludePaths?: string[];
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * Create audit middleware for a specific action
 */
export const auditMiddleware = (options: AuditMiddlewareOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip excluded paths
    if (options.excludePaths?.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Store original end function
    const originalEnd = res.end;
    const startTime = Date.now();

    // Capture response
    let responseBody: any;
    let statusCode: number;

    res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
      try {
        statusCode = res.statusCode;
        
        // Capture response body if enabled
        if (options.includeResponse && chunk) {
          try {
            responseBody = JSON.parse(chunk.toString());
          } catch {
            responseBody = chunk.toString();
          }
        }
      } catch (error) {
        // Ignore errors in response capture
      }

      // Call original end
      return originalEnd.call(this, chunk, encoding, callback);
    };

    // Log when response finishes
    res.on('finish', async () => {
      try {
        // Determine resource ID
        let resourceId: string | undefined;
        if (typeof options.resourceId === 'function') {
          resourceId = options.resourceId(req, res);
        } else if (typeof options.resourceId === 'string') {
          resourceId = options.resourceId;
        } else if (req.params.id) {
          resourceId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        }

        // Determine status
        const status = res.statusCode >= 400 ? 'failure' : 'success';
        
        // Determine severity
        const severity = options.severity || (status === 'failure' ? 'warning' : 'info');

        // Build details
        const details: Record<string, any> = {
          method: req.method,
          path: req.path,
          query: req.query,
          statusCode: res.statusCode,
          duration: Date.now() - startTime
        };

        // Include body if enabled and present
        if (options.includeBody && req.body && Object.keys(req.body).length > 0) {
          details.requestBody = req.body;
        }

        // Include response if enabled
        if (options.includeResponse && responseBody) {
          details.responseBody = responseBody;
        }

        // Log the audit event
        await auditLoggingService.logEvent(
          options.action,
          (req as any).user?.id,
          details,
          {
            resourceType: options.resourceType,
            resourceId,
            status,
            severity,
            ipAddress: req.ip || (req as any).connection?.remoteAddress,
            userAgent: req.get('User-Agent'),
            sessionId: (req as any).sessionID || (req as any).session?.id
          }
        );
      } catch (error) {
        console.error('[audit-middleware] Failed to log audit event:', error);
      }
    });

    next();
  };
};

/**
 * Audit middleware for data access (read operations)
 */
export const auditDataAccess = (resourceType: string, options?: Partial<AuditMiddlewareOptions>) => {
  return auditMiddleware({
    action: AUDIT_EVENTS.DATA_READ,
    resourceType,
    severity: 'info',
    includeBody: false,
    includeResponse: false,
    ...options
  });
};

/**
 * Audit middleware for data creation
 */
export const auditDataCreate = (resourceType: string, options?: Partial<AuditMiddlewareOptions>) => {
  return auditMiddleware({
    action: AUDIT_EVENTS.DATA_CREATED,
    resourceType,
    severity: 'info',
    includeBody: true,
    includeResponse: true,
    ...options
  });
};

/**
 * Audit middleware for data update
 */
export const auditDataUpdate = (resourceType: string, options?: Partial<AuditMiddlewareOptions>) => {
  return auditMiddleware({
    action: AUDIT_EVENTS.DATA_UPDATED,
    resourceType,
    severity: 'info',
    includeBody: true,
    includeResponse: true,
    ...options
  });
};

/**
 * Audit middleware for data deletion
 */
export const auditDataDelete = (resourceType: string, options?: Partial<AuditMiddlewareOptions>) => {
  return auditMiddleware({
    action: AUDIT_EVENTS.DATA_DELETED,
    resourceType,
    severity: 'warning',
    includeBody: false,
    includeResponse: false,
    ...options
  });
};

/**
 * Audit middleware for access denied events
 */
export const auditAccessDenied = (req: Request, res: Response, next: NextFunction) => {
  // Store original end
  const originalEnd = res.end;
  
  res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
    if (res.statusCode === 403) {
      auditLoggingService.logEvent(
        AUDIT_EVENTS.ACCESS_DENIED,
        (req as any).user?.id,
        {
          method: req.method,
          path: req.path,
          reason: (req as any).accessDeniedReason || 'Insufficient permissions'
        },
        {
          resourceType: req.path.split('/')[2] || 'unknown',
          status: 'failure',
          severity: 'warning',
          ipAddress: req.ip || (req as any).connection?.remoteAddress,
          userAgent: req.get('User-Agent'),
          sessionId: (req as any).sessionID
        }
      ).catch(error => {
        console.error('[audit] Failed to log access denied:', error);
      });
    }
    
    return originalEnd.call(this, chunk, encoding, callback);
  };
  
  next();
};

/**
 * Request ID middleware for audit correlation
 */
export const auditRequestId = (req: Request, res: Response, next: NextFunction) => {
  const crypto = require('crypto');
  const requestId = crypto.randomUUID();
  
  (req as any).auditRequestId = requestId;
  res.set('X-Audit-Request-ID', requestId);
  
  next();
};

/**
 * Helper function to log custom audit events from routes
 */
export const logAudit = async (
  req: Request,
  action: string,
  details?: Record<string, any>,
  options?: {
    resourceType?: string;
    resourceId?: string;
    severity?: 'info' | 'warning' | 'error' | 'critical';
  }
): Promise<AuditLog> => {
  return auditLoggingService.logEvent(
    action,
    (req as any).user?.id,
    details,
    {
      resourceType: options?.resourceType,
      resourceId: options?.resourceId,
      severity: options?.severity,
      ipAddress: req.ip || (req as any).connection?.remoteAddress,
      userAgent: req.get('User-Agent'),
      sessionId: (req as any).sessionID
    }
  );
};

export default {
  auditMiddleware,
  auditDataAccess,
  auditDataCreate,
  auditDataUpdate,
  auditDataDelete,
  auditAccessDenied,
  auditRequestId,
  logAudit
};
