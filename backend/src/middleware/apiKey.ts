/**
 * API Key Middleware
 * 
 * Middleware for validating API keys and applying rate limits.
 */

import { Request, Response, NextFunction } from 'express';
import { apiKeyService } from '../services/apiKeys';
import { rateLimitingService } from '../services/rateLimiting';
import { apiAnalyticsService } from '../services/apiAnalytics';

export interface AuthenticatedRequest extends Request {
  apiKey?: {
    id: string;
    userId: string;
    organizationId?: string;
    name: string;
    scopes: string[];
  };
}

/**
 * Validate API key middleware
 */
export const validateApiKey = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({
        error: 'API key is required',
        code: 'MISSING_API_KEY',
      });
      return;
    }

    // Validate API key
    const validation = await apiKeyService.validateKey(apiKey);

    if (!validation.valid) {
      res.status(401).json({
        error: validation.error || 'Invalid API key',
        code: 'INVALID_API_KEY',
      });
      return;
    }

    // Check if key is active
    if (!validation.keyData?.isActive) {
      res.status(403).json({
        error: 'API key is inactive',
        code: 'INACTIVE_API_KEY',
      });
      return;
    }

    // Check if key is expired
    if (validation.keyData?.expiresAt && new Date(validation.keyData.expiresAt) < new Date()) {
      res.status(403).json({
        error: 'API key has expired',
        code: 'EXPIRED_API_KEY',
      });
      return;
    }

    // Check IP whitelist if configured
    if (validation.keyData?.allowedIPs && validation.keyData.allowedIPs.length > 0) {
      const clientIP = req.ip || req.connection.remoteAddress;
      if (!validation.keyData.allowedIPs.includes(clientIP)) {
        res.status(403).json({
          error: 'IP address not allowed',
          code: 'IP_NOT_ALLOWED',
        });
        return;
      }
    }

    // Check origin whitelist if configured
    if (validation.keyData?.allowedOrigins && validation.keyData.allowedOrigins.length > 0) {
      const origin = req.headers['origin'] as string;
      if (origin && !validation.keyData.allowedOrigins.includes(origin)) {
        res.status(403).json({
          error: 'Origin not allowed',
          code: 'ORIGIN_NOT_ALLOWED',
        });
        return;
      }
    }

    // Attach API key info to request
    req.apiKey = {
      id: validation.keyData.id,
      userId: validation.keyData.userId,
      organizationId: validation.keyData.organizationId,
      name: validation.keyData.name,
      scopes: validation.keyData.scopes,
    };

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Check API key scopes middleware
 */
export const requireScopes = (...requiredScopes: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.apiKey) {
      res.status(401).json({
        error: 'API key is required',
        code: 'MISSING_API_KEY',
      });
      return;
    }

    const hasAllScopes = requiredScopes.every(scope =>
      req.apiKey!.scopes.includes(scope)
    );

    if (!hasAllScopes) {
      res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_SCOPES',
        required: requiredScopes,
        provided: req.apiKey.scopes,
      });
      return;
    }

    next();
  };
};

/**
 * Rate limiting middleware
 */
export const rateLimit = (config: {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstSize?: number;
}) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = req.apiKey?.id || req.ip;

      // Check rate limit
      const result = await rateLimitingService.checkRateLimit(identifier, config);

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', config.requestsPerMinute.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', Math.floor(result.resetAt.getTime() / 1000).toString());

      if (!result.allowed) {
        // Record rate limit hit
        await rateLimitingService.recordRateLimitHit(
          identifier,
          req.ip || 'unknown',
          req.path,
          req.method
        );

        res.setHeader('Retry-After', result.retryAfter.toString());
        res.status(429).json({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: result.retryAfter,
          resetAt: result.resetAt,
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      next(); // Continue on error to not block requests
    }
  };
};

/**
 * API analytics middleware
 */
export const trackAPIUsage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();

  // Capture original res.json to record response
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    const responseTime = Date.now() - startTime;

    // Record API request asynchronously
    if (req.apiKey) {
      apiAnalyticsService.recordRequest(
        req.apiKey.id,
        req.path,
        req.method,
        res.statusCode,
        responseTime,
        req.ip || 'unknown',
        req.headers['user-agent'] || 'unknown'
      ).catch(error => {
        console.error('Failed to record API request:', error);
      });
    }

    return originalJson(data);
  };

  next();
};

/**
 * Combined middleware for API authentication and rate limiting
 */
export const apiAuth = (config?: {
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
    burstSize?: number;
  };
  scopes?: string[];
}) => {
  const middlewares: any[] = [validateApiKey, trackAPIUsage];

  if (config?.rateLimit) {
    middlewares.push(rateLimit(config.rateLimit));
  }

  if (config?.scopes && config.scopes.length > 0) {
    middlewares.push(requireScopes(...config.scopes));
  }

  return middlewares;
};

/**
 * Get API key info from request
 */
export const getAPIKeyInfo = (req: AuthenticatedRequest) => {
  return req.apiKey;
};

/**
 * Check if request is authenticated with API key
 */
export const isAPIKeyAuthenticated = (req: AuthenticatedRequest): boolean => {
  return !!req.apiKey;
};
