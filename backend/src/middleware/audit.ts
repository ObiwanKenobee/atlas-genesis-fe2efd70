/**
 * Audit Middleware
 * 
 * Automatically logs all HTTP requests and actions for compliance.
 * Integrates with the audit service to capture full request context.
 */

import { Request, Response, NextFunction } from 'express';
import { auditService, AuditActions, AuditResources } from '../services/audit';

export interface AuditMiddlewareOptions {
  /**
   * Whether to log successful requests
   */
  logSuccess?: boolean;

  /**
   * Whether to log failed requests
   */
  logFailure?: boolean;

  /**
   * Whether to log request body
   */
  logBody?: boolean;

  /**
   * Whether to log response body
   */
  logResponse?: boolean;

  /**
   * Paths to exclude from logging
   */
  excludePaths?: string[];

  /**
   * Custom action name generator
   */
  actionGenerator?: (req: Request) => string;

  /**
   * Custom resource name generator
   */
  resourceGenerator?: (req: Request) => string;
}

/**
 * Create audit middleware with options
 */
export function auditMiddleware(options: AuditMiddlewareOptions = {}) {
  const {
    logSuccess = true,
    logFailure = true,
    logBody = false,
    logResponse = false,
    excludePaths = ['/health', '/metrics'],
    actionGenerator,
    resourceGenerator,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip excluded paths
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Generate unique request ID
    const requestId = crypto.randomUUID();
    (req as any).id = requestId;

    // Capture original methods
    const originalSend = res.send;
    const originalJson = res.json;

    // Track response status
    let statusCode: number = 200;
    let responseBody: any;

    // Override send to capture response
    res.send = function (body: any) {
      statusCode = res.statusCode;
      responseBody = body;
      return originalSend.call(this, body);
    } as any;

    // Override json to capture response
    res.json = function (body: any) {
      statusCode = res.statusCode;
      responseBody = body;
      return originalJson.call(this, body);
    } as any;

    // Continue to next middleware
    const startTime = Date.now();
    next();

    // Log after response is sent
    res.on('finish', async () => {
      const duration = Date.now() - startTime;
      const isSuccess = statusCode >= 200 && statusCode < 400;
      const isFailure = statusCode >= 400;

      // Determine if we should log this request
      const shouldLog = (isSuccess && logSuccess) || (isFailure && logFailure);

      if (!shouldLog) {
        return;
      }

      // Generate action and resource names
      const action = actionGenerator 
        ? actionGenerator(req)
        : generateActionFromRequest(req);
      
      const resource = resourceGenerator
        ? resourceGenerator(req)
        : generateResourceFromRequest(req);

      // Extract resource ID from URL
      const resourceId = extractResourceId(req);

      // Build details object
      const details: Record<string, any> = {
        method: req.method,
        path: req.path,
        query: req.query,
        statusCode,
        duration,
      };

      if (logBody && req.body) {
        // Sanitize sensitive data
        details.body = sanitizeRequestBody(req.body);
      }

      if (logResponse && responseBody) {
        details.response = sanitizeResponseBody(responseBody);
      }

      // Determine status
      let status: 'success' | 'failure' | 'warning' = 'success';
      if (isFailure) {
        status = statusCode >= 500 ? 'failure' : 'warning';
      }

      // Log the audit event
      try {
        await auditService.log({
          userId: (req as any).user?.id,
          organizationId: (req as any).user?.organizationId,
          action,
          resource,
          resourceId,
          details,
          ipAddress: getClientIP(req),
          userAgent: req.get('user-agent'),
          requestId,
          sessionId: (req as any).sessionID,
          status,
          errorMessage: isFailure ? getErrorMessage(responseBody) : undefined,
        });
      } catch (error) {
        // Don't let audit logging errors break the application
        console.error('Failed to log audit event:', error);
      }
    });
  };
}

/**
 * Generate action name from HTTP request
 */
function generateActionFromRequest(req: Request): string {
  const method = req.method.toLowerCase();
  const path = req.path;

  // Map common patterns to audit actions
  if (path.includes('/auth/login')) {
    return AuditActions.USER_LOGIN;
  }
  if (path.includes('/auth/logout')) {
    return AuditActions.USER_LOGOUT;
  }
  if (path.includes('/auth/register')) {
    return AuditActions.USER_REGISTER;
  }
  if (path.includes('/api-keys')) {
    if (method === 'post') return AuditActions.API_KEY_CREATE;
    if (method === 'put' || method === 'patch') return AuditActions.API_KEY_UPDATE;
    if (method === 'delete') return AuditActions.API_KEY_DELETE;
  }
  if (path.includes('/rius')) {
    if (method === 'post') return AuditActions.RIU_CREATE;
    if (method === 'put' || method === 'patch') return AuditActions.RIU_UPDATE;
    if (method === 'delete') return AuditActions.RIU_DELETE;
  }
  if (path.includes('/projects')) {
    if (method === 'post') return AuditActions.PROJECT_CREATE;
    if (method === 'put' || method === 'patch') return AuditActions.PROJECT_UPDATE;
    if (method === 'delete') return AuditActions.PROJECT_DELETE;
  }
  if (path.includes('/measurements')) {
    if (method === 'post') return AuditActions.MEASUREMENT_CREATE;
    if (method === 'put' || method === 'patch') return AuditActions.MEASUREMENT_UPDATE;
    if (method === 'delete') return AuditActions.MEASUREMENT_DELETE;
  }

  // Default: use HTTP method and resource
  return `${method}.${path.split('/')[1] || 'unknown'}`;
}

