/**
 * Session Service
 * 
 * Redis-backed session management for distributed authentication.
 */

import crypto from 'crypto';
import redisClient from '../redisClient';
import { logger } from '../utils/logger';
import { TokenPayload } from '../types';

// ============================================================================
// Configuration
// ============================================================================

interface SessionConfig {
  cookieName: string;
  maxAge: number;          // in milliseconds
  cookieSecure: boolean;
  cookieHttpOnly: boolean;
  cookieSameSite: 'lax' | 'strict' | 'none';
}

const config: SessionConfig = {
  cookieName: 'atlas_session',
  maxAge: 24 * 60 * 60 * 1000,  // 24 hours
  cookieSecure: process.env.NODE_ENV === 'production',
  cookieHttpOnly: true,
  cookieSameSite: 'lax'
};

// ============================================================================
// Session Types
// ============================================================================

export interface SessionData {
  id: string;
  userId: string;
  email: string;
  role: string;
  tenantId: string;
  organizationId?: string;
  permissions: string[];
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

export interface SessionInfo {
  id: string;
  userId: string;
  email: string;
  role: string;
  tenantId: string;
  organizationId?: string;
  permissions: string[];
  expiresAt: Date;
}

export interface CreateSessionParams {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
  organizationId?: string;
  permissions?: string[];
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SessionCreationResult {
  session: SessionInfo;
  cookieOptions: {
    name: string;
    value: string;
    options: {
      maxAge: number;
      secure: boolean;
      httpOnly: boolean;
      sameSite: string;
    };
  };
}

// ============================================================================
// Session Service
// ============================================================================

export class SessionService {
  private readonly SESSION_PREFIX = 'session:';
  private readonly USER_SESSIONS_PREFIX = 'user_sessions:';
  private readonly SESSION_COOKIE = config.cookieName;

  /**
   * Create a new session
   */
  async createSession(params: CreateSessionParams): Promise<SessionCreationResult> {
    const sessionId = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.maxAge);

    const sessionData: SessionData = {
      id: sessionId,
      userId: params.userId,
      email: params.email,
      role: params.role,
      tenantId: params.tenantId,
      organizationId: params.organizationId,
      permissions: params.permissions || [],
      deviceFingerprint: params.deviceFingerprint || '',
      ipAddress: params.ipAddress || '',
      userAgent: params.userAgent || '',
      createdAt: now,
      lastActivity: now,
      expiresAt
    };

    try {
      // Store session in Redis
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      await redisClient.setex(
        sessionKey,
        Math.ceil(config.maxAge / 1000),
        JSON.stringify(sessionData)
      );

      // Add to user's session set
      const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${params.userId}`;
      await redisClient.sadd(userSessionsKey, sessionId);
      await redisClient.expire(userSessionsKey, Math.ceil(config.maxAge / 1000));

      logger.info('[session] Session created', {
        sessionId,
        userId: params.userId,
        tenantId: params.tenantId
      });

      return {
        session: {
          id: sessionId,
          userId: params.userId,
          email: params.email,
          role: params.role,
          tenantId: params.tenantId,
          organizationId: params.organizationId,
          permissions: sessionData.permissions,
          expiresAt
        },
        cookieOptions: {
          name: this.SESSION_COOKIE,
          value: sessionId,
          options: {
            maxAge: config.maxAge,
            secure: config.cookieSecure,
            httpOnly: config.cookieHttpOnly,
            sameSite: config.cookieSameSite
          }
        }
      };
    } catch (error) {
      logger.error('[session] Failed to create session', { error });
      throw error;
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<SessionInfo | null> {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const data = await redisClient.get(sessionKey);

      if (!data) {
        return null;
      }

      const sessionData = JSON.parse(data) as SessionData;

      // Check if expired
      if (new Date(sessionData.expiresAt) < new Date()) {
        await this.deleteSession(sessionId);
        return null;
      }

      return {
        id: sessionData.id,
        userId: sessionData.userId,
        email: sessionData.email,
        role: sessionData.role,
        tenantId: sessionData.tenantId,
        organizationId: sessionData.organizationId,
        permissions: sessionData.permissions,
        expiresAt: sessionData.expiresAt
      };
    } catch (error) {
      logger.error('[session] Failed to get session', { sessionId, error });
      return null;
    }
  }

  /**
   * Get full session data including metadata
   */
  async getSessionData(sessionId: string): Promise<SessionData | null> {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const data = await redisClient.get(sessionKey);

      if (!data) {
        return null;
      }

      const sessionData = JSON.parse(data) as SessionData;

      // Check if expired
      if (new Date(sessionData.expiresAt) < new Date()) {
        await this.deleteSession(sessionId);
        return null;
      }

      return sessionData;
    } catch (error) {
      logger.error('[session] Failed to get session data', { sessionId, error });
      return null;
    }
  }

  /**
   * Update session activity (touch)
   */
  async touchSession(sessionId: string): Promise<void> {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const data = await redisClient.get(sessionKey);

      if (!data) {
        return;
      }

      const sessionData = JSON.parse(data) as SessionData;
      sessionData.lastActivity = new Date();

      // Update with new TTL
      const ttl = Math.ceil((new Date(sessionData.expiresAt).getTime() - Date.now()) / 1000);
      if (ttl > 0) {
        await redisClient.setex(sessionKey, ttl, JSON.stringify(sessionData));
      }
    } catch (error) {
      logger.error('[session] Failed to touch session', { sessionId, error });
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const sessionData = await this.getSessionData(sessionId);
      
      if (!sessionData) {
        return false;
      }

      // Delete session
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      await redisClient.del(sessionKey);

      // Remove from user's session set
      const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${sessionData.userId}`;
      await redisClient.srem(userSessionsKey, sessionId);

      logger.info('[session] Session deleted', { sessionId, userId: sessionData.userId });

      return true;
    } catch (error) {
      logger.error('[session] Failed to delete session', { sessionId, error });
      return false;
    }
  }

