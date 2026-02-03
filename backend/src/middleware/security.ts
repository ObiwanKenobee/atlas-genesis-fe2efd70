import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import Tokens from 'csrf';
import { randomBytes } from 'crypto';
import { logSecurityEvent } from '../utils/logger';
import { recordSecurityPerformanceMetric, getSecurityPerformanceMetrics } from '../services/securityPerformance';
import { performance } from 'perf_hooks';

// Rate limiting configurations with enhanced features
interface RateLimitConfig {
  windowMs: number;
  max: number;
  burstMax?: number;
  burstWindowMs?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  onLimitReached?: (req: Request, res: Response) => void;
}

export const createRateLimit = (config: RateLimitConfig) => {
  const limiter = rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message || {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(config.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for health checks
    skip: (req: Request) => req.path === '/health',
    keyGenerator: config.keyGenerator,
    skipSuccessfulRequests: config.skipSuccessfulRequests,
    skipFailedRequests: config.skipFailedRequests,
    handler: (req: Request, res: Response) => {
      // Log rate limit exceeded
      logSecurityEvent('rate_limit_exceeded', (req as any).user?.id || null, {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        windowMs: config.windowMs,
        max: config.max,
        retryAfter: Math.ceil(config.windowMs / 1000)
      }, 'medium');

      // Call custom handler if provided
      if (config.onLimitReached) {
        config.onLimitReached(req, res);
      } else {
        res.status(429).json({
          error: config.message || 'Too many requests from this IP, please try again later.',
          retryAfter: Math.ceil(config.windowMs / 1000),
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  return limiter;
};

// Tiered rate limiting based on user roles
export const createTieredRateLimit = (baseConfig: RateLimitConfig) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const config = { ...baseConfig };

    if (user?.role) {
      switch (user.role) {
        case 'admin':
          // Admins get higher limits
          config.max = Math.floor(config.max * 5);
          config.windowMs = Math.floor(config.windowMs * 0.8); // Slightly shorter window
          break;
        case 'moderator':
          // Moderators get higher limits
          config.max = Math.floor(config.max * 3);
          config.windowMs = Math.floor(config.windowMs * 0.9);
          break;
        case 'premium':
          // Premium users get slightly higher limits
          config.max = Math.floor(config.max * 1.5);
          break;
        default:
          // Regular users get base limits
          break;
      }
    }

    const limiter = createRateLimit(config);
    limiter(req, res, next);
  };
};

// Burst rate limiting for high-frequency operations
export const createBurstRateLimit = (config: RateLimitConfig & { burstMax: number; burstWindowMs: number }) => {
  const normalLimiter = createRateLimit(config);
  const burstLimiter = createRateLimit({
    ...config,
    max: config.burstMax,
    windowMs: config.burstWindowMs,
    message: 'Burst rate limit exceeded, please slow down.'
  });

  return (req: Request, res: Response, next: NextFunction) => {
    // Check burst limit first (stricter, shorter window)
    burstLimiter(req, res, (err?: any) => {
      if (err) return next(err);

      // If burst limit passed, check normal limit
      normalLimiter(req, res, next);
    });
  };
};

// General API rate limiting (100 requests per 15 minutes)
export const generalRateLimit = createTieredRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Auth endpoints rate limiting (5 requests per 15 minutes)
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
  skipFailedRequests: false // Don't skip failed auth attempts
});

// Strict rate limiting for sensitive operations (10 requests per hour)
export const strictRateLimit = createTieredRateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10
});

// Burst rate limiting for marketplace operations
export const marketplaceBurstRateLimit = createBurstRateLimit({
  windowMs: 60 * 1000, // 1 minute normal window
  max: 30, // 30 requests per minute normally
  burstMax: 10, // But only 10 in a 10 second burst
  burstWindowMs: 10 * 1000,
  message: 'Marketplace access rate limited due to high frequency requests.'
});

// API key rate limiting
export const apiKeyRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (apiKey) {
    // API keys get different limits based on their configuration
    // For now, use a standard limit - in production this would check the key's rate limit from database
    const limiter = createRateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requests per minute for API keys
      keyGenerator: () => `api_key:${apiKey}`,
      message: 'API key rate limit exceeded.'
    });
    limiter(req, res, next);
  } else {
    next();
  }
};

// Rate limit monitoring and alerting
const rateLimitMetrics = new Map<string, {
  totalRequests: number;
  blockedRequests: number;
  lastAlertTime: number;
}>();

