/**
 * Hybrid Authentication Middleware
 * 
 * Supports both session cookies (browser clients) and Bearer tokens (API clients).
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AuthenticatedUser } from '../types';
import { jwtService } from '../auth/jwt';
import { sessionService } from '../auth/session';
import { logger } from '../utils/logger';
import redisClient from '../redisClient';

// ============================================================================
// Configuration
// ============================================================================

interface HybridAuthOptions {
  /** Allow session-based authentication */
  allowSession?: boolean;
  /** Allow JWT Bearer token authentication */
  allowBearer?: boolean;
  /** Allow API key authentication */
  allowApiKey?: boolean;
  /** Custom header for session ID (when not using cookies) */
  sessionHeader?: string;
  /** Header for API key */
  apiKeyHeader?: string;
}

const defaultOptions: HybridAuthOptions = {
  allowSession: true,
  allowBearer: true,
  allowApiKey: true,
  sessionHeader: 'X-Session-ID',
  apiKeyHeader: 'X-API-Key'
};

// ============================================================================
// Hybrid Auth Middleware
// ============================================================================

export function createHybridAuth(options: HybridAuthOptions = {}) {
  const config = { ...defaultOptions, ...options };

  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    req.authMethod = undefined;

    // 1. Try Bearer token first (API clients)
    if (config.allowBearer) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = jwtService.verifyAccessToken(token);
        
        if (payload) {
          req.user = payload;
          req.authMethod = 'jwt';
          logger.debug('[auth] JWT authentication successful', {
            userId: payload.sub,
            path: req.path
          });
          return next();
        }

        logger.debug('[auth] JWT verification failed', { path: req.path });
      }
    }

    // 2. Try session cookie (browser clients)
    if (config.allowSession) {
      const sessionId = req.cookies?.[sessionService.getCookieOptions().name];
      
      if (sessionId && typeof sessionId === 'string') {
        const session = await sessionService.getSession(sessionId);
        
        if (session) {
          req.user = sessionService.sessionToTokenPayload(session);
          req.authMethod = 'session';
          
          // Touch session to update activity
          await sessionService.touchSession(sessionId);
          
          logger.debug('[auth] Session authentication successful', {
            userId: session.userId,
            path: req.path
          });
          return next();
        }

        logger.debug('[auth] Session not found or expired', { sessionId });
      }
    }

    // 3. Try custom session header (mobile/SPA without cookies)
    if (config.allowSession && config.sessionHeader) {
      const sessionId = req.headers[config.sessionHeader];
      
      if (sessionId && typeof sessionId === 'string') {
        const session = await sessionService.getSession(sessionId);
        
        if (session) {
          req.user = sessionService.sessionToTokenPayload(session);
          req.authMethod = 'session';
          
          logger.debug('[auth] Session (header) authentication successful', {
            userId: session.userId,
            path: req.path
          });
          return next();
        }

        logger.debug('[auth] Session (header) not found', { sessionId });
      }
    }

    // 4. Try API key (service-to-service)
    if (config.allowApiKey && config.apiKeyHeader) {
      const apiKey = req.headers[config.apiKeyHeader];
      
      if (apiKey && typeof apiKey === 'string') {
        const user = await verifyApiKey(apiKey);
        
        if (user) {
          req.user = user;
          req.authMethod = 'apiKey';
          
          logger.debug('[auth] API key authentication successful', {
            userId: user.sub,
            path: req.path
          });
          return next();
        }

        logger.debug('[auth] API key verification failed', { path: req.path });
      }
    }

    // No valid authentication found
    logger.debug('[auth] No valid authentication', { path: req.path });
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        details: {
          supportedMethods: [
            ...(config.allowBearer ? ['Bearer token'] : []),
            ...(config.allowSession ? ['Session cookie', config.sessionHeader] : []),
            ...(config.allowApiKey ? [config.apiKeyHeader] : [])
          ]
        }
      }
    });
  };
}

/**
 * Verify API key and return user payload
 */
async function verifyApiKey(apiKey: string): Promise<AuthenticatedUser | null> {
  try {
    // Look up API key in Redis or database
    const keyData = await redisClient.get(`apikey:${apiKey}`);
    
    if (!keyData) {
      return null;
    }

    const { userId, permissions, tenantId, organizationId } = JSON.parse(keyData);
    
    // Get user info
    const userData = await redisClient.get(`user:${userId}`);
    
    if (!userData) {
      return null;
    }

    const user = JSON.parse(userData);
    
    return {
      sub: user.id,
      email: user.email,
      role: user.role || 'api_user',
      tenantId: tenantId || user.tenantId,
      organizationId: organizationId || user.organizationId,
      permissions: permissions || ['api:access'],
      sessionId: `apikey:${apiKey}`,
      deviceFingerprint: apiKey.substring(0, 8) + '...'
    };
  } catch (error) {
    logger.error('[auth] API key verification error', { error });
    return null;
  }
}

// ============================================================================
// Optional Auth (No 401 if not authenticated)
// ============================================================================

export function createOptionalAuth(options: HybridAuthOptions = {}) {
  const config = { ...defaultOptions, ...options };

  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Don't require auth, but populate if available
    const authMiddleware = createHybridAuth(options);
    
    // Override 401 response to just continue
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (body?.error?.code === 'UNAUTHORIZED') {
        // Just continue without user
        return res;
      }
      return originalJson(body);
    };

    await authMiddleware(req, res, next);
  };
}

// ============================================================================
// Authenticated User Utilities
// ============================================================================

/**
 * Get current user from request
 */
export function getCurrentUser(req: AuthenticatedRequest): AuthenticatedUser | null {
  return req.user || null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(req: AuthenticatedRequest): boolean {
  return !!req.user;
}

/**
 * Require authentication (shorthand)
 */
export const requireAuth = createHybridAuth();

// ============================================================================
// Auth Method Detection
// ============================================================================

/**
 * Check which auth method was used
 */
export function getAuthMethod(req: AuthenticatedRequest): 'session' | 'jwt' | 'apiKey' | undefined {
  return req.authMethod;
}

/**
 * Require specific auth method
 */
export const requireAuthMethod = (...methods: Array<'session' | 'jwt' | 'apiKey'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const usedMethod = req.authMethod;
    
    if (!usedMethod || !methods.includes(usedMethod)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_METHOD_NOT_ALLOWED',
          message: `This endpoint requires: ${methods.join(' or ')}`
        }
      });
      return;
    }

    next();
  };
};

/**
 * Require Bearer token (no session)
 */
export const requireBearerAuth = requireAuthMethod('jwt');

/**
 * Require session auth (no Bearer)
 */
export const requireSessionAuth = requireAuthMethod('session');
