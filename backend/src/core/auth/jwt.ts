/**
 * JWT Token Service
 * 
 * Handles JWT token generation, verification, and refresh.
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { TokenPayload, ROLE_CAPABILITIES } from '../types';
import { logger } from '../utils/logger';

// ============================================================================
// Configuration
// ============================================================================

interface JWTConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiry: string;
  refreshExpiry: string;
  issuer: string;
  audience: string;
}

function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Required environment variable ${name} is not set in production`);
    }
    // Generate a secure random secret for development
    return crypto.randomBytes(64).toString('hex');
  }
  return value;
}

const config: JWTConfig = {
  accessSecret: getEnvOrThrow('JWT_ACCESS_SECRET'),
  refreshSecret: getEnvOrThrow('JWT_REFRESH_SECRET'),
  accessExpiry: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  issuer: process.env.JWT_ISSUER || 'atlas-genesis-api',
  audience: process.env.JWT_AUDIENCE || 'atlas-genesis-client'
};

// ============================================================================
// Token Types
// ============================================================================

export interface JWTTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface TokenPayloadInput {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
  organizationId?: string;
  sessionId: string;
  deviceFingerprint?: string;
  permissions?: string[];
}

// ============================================================================
// JWT Service
// ============================================================================

export class JWTService {
  /**
   * Get capabilities for a role
   */
  private getCapabilitiesForRole(role: string): string[] {
    return ROLE_CAPABILITIES[role] || ['own:profile:read', 'own:profile:write'];
  }

  /**
   * Generate access and refresh tokens
   */
  generateTokens(payload: TokenPayloadInput): JWTTokens {
    const { accessSecret, refreshSecret, accessExpiry, refreshExpiry, issuer, audience } = config;

    // Get capabilities based on role
    const permissions = payload.permissions || this.getCapabilitiesForRole(payload.role);

    // Access token payload
    const accessPayload: TokenPayload = {
      sub: payload.userId,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
      organizationId: payload.organizationId,
      permissions,
      sessionId: payload.sessionId,
      deviceFingerprint: payload.deviceFingerprint,
      iss: issuer,
      aud: audience
    };

    // Generate access token
    const accessToken = jwt.sign(accessPayload, accessSecret, {
      expiresIn: accessExpiry
    });

    // Refresh token payload (includes session info)
    const refreshPayload = {
      sub: payload.userId,
      type: 'refresh',
      sessionId: payload.sessionId,
      iss: issuer,
      aud: audience
    };

    const refreshToken = jwt.sign(refreshPayload, refreshSecret, {
      expiresIn: refreshExpiry
    });

    // Calculate expires in seconds
    const expiresIn = this.parseExpiry(accessExpiry);

    logger.info('[jwt] Tokens generated', {
      userId: payload.userId,
      sessionId: payload.sessionId,
      expiresIn
    });

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer'
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, config.accessSecret, {
        issuer: config.issuer,
        audience: config.audience
      }) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('[jwt] Access token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('[jwt] Invalid access token', { message: error.message });
      } else {
        logger.error('[jwt] Token verification error', { error });
      }
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): { userId: string; sessionId: string } | null {
    try {
      const payload = jwt.verify(token, config.refreshSecret, {
        issuer: config.issuer,
        audience: config.audience
      }) as { sub: string; type: string; sessionId: string };

      if (payload.type !== 'refresh') {
        logger.warn('[jwt] Invalid token type for refresh');
        return null;
      }

      return {
        userId: payload.sub,
        sessionId: payload.sessionId
      };
    } catch (error) {
      logger.warn('[jwt] Invalid refresh token', { error });
      return null;
    }
  }

  /**
   * Refresh tokens using a valid refresh token
   */
  async refreshTokens(
    refreshToken: string,
    getSessionInfo: (sessionId: string) => Promise<{
      userId: string;
      email: string;
      role: string;
      tenantId: string;
      organizationId?: string;
      deviceFingerprint?: string;
    } | null>
  ): Promise<JWTTokens | null> {
    const sessionInfo = this.verifyRefreshToken(refreshToken);
    
    if (!sessionInfo) {
      return null;
    }

    const session = await getSessionInfo(sessionInfo.sessionId);
    
    if (!session) {
      logger.warn('[jwt] Session not found for refresh', { sessionId: sessionInfo.sessionId });
      return null;
    }

    return this.generateTokens({
      userId: session.userId,
      email: session.email,
      role: session.role,
      tenantId: session.tenantId,
      organizationId: session.organizationId,
      sessionId: sessionInfo.sessionId,
      deviceFingerprint: session.deviceFingerprint
    });
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): Record<string, unknown> | null {
    try {
      return jwt.decode(token) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  /**
   * Parse expiry string to seconds
   */
  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900; // Default 15 minutes
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: return 900;
    }
  }
}

// Export singleton instance
export const jwtService = new JWTService();