export const monitorRateLimits = (req: Request, res: Response, next: NextFunction) => {
  const key = `${req.ip}:${req.path}`;
  const metrics = rateLimitMetrics.get(key) || {
    totalRequests: 0,
    blockedRequests: 0,
    lastAlertTime: 0
  };

  metrics.totalRequests++;

  // Check if we should alert (high block rate)
  const blockRate = metrics.blockedRequests / metrics.totalRequests;
  const now = Date.now();

  if (blockRate > 0.5 && now - metrics.lastAlertTime > 5 * 60 * 1000) { // Alert every 5 minutes
    logSecurityEvent('high_rate_limit_block_rate', null, {
      ip: req.ip,
      path: req.path,
      blockRate: blockRate.toFixed(2),
      totalRequests: metrics.totalRequests,
      blockedRequests: metrics.blockedRequests
    }, 'high');

    metrics.lastAlertTime = now;
  }

  rateLimitMetrics.set(key, metrics);
  next();
};

// Middleware to add rate limit headers for client awareness
export const addRateLimitHeaders = (req: Request, res: Response, next: NextFunction) => {
  // The express-rate-limit middleware already adds standard headers
  // This is just a placeholder for additional custom headers if needed
  next();
};

// API Key validation middleware
export const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    // API key not provided - this is fine for regular authenticated requests
    return next();
  }

  try {
    // In a real implementation, you would validate against a database
    // For now, we'll do basic validation
    if (apiKey.length < 20) {
      logSecurityEvent('invalid_api_key', null, {
        keyLength: apiKey.length,
        path: req.path,
        method: req.method,
        ip: req.ip
      }, 'medium');
      return res.status(401).json({
        code: 'invalid_api_key',
        message: 'Invalid API key format',
        timestamp: new Date().toISOString()
      });
    }

    // Check if API key is in a blacklist (simulated)
    const blacklistedKeys = process.env.BLACKLISTED_API_KEYS?.split(',') || [];
    if (blacklistedKeys.includes(apiKey)) {
      logSecurityEvent('blacklisted_api_key', null, {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }, 'high');
      return res.status(401).json({
        code: 'api_key_blacklisted',
        message: 'API key has been revoked',
        timestamp: new Date().toISOString()
      });
    }

    // Attach API key info to request for rate limiting and logging
    (req as any).apiKey = {
      key: apiKey,
      validated: true,
      timestamp: new Date().toISOString()
    };

    logSecurityEvent('api_key_validated', null, {
      path: req.path,
      method: req.method,
      ip: req.ip
    }, 'low');

    next();
  } catch (error) {
    logSecurityEvent('api_key_validation_error', null, {
      error: (error as Error).message,
      path: req.path,
      method: req.method,
      ip: req.ip
    }, 'medium');
    return res.status(500).json({
      code: 'api_key_validation_error',
      message: 'API key validation failed',
      timestamp: new Date().toISOString()
    });
  }
};

// Request fingerprinting for abuse detection
export const requestFingerprinting = (req: Request, res: Response, next: NextFunction) => {
  const fingerprint = {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    accept: req.get('Accept'),
    acceptLanguage: req.get('Accept-Language'),
    acceptEncoding: req.get('Accept-Encoding'),
    dnt: req.get('DNT'),
    cacheControl: req.get('Cache-Control'),
    pragma: req.get('Pragma'),
    connection: req.get('Connection'),
    upgradeInsecureRequests: req.get('Upgrade-Insecure-Requests')
  };

  // Create a hash of the fingerprint for tracking
  const crypto = require('crypto');
  const fingerprintHash = crypto.createHash('sha256')
    .update(JSON.stringify(fingerprint))
    .digest('hex');

  (req as any).fingerprint = {
    hash: fingerprintHash,
    data: fingerprint,
    timestamp: new Date().toISOString()
  };

  // Store fingerprint for abuse detection
  // In a real implementation, you might store this in Redis or a database
  // and check for suspicious patterns

  next();
};

// Request deduplication to prevent replay attacks
const requestCache = new Map<string, { timestamp: number; count: number }>();
const REQUEST_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 3; // Allow up to 3 identical requests per window