/**
 * Generate resource name from HTTP request
 */
function generateResourceFromRequest(req: Request): string {
  const path = req.path;

  if (path.includes('/auth')) return AuditResources.USER;
  if (path.includes('/api-keys')) return AuditResources.API_KEY;
  if (path.includes('/rius')) return AuditResources.RIU;
  if (path.includes('/projects')) return AuditResources.PROJECT;
  if (path.includes('/measurements')) return AuditResources.MEASUREMENT;
  if (path.includes('/governance')) return AuditResources.GOVERNANCE;
  if (path.includes('/compliance')) return AuditResources.COMPLIANCE;
  if (path.includes('/security')) return AuditResources.SECURITY;

  // Default: extract from path
  const segments = path.split('/').filter(Boolean);
  return segments[0] || 'unknown';
}

/**
 * Extract resource ID from URL
 */
function extractResourceId(req: Request): string | undefined {
  const segments = req.path.split('/').filter(Boolean);
  // ID is typically the second segment (e.g., /api/rius/123)
  if (segments.length >= 2) {
    const potentialId = segments[1];
    // Check if it looks like a UUID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(potentialId)) {
      return potentialId;
    }
  }
  return undefined;
}

/**
 * Get client IP address from request
 */
function getClientIP(req: Request): string | undefined {
  return (
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.socket.remoteAddress
  );
}

/**
 * Sanitize request body to remove sensitive data
 */
function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = [
    'password',
    'currentPassword',
    'newPassword',
    'confirmPassword',
    'secret',
    'apiKey',
    'token',
    'accessToken',
    'refreshToken',
    'ssn',
    'creditCard',
    'bankAccount',
  ];

  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Sanitize response body to remove sensitive data
 */
function sanitizeResponseBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = [
    'password',
    'secret',
    'apiKey',
    'token',
    'accessToken',
    'refreshToken',
  ];

  const sanitized = Array.isArray(body) ? [...body] : { ...body };

  if (Array.isArray(sanitized)) {
    return sanitized.map(item => sanitizeRequestBody(item));
  }

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Extract error message from response body
 */
function getErrorMessage(responseBody: any): string | undefined {
  if (!responseBody || typeof responseBody !== 'object') {
    return undefined;
  }

  return responseBody.error || responseBody.message || responseBody.errorMessage;
}

/**
 * Middleware to log specific actions
 */
export function logAction(
  action: string,
  resource: string,
  options: {
    extractResourceId?: (req: Request) => string | undefined;
    extractDetails?: (req: Request, res: Response) => Record<string, any>;
  } = {}
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const originalJson = res.json;

    let statusCode: number = 200;
    let responseBody: any;

    res.send = function (body: any) {
      statusCode = res.statusCode;
      responseBody = body;
      return originalSend.call(this, body);
    } as any;

    res.json = function (body: any) {
      statusCode = res.statusCode;
      responseBody = body;
      return originalJson.call(this, body);
    } as any;

    next();

    res.on('finish', async () => {
      const isSuccess = statusCode >= 200 && statusCode < 400;
      const status = isSuccess ? 'success' : 'failure';

      const resourceId = options.extractResourceId
        ? options.extractResourceId(req)
        : extractResourceId(req);

      const details = options.extractDetails
        ? options.extractDetails(req, res)
        : {
            method: req.method,
            path: req.path,
            statusCode,
          };

      try {
        await auditService.log({
          userId: (req as any).user?.id,
          organizationId: (req as any).user?.organizationId,
          action,
          resource,
          resourceId,
          details,
          ipAddress: getClientIP(req),
          userAgent: req.get('user-agent'),
          requestId: (req as any).id,
          sessionId: (req as any).sessionID,
          status,
          errorMessage: !isSuccess ? getErrorMessage(responseBody) : undefined,
        });
      } catch (error) {
        console.error('Failed to log action:', error);
      }
    });
  };
}

/**
 * Predefined action loggers for common operations
 */
export const logUserLogin = logAction(
  AuditActions.USER_LOGIN,
  AuditResources.USER
);

export const logUserLogout = logAction(
  AuditActions.USER_LOGOUT,
  AuditResources.USER
);

export const logRIUCreate = logAction(
  AuditActions.RIU_CREATE,
  AuditResources.RIU
);

export const logRIUUpdate = logAction(
  AuditActions.RIU_UPDATE,
  AuditResources.RIU
);

export const logRIUDelete = logAction(
  AuditActions.RIU_DELETE,
  AuditResources.RIU
);

export const logProjectCreate = logAction(
  AuditActions.PROJECT_CREATE,
  AuditResources.PROJECT
);

export const logProjectUpdate = logAction(
  AuditActions.PROJECT_UPDATE,
  AuditResources.PROJECT
);

export const logProjectDelete = logAction(
  AuditActions.PROJECT_DELETE,
  AuditResources.PROJECT
);

/**
 * Middleware to log security events
 */
export function logSecurityEvent(
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    next();

    res.on('finish', async () => {
      try {
        await auditService.log({
          userId: (req as any).user?.id,
          organizationId: (req as any).user?.organizationId,
          action: AuditActions.SECURITY_EVENT,
          resource: AuditResources.SECURITY,
          details: {
            eventType,
            severity,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
          },
          ipAddress: getClientIP(req),
          userAgent: req.get('user-agent'),
          requestId: (req as any).id,
          status: 'success',
        });
      } catch (error) {
        console.error('Failed to log security event:', error);
      }
    });
  };
}
