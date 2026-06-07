import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import Tokens from 'csrf';
import crypto, { randomBytes } from 'crypto';
import { logSecurityEvent } from '../utils/logger';
import { recordSecurityPerformanceMetric, getSecurityPerformanceMetrics } from '../services/securityPerformance';
import { performance } from 'perf_hooks';
import redisClient from '../redisClient';

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

// API Key validation middleware — validates against the api_keys table using HMAC hash
export const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return next(); // API key is optional; Bearer JWT auth takes over
  }

  try {
    // Validate format: must start with 'atlas_' and be at least 40 chars total
    if (!apiKey.startsWith('atlas_') || apiKey.length < 40) {
      logSecurityEvent('invalid_api_key', null, { path: req.path, method: req.method, ip: req.ip }, 'medium');
      return res.status(401).json({ code: 'invalid_api_key', message: 'Invalid API key format', timestamp: new Date().toISOString() });
    }

    // Hash the incoming key the same way it was stored (SHA-256)
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const keyPrefix = apiKey.substring(0, 6); // 'atlas_'

    const { query } = require('../db');
    const result = await query(
      `SELECT id, user_id, scopes, rate_limit, allowed_ips, is_active, expires_at
       FROM api_keys WHERE key_prefix = $1 AND key_hash = $2 AND is_active = true`,
      [keyPrefix, keyHash]
    );

    if (result.rowCount === 0) {
      logSecurityEvent('invalid_api_key', null, { path: req.path, method: req.method, ip: req.ip }, 'medium');
      return res.status(401).json({ code: 'invalid_api_key', message: 'Invalid or revoked API key', timestamp: new Date().toISOString() });
    }

    const keyData = result.rows[0];

    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      logSecurityEvent('expired_api_key', null, { path: req.path, method: req.method, ip: req.ip }, 'medium');
      return res.status(401).json({ code: 'api_key_expired', message: 'API key has expired', timestamp: new Date().toISOString() });
    }

    (req as any).apiKey = { id: keyData.id, userId: keyData.user_id, scopes: keyData.scopes, rateLimit: keyData.rate_limit, validated: true };

    logSecurityEvent('api_key_validated', keyData.user_id, { path: req.path, method: req.method, ip: req.ip }, 'low');
    next();
  } catch (error) {
    logSecurityEvent('api_key_validation_error', null, { error: (error as Error).message, path: req.path, ip: req.ip }, 'medium');
    return res.status(500).json({ code: 'api_key_validation_error', message: 'API key validation failed', timestamp: new Date().toISOString() });
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
// Use Redis for distributed scaling, fallback to memory for single-instance
const REQUEST_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 3; // Allow up to 3 identical requests per window
const USE_REDIS = process.env.REDIS_URL ? true : false;

interface RequestCacheEntry {
  timestamp: number;
  count: number;
}

// Module-level bounded cache for single-instance replay prevention
const MAX_CACHE_SIZE = 10_000;
const memoryReplayCache = new Map<string, RequestCacheEntry>();
const memoryCacheCleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryReplayCache.entries()) {
    if (now - value.timestamp > REQUEST_CACHE_TTL) memoryReplayCache.delete(key);
  }
}, REQUEST_CACHE_TTL / 2);
if (memoryCacheCleanupInterval.unref) memoryCacheCleanupInterval.unref();

export const preventReplayAttacks = async (req: Request, res: Response, next: NextFunction) => {
  // Only apply to state-changing operations
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Create a hash of the request for deduplication
  const requestSignature = {
    method: req.method,
    path: req.path,
    body: req.method !== 'GET' ? JSON.stringify(req.body) : '',
    userId: (req as any).user?.id || 'anonymous',
    timestamp: Math.floor(Date.now() / (REQUEST_CACHE_TTL / 10)) // Round to 30-second windows
  };

  const signatureHash = `replay:${crypto.createHash('sha256').update(JSON.stringify(requestSignature)).digest('hex')}`;
  const now = Date.now();

  try {
    if (USE_REDIS) {
      // Use Redis for distributed replay attack prevention
      const cached = await redisClient.get(signatureHash);
      
      if (cached) {
        const entry: RequestCacheEntry = JSON.parse(cached);
        
        if (now - entry.timestamp < REQUEST_CACHE_TTL) {
          entry.count++;
          
          if (entry.count > MAX_REQUESTS_PER_WINDOW) {
            logSecurityEvent('replay_attack_detected', (req as any).user?.id || null, {
              signatureHash,
              requestCount: entry.count,
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
          
          // Update count in Redis
          await redisClient.setex(signatureHash, Math.ceil(REQUEST_CACHE_TTL / 1000), JSON.stringify(entry));
        } else {
          // Reset if window expired
          await redisClient.setex(signatureHash, Math.ceil(REQUEST_CACHE_TTL / 1000), JSON.stringify({ timestamp: now, count: 1 }));
        }
      } else {
        await redisClient.setex(signatureHash, Math.ceil(REQUEST_CACHE_TTL / 1000), JSON.stringify({ timestamp: now, count: 1 }));
      }
    } else {
      // Fallback to module-level bounded cache for single-instance deployment
      const cached = memoryReplayCache.get(signatureHash);
      
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
          memoryReplayCache.set(signatureHash, { timestamp: now, count: 1 });
        }
      } else {
        if (memoryReplayCache.size >= MAX_CACHE_SIZE) {
          // Evict oldest entry to stay bounded
          const firstKey = memoryReplayCache.keys().next().value;
          if (firstKey) memoryReplayCache.delete(firstKey);
        }
        memoryReplayCache.set(signatureHash, { timestamp: now, count: 1 });
      }
    }
  } catch (error) {
    // On Redis error, log and continue (fail open for availability)
    console.error('[security] Redis error in replay prevention:', error);
  }

  next();
};

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

// Input sanitization middleware — XSS only, NOT SQL keywords (use parameterized queries for SQL safety)
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<!--[\s\S]*?-->/gi, '')
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

// CSRF protection — skipped for Bearer token requests (JWT auth is CSRF-safe by design)
// Applied only to cookie-session-based requests
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // JWT Bearer token requests are inherently CSRF-safe
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }
  // Skip safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  // For cookie-session requests, validate CSRF token
  const csrfHeader = req.headers['x-csrf-token'] as string;
  const csrfBody = req.body?._csrf as string;
  const token = csrfHeader || csrfBody;
  if (!token) {
    logSecurityEvent('csrf_missing_token', (req as any).user?.id || null, {
      path: req.path, method: req.method, ip: req.ip
    }, 'medium');
    return res.status(403).json({ code: 'csrf_invalid', message: 'CSRF token required' });
  }
  if (!tokens.verify(csrfSecret, token)) {
    logSecurityEvent('csrf_invalid_token', (req as any).user?.id || null, {
      path: req.path, method: req.method, ip: req.ip
    }, 'high');
    return res.status(403).json({ code: 'csrf_invalid', message: 'Invalid CSRF token' });
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