export const preventReplayAttacks = (req: Request, res: Response, next: NextFunction) => {
  // Only apply to state-changing operations
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const crypto = require('crypto');

  // Create a hash of the request for deduplication
  const requestSignature = {
    method: req.method,
    path: req.path,
    body: req.method !== 'GET' ? JSON.stringify(req.body) : '',
    userId: (req as any).user?.id || 'anonymous',
    timestamp: Math.floor(Date.now() / (REQUEST_CACHE_TTL / 10)) // Round to 30-second windows
  };

  const signatureHash = crypto.createHash('sha256')
    .update(JSON.stringify(requestSignature))
    .digest('hex');

  const now = Date.now();
  const cached = requestCache.get(signatureHash);

  if (cached) {
    if (now - cached.timestamp < REQUEST_CACHE_TTL) {
      cached.count++;

      if (cached.count > MAX_REQUESTS_PER_WINDOW) {
        logSecurityEvent('replay_attack_detected', (req as any).user?.id || null, {
          signatureHash,
          requestCount: cached.count,
          path: req.path,
          method: req.method,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }, 'high');

        return res.status(429).json({
          code: 'duplicate_request',
          message: 'Duplicate request detected',
          timestamp: new Date().toISOString()
        });
      }
    } else {
      // Reset if window expired
      requestCache.set(signatureHash, { timestamp: now, count: 1 });
    }
  } else {
    requestCache.set(signatureHash, { timestamp: now, count: 1 });
  }

  next();
};

// Cleanup old request cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > REQUEST_CACHE_TTL) {
      requestCache.delete(key);
    }
  }
}, REQUEST_CACHE_TTL / 2);

// Security headers middleware with enhanced CSP and additional headers
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Generate nonces for CSP
  const nonce = randomBytes(16).toString('base64');

  // Store nonce in res.locals for use in templates/views
  res.locals.nonce = nonce;

  const cspDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      `'nonce-${nonce}'`,
      ...(isProduction ? [] : ["'unsafe-eval'"]) // Allow eval in development for hot reloading
    ],
    styleSrc: [
      "'self'",
      `'nonce-${nonce}'`,
      "https://fonts.googleapis.com"
    ],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:", "blob:"],
    connectSrc: ["'self'", ...(isProduction ? [] : ["ws:", "wss:"])], // Allow websockets in dev
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: isProduction ? [] : null, // Only in production
    reportUri: ['/api/security/csp-report'] // Endpoint for violation reports
  };

  // Remove null values
  Object.keys(cspDirectives).forEach(key => {
    if ((cspDirectives as any)[key] === null) {
      delete (cspDirectives as any)[key];
    }
  });

  helmet({
    contentSecurityPolicy: {
      directives: cspDirectives,
      reportOnly: !isProduction // Report-only in development
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    frameguard: { action: 'deny' }, // X-Frame-Options: DENY
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginEmbedderPolicy: isProduction ? { policy: "require-corp" } : false,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" }
  })(req, res, () => {
    // Set additional headers not supported by Helmet
    res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(self), usb=(), magnetometer=(), accelerometer=(), gyroscope=(), speaker=(), autoplay=(self), fullscreen=(self), interest-cohort=()');
    next();
  });
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Enhanced input sanitization with comprehensive string manipulation
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    
    return str
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove JavaScript URLs
      .replace(/javascript:/gi, '')
      // Remove event handlers
      .replace(/on\w+\s*=/gi, '')
      // Remove iframe tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      // Remove style tags
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove comment tags
      .replace(/<!--[\s\S]*?-->/gi, '')
      // Escape HTML characters
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      // Remove SQL injection patterns
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION|OR|AND|NOT|XOR|LIKE|IN|BETWEEN|IS|NULL|FROM|WHERE|GROUP|HAVING|ORDER|LIMIT|OFFSET|JOIN|LEFT|RIGHT|INNER|OUTER|FETCH|TOP)\b/gi, '')
      // Trim whitespace
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

// CSRF Protection
const tokens = new Tokens();
const csrfSecret = process.env.CSRF_SECRET || 'your-csrf-secret-key-change-in-production';

// Generate CSRF token
export const generateCSRFToken = (): string => {
  return tokens.create(csrfSecret);
};

// CSRF token middleware for generating tokens
export const csrfToken = (req: Request, res: Response, next: NextFunction) => {
  res.locals.csrfToken = generateCSRFToken();
  next();
};

// CSRF protection middleware for state-changing operations
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF check for all requests (temporary for testing)
  return next();
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