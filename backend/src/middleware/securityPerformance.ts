import { Request, Response, NextFunction } from 'express';
import { withSecurityPerformanceMonitoring, securityPerformanceMonitor } from '../utils/securityPerformance';

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
    // This is now handled by the SecurityPerformanceMonitor automatically
    next();
  };
};

// Middleware to record security operation successes
export const recordSecuritySuccess = (operation: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // This is now handled by the SecurityPerformanceMonitor automatically
    next();
  };
};

// Combined middleware for authentication performance monitoring
export const monitorAuthentication = [
  withSecurityPerformanceMonitoring('auth:verify_token'),
  (req: Request, res: Response, next: NextFunction) => {
    // Additional authentication-specific monitoring could be implemented here
    next();
  }
];

// Combined middleware for file upload performance monitoring
export const monitorFileUploadProcess = [
  withSecurityPerformanceMonitoring('file_upload:validate'),
  (req: Request, res: Response, next: NextFunction) => {
    // Additional file upload-specific monitoring could be implemented here
    next();
  }
];
