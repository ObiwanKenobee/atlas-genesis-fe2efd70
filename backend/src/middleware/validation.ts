import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logSecurityEvent } from '../utils/logger';
import { getRouteSchema } from '../validation/schemas';

// Enhanced Zod validation middleware with security logging
export const validateWithZod = <T extends z.ZodSchema>(schema: T, options?: {
  logSecurityEvents?: boolean;
  sanitize?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      if (options?.sanitize !== false) {
        req.body = validatedData as any; // Replace with validated/sanitized data
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Log security event for validation failures
        if (options?.logSecurityEvents !== false) {
          logSecurityEvent('validation_error', (req as any).user?.id || null, {
            type: 'body_validation',
            path: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            errorCount: error.issues.length,
            fields: error.issues.map(issue => issue.path.join('.'))
          }, 'low');
        }

        return res.status(400).json({
          code: 'validation_error',
          message: 'Invalid input data',
          timestamp: new Date().toISOString(),
          errors: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
            ...(err.code === 'invalid_type' && {
              received: (err as any).received,
              expected: (err as any).expected
            })
          }))
        });
      }
      next(error);
    }
  };
};

// Zod validation for query parameters with security logging
export const validateQueryWithZod = <T extends z.ZodSchema>(schema: T, options?: {
  logSecurityEvents?: boolean;
  sanitize?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.query);
      if (options?.sanitize !== false) {
        req.query = validatedData as any;
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Log security event for validation failures
        if (options?.logSecurityEvents !== false) {
          logSecurityEvent('validation_error', (req as any).user?.id || null, {
            type: 'query_validation',
            path: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            errorCount: error.issues.length,
            fields: error.issues.map(issue => issue.path.join('.'))
          }, 'low');
        }

        return res.status(400).json({
          code: 'validation_error',
          message: 'Invalid query parameters',
          timestamp: new Date().toISOString(),
          errors: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
            ...(err.code === 'invalid_type' && {
              received: (err as any).received,
              expected: (err as any).expected
            })
          }))
        });
      }
      next(error);
    }
  };
};

// Zod validation for route parameters with security logging
export const validateParamsWithZod = <T extends z.ZodSchema>(schema: T, options?: {
  logSecurityEvents?: boolean;
  sanitize?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.params);
      if (options?.sanitize !== false) {
        req.params = validatedData as any;
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Log security event for validation failures
        if (options?.logSecurityEvents !== false) {
          logSecurityEvent('validation_error', (req as any).user?.id || null, {
            type: 'params_validation',
            path: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            errorCount: error.issues.length,
            fields: error.issues.map(issue => issue.path.join('.'))
          }, 'medium'); // Higher severity for path tampering
        }

        return res.status(400).json({
          code: 'validation_error',
          message: 'Invalid route parameters',
          timestamp: new Date().toISOString(),
          errors: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
            ...(err.code === 'invalid_type' && {
              received: (err as any).received,
              expected: (err as any).expected
            })
          }))
        });
      }
      next(error);
    }
  };
};

// Response validation middleware
export const validateResponseWithZod = <T extends z.ZodSchema>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    res.json = function(data: any) {
      try {
        // Validate response data against schema
        const validatedData = schema.parse(data);

        // Log if response doesn't match schema (potential data leakage)
        if (JSON.stringify(data) !== JSON.stringify(validatedData)) {
          logSecurityEvent('response_validation_warning', (req as any).user?.id || null, {
            path: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            message: 'Response data modified during validation'
          }, 'medium');
        }

        // Call original json method with validated data
        return originalJson.call(this, validatedData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Log critical security event - response validation failure
          logSecurityEvent('response_validation_error', (req as any).user?.id || null, {
            path: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            errorCount: error.issues.length,
            fields: error.issues.map(issue => issue.path.join('.'))
          }, 'high');

          // Return error response
          return res.status(500).json({
            code: 'response_validation_error',
            message: 'Internal server error - response validation failed',
            timestamp: new Date().toISOString()
          });
        }
        // For non-Zod errors, call original json
        return originalJson.call(this, data);
      }
    };
    next();
  };
};

// Combined validation middleware for all request types
export const validateRequestWithZod = (schemas: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}, options?: {
  logSecurityEvents?: boolean;
  sanitize?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const middlewares = [];

    if (schemas.params) {
      middlewares.push(validateParamsWithZod(schemas.params, options));
    }
    if (schemas.query) {
      middlewares.push(validateQueryWithZod(schemas.query, options));
    }
    if (schemas.body) {
      middlewares.push(validateWithZod(schemas.body, options));
    }

    // Execute middlewares in sequence
    let index = 0;
    const executeNext = () => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++];
        middleware(req, res, executeNext);
      } else {
        next();
      }
    };
    executeNext();
  };
};

// Request size validation middleware
export const validateRequestSize = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0');

    if (contentLength > parseSize(maxSize)) {
      logSecurityEvent('request_size_exceeded', (req as any).user?.id || null, {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentLength,
        maxSize
      }, 'medium');

      return res.status(413).json({
        code: 'request_entity_too_large',
        message: `Request size exceeds maximum allowed size of ${maxSize}`,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

// Helper function to parse size strings
const parseSize = (size: string): number => {
  const units = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };

  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  if (!match) return 10 * 1024 * 1024; // Default 10MB

  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';

  return value * (units[unit as keyof typeof units] || 1);
};

// Automatic schema validation middleware
export const autoValidateRequest = (options?: {
  skipValidation?: boolean;
  logSecurityEvents?: boolean;
  sanitize?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip validation if explicitly disabled
    if (options?.skipValidation) {
      return next();
    }

    // Get schema for this route
    const routeSchema = getRouteSchema(req.method, req.path);

    if (!routeSchema) {
      // No schema defined for this route - log for monitoring
      logSecurityEvent('unvalidated_route_access', (req as any).user?.id || null, {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }, 'low');
      return next();
    }

    // Apply validation using the combined middleware
    const validationMiddleware = validateRequestWithZod({
      body: routeSchema.body,
      query: routeSchema.query,
      params: routeSchema.params
    }, {
      logSecurityEvents: options?.logSecurityEvents,
      sanitize: options?.sanitize
    });

    validationMiddleware(req, res, next);
  };
};

// Automatic response validation middleware
export const autoValidateResponse = (options?: {
  skipValidation?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip validation if explicitly disabled
    if (options?.skipValidation) {
      return next();
    }

    // Get schema for this route
    const routeSchema = getRouteSchema(req.method, req.path);

    if (routeSchema?.response) {
      // Apply response validation
      const responseValidationMiddleware = validateResponseWithZod(routeSchema.response);
      responseValidationMiddleware(req, res, next);
    } else {
      next();
    }
  };
};

// Legacy validation functions for backward compatibility
export const validateAuditLog = validateWithZod(z.object({
  eventType: z.string().min(1).max(100),
  payload: z.record(z.string(), z.unknown()),
  actorId: z.string().uuid().optional()
}));