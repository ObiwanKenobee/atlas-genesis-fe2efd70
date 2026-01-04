import { Request, Response, NextFunction } from 'express';
import { startSecurityOperation, endSecurityOperation, recordSecurityMetrics } from '../utils/securityPerformance';

// Performance monitoring wrapper for security middleware
export const withSecurityPerformanceMonitoring = (operation: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const operationId = startSecurityOperation(operation, {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userId: (req as any).user?.id
    });

    // Store original response methods to intercept completion
    const originalJson = res.json;
    const originalSend = res.send;
    const originalEnd = res.end;
    const originalStatus = res.status;

    let responseSent = false;
    let statusCode = 200;

    res.json = function(data: any) {
      if (!responseSent) {
        responseSent = true;
        endSecurityOperation(operationId, statusCode < 400);
      }
      return originalJson.call(this, data);
    };

    res.send = function(data: any) {
      if (!responseSent) {
        responseSent = true;
        endSecurityOperation(operationId, statusCode < 400);
      }
      return originalSend.call(this, data);
    };

    res.end = function(data?: any) {
      if (!responseSent) {
        responseSent = true;
        endSecurityOperation(operationId, statusCode < 400);
      }
      return originalEnd.call(this, data);
    };

    res.status = function(code: number) {
      statusCode = code;
      return originalStatus.call(this, code);
    };

    next();
  };
};

// Specific performance monitoring middleware for different security operations
export const monitorRateLimit = withSecurityPerformanceMonitoring('rate_limit:check');
export const monitorAuthValidation = withSecurityPerformanceMonitoring('auth:verify_token');
export const monitorValidation = withSecurityPerformanceMonitoring('validation:body');
export const monitorQueryValidation = withSecurityPerformanceMonitoring('validation:query');
export const monitorParamsValidation = withSecurityPerformanceMonitoring('validation:params');
export const monitorResponseValidation = withSecurityPerformanceMonitoring('validation:response');
export const monitorFileUpload = withSecurityPerformanceMonitoring('file_upload:validate');
export const monitorSecurityHeaders = withSecurityPerformanceMonitoring('security:headers');
export const monitorApiKeyValidation = withSecurityPerformanceMonitoring('api_key:validate');
export const monitorCsrfProtection = withSecurityPerformanceMonitoring('csrf:check');

// Middleware to record security operation failures
export const recordSecurityFailure = (operation: string, error?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    recordSecurityMetrics({
      operation,
      duration: 0, // Will be measured by the performance monitor
      memoryUsage: process.memoryUsage(),
      timestamp: Date.now(),
      userId: (req as any).user?.id,
      ip: req.ip,
      path: req.path,
      method: req.method,
      success: false,
      error
    });
    next();
  };
};

// Middleware to record security operation successes
export const recordSecuritySuccess = (operation: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    recordSecurityMetrics({
      operation,
      duration: 0, // Will be measured by the performance monitor
      memoryUsage: process.memoryUsage(),
      timestamp: Date.now(),
      userId: (req as any).user?.id,
      ip: req.ip,
      path: req.path,
      method: req.method,
      success: true
    });
    next();
  };
};

// Combined middleware for authentication performance monitoring
export const monitorAuthentication = [
  withSecurityPerformanceMonitoring('auth:verify_token'),
  (req: Request, res: Response, next: NextFunction) => {
    // Additional authentication-specific monitoring
    const originalJson = res.json;
    res.json = function(data: any) {
      if (res.statusCode >= 400) {
        recordSecurityMetrics({
          operation: 'auth:verify_token',
          duration: 0,
          memoryUsage: process.memoryUsage(),
          timestamp: Date.now(),
          userId: (req as any).user?.id,
          ip: req.ip,
          path: req.path,
          method: req.method,
          success: false,
          error: data.code || 'authentication_failed'
        });
      }
      return originalJson.call(this, data);
    };
    next();
  }
];

// Combined middleware for file upload performance monitoring
export const monitorFileUploadProcess = [
  withSecurityPerformanceMonitoring('file_upload:validate'),
  (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    res.json = function(data: any) {
      if (res.statusCode >= 400) {
        recordSecurityMetrics({
          operation: 'file_upload:validate',
          duration: 0,
          memoryUsage: process.memoryUsage(),
          timestamp: Date.now(),
          userId: (req as any).user?.id,
          ip: req.ip,
          path: req.path,
          method: req.method,
          success: false,
          error: data.code || 'file_upload_failed'
        });
      }
      return originalJson.call(this, data);
    };
    next();
  }
];