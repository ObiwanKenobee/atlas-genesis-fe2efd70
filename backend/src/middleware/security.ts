import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Rate limiting configurations
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for health checks
    skip: (req: Request) => req.path === '/health'
  });
};

// General API rate limiting (100 requests per 15 minutes)
export const generalRateLimit = createRateLimit(15 * 60 * 1000, 100);

// Auth endpoints rate limiting (5 requests per 15 minutes)
export const authRateLimit = createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts, please try again later.');

// Strict rate limiting for sensitive operations (10 requests per hour)
export const strictRateLimit = createRateLimit(60 * 60 * 1000, 10);

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Basic input sanitization - remove potential script tags and SQL injection attempts
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .trim();
  };

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string);
      }
    });
  }

  // Sanitize body parameters (for POST/PUT/PATCH)
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return sanitizeString(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
      }
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        Object.keys(obj).forEach(key => {
          sanitized[key] = sanitizeObject(obj[key]);
        });
        return sanitized;
      }
      return obj;
    };

    req.body = sanitizeObject(req.body);
  }

  next();
};

// Request logging middleware for security events
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log security-relevant information
  const logData = {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    headers: {
      origin: req.get('Origin'),
      referer: req.get('Referer'),
      authorization: req.get('Authorization') ? '[PRESENT]' : '[NOT PRESENT]'
    }
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[SECURITY] ${res.statusCode} ${req.method} ${req.url} - ${duration}ms`, {
      ...logData,
      statusCode: res.statusCode,
      duration
    });
  });

  next();
};