  /**
   * Delete all sessions for a user
   */
  async deleteUserSessions(userId: string): Promise<number> {
    try {
      const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
      const sessionIds = await redisClient.smembers(userSessionsKey);

      let deletedCount = 0;
      for (const sessionId of sessionIds) {
        const deleted = await this.deleteSession(sessionId);
        if (deleted) {
          deletedCount++;
        }
      }

      logger.info('[session] All user sessions deleted', { userId, count: deletedCount });

      return deletedCount;
    } catch (error) {
      logger.error('[session] Failed to delete user sessions', { userId, error });
      return 0;
    }
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionInfo[]> {
    try {
      const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
      const sessionIds = await redisClient.smembers(userSessionsKey);

      const sessions: SessionInfo[] = [];
      for (const sessionId of sessionIds) {
        const session = await this.getSession(sessionId);
        if (session) {
          sessions.push(session);
        }
      }

      return sessions.sort((a, b) => 
        new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime()
      );
    } catch (error) {
      logger.error('[session] Failed to get user sessions', { userId, error });
      return [];
    }
  }

  /**
   * Get session count for a user
   */
  async getUserSessionCount(userId: string): Promise<number> {
    try {
      const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
      return await redisClient.scard(userSessionsKey);
    } catch (error) {
      logger.error('[session] Failed to get session count', { userId, error });
      return 0;
    }
  }

  /**
   * Convert session to token payload
   */
  sessionToTokenPayload(session: SessionInfo): TokenPayload {
    return {
      sub: session.userId,
      email: session.email,
      role: session.role,
      tenantId: session.tenantId,
      organizationId: session.organizationId,
      permissions: session.permissions,
      sessionId: session.id
    };
  }

  /**
   * Get cookie options for setting session cookie
   */
  getCookieOptions() {
    return {
      name: this.SESSION_COOKIE,
      options: {
        maxAge: config.maxAge,
        secure: config.cookieSecure,
        httpOnly: config.cookieHttpOnly,
        sameSite: config.cookieSameSite
      }
    };
  }

  /**
   * Clear session cookie
   */
  getClearCookieOptions() {
    return {
      name: this.SESSION_COOKIE,
      options: {
        maxAge: 0,
        secure: config.cookieSecure,
        httpOnly: config.cookieHttpOnly,
        sameSite: config.cookieSameSite as 'lax'
      }
    };
  }
}

// Export singleton instance
export const sessionService = new SessionService();
