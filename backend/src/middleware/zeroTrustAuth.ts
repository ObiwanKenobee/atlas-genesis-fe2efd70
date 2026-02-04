/**
 * Zero-Trust Authentication Middleware
 * 
 * Implements continuous identity verification and trust-based access control
 * for the zero-trust architecture framework.
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { zeroTrustEngine, TrustScore, AccessContext, ResourceType, SensitivityLevel } from '../services/zeroTrust';
import { deviceTrustService, DeviceInfo } from '../services/zeroTrust/deviceTrustService';
import { logSecurityEvent } from '../utils/logger';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    displayName: string;
    role: string;
    tenantId: string;
    emailVerified: boolean;
    mfaEnabled: boolean;
    lastLogin: Date;
  };
  sessionId?: string;
  trustScore?: TrustScore;
  deviceFingerprint?: DeviceInfo;
  accessContext?: AccessContext;
}

export interface ZeroTrustConfig {
  resourceType: ResourceType;
  sensitivityLevel: SensitivityLevel;
  requireMFA?: boolean;
  requireTrustedDevice?: boolean;
  minimumTrustScore?: number;
  bypassConditions?: string[];
}

// ============================================================================
// ZERO-TRUST AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Main zero-trust authentication middleware
 * Evaluates every request against zero-trust policies
 */
export const zeroTrustAuth = (config: ZeroTrustConfig) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Skip for health checks
      if (req.path === '/health' || req.path === '/ready') {
        return next();
      }

      // Ensure user is authenticated
      if (!req.user) {
        logSecurityEvent('zero_trust_unauthenticated', null, {
          path: req.path,
          method: req.method,
          ip: req.ip
        }, 'medium');
        return res.status(401).json({ 
          code: 'unauthorized', 
          message: 'Authentication required for zero-trust access' 
        });
      }

      // Generate device fingerprint
      const deviceInfo = deviceTrustService.generateFingerprint(req);
      req.deviceFingerprint = deviceInfo;

      // Verify device trust
      const deviceTrust = await deviceTrustService.verifyDevice(deviceInfo, req.user.id);

      // Build access context
      const context: AccessContext = {
        userId: req.user.id,
        sessionId: req.sessionId || uuidv4(),
        deviceFingerprint: undefined, // Will be enriched by device trust service
        requestPath: req.path,
        requestMethod: req.method,
        resourceType: config.resourceType,
        requestedAction: req.method,
        ipAddress: req.ip || '',
        userAgent: req.get('User-Agent') || '',
        timeOfAccess: new Date(),
        sensitivityLevel: config.sensitivityLevel
      };

      req.accessContext = context;

      // Evaluate access against zero-trust policies
      const decision = await zeroTrustEngine.evaluateAccess(context);
      req.trustScore = decision.trustScore;
      req.sessionId = decision.sessionId;

      // Log policy decision
      logSecurityEvent('zero_trust_decision', req.user.id, {
        path: req.path,
        method: req.method,
        allowed: decision.allowed,
        trustScore: decision.trustScore.overall,
        riskLevel: decision.trustScore.riskLevel,
        sessionId: decision.sessionId
      }, decision.allowed ? 'low' : 'medium');

      // Check if access is allowed
      if (!decision.allowed) {
        return handleAccessDenied(req, res, decision);
      }

      // Check for required obligations
      if (decision.obligations.length > 0) {
        res.set('X-ZeroTrust-Obligations', JSON.stringify(decision.obligations));
      }

      // Attach trust score to request for downstream use
      res.set('X-Trust-Score', decision.trustScore.overall.toString());
      res.set('X-Risk-Level', decision.trustScore.riskLevel);

      next();
    } catch (error) {
      console.error('Zero-trust authentication error:', error);
      logSecurityEvent('zero_trust_error', req.user?.id || null, {
        error: (error as Error).message,
        path: req.path
      }, 'high');
      
      // Fail closed - deny access on error
      return res.status(500).json({
        code: 'security_error',
        message: 'Security verification failed'
      });
    }
  };
};

/**
 * Middleware for sensitive operations requiring step-up authentication
 */
export const requireStepUpAuth = () => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          code: 'unauthorized', 
          message: 'Authentication required' 
        });
      }

      // Require MFA for sensitive operations
      if (!req.user.mfaEnabled) {
        return res.status(403).json({
          code: 'mfa_required',
          message: 'Multi-factor authentication required for this operation',
          requiresMFA: true
        });
      }

      // Verify MFA token
      const mfaToken = req.headers['x-mfa-token'] as string;
      if (!mfaToken) {
        return res.status(403).json({
          code: 'mfa_required',
          message: 'Multi-factor authentication token required',
          requiresMFA: true
        });
      }

      // In production, verify MFA token here
      // For now, we'll allow the request to proceed
      next();
    } catch (error) {
      console.error('Step-up authentication error:', error);
      return res.status(500).json({
        code: 'authentication_error',
        message: 'Failed to verify authentication'
      });
    }
  };
};

/**
 * Middleware requiring trusted device
 */
export const requireTrustedDevice = () => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.deviceFingerprint) {
        return res.status(401).json({
          code: 'unauthorized',
          message: 'Authentication required'
        });
      }

      const deviceTrust = await deviceTrustService.verifyDevice(
        req.deviceFingerprint, 
        req.user.id
      );

      if (deviceTrust.trustLevel !== 'trusted') {
        logSecurityEvent('untrusted_device_attempt', req.user.id, {
          path: req.path,
          trustLevel: deviceTrust.trustLevel
        }, 'medium');

        return res.status(403).json({
          code: 'trusted_device_required',
          message: 'This operation requires a trusted device',
          deviceStatus: {
            isTrusted: deviceTrust.isTrusted,
            trustLevel: deviceTrust.trustLevel,
            requiresVerification: deviceTrust.requiresVerification
          }
        });
      }

      next();
    } catch (error) {
      console.error('Trusted device check error:', error);
      return res.status(500).json({
        code: 'device_verification_error',
        message: 'Failed to verify device trust'
      });
    }
  };
};

/**
 * Middleware for continuous session validation
 * Re-evaluates trust score on sensitive operations
 */
export const continuousValidation = () => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.trustScore) {
        return next();
      }

      // Check if session needs re-validation
      if (req.trustScore.requiresReauthentication) {
        logSecurityEvent('session_revalidation_required', req.user.id, {
          path: req.path,
          trustScore: req.trustScore.overall,
          riskLevel: req.trustScore.riskLevel
        }, 'medium');

        return res.status(401).json({
          code: 'reauthentication_required',
          message: 'Session requires re-validation due to security policy',
          trustScore: req.trustScore.overall,
          riskLevel: req.trustScore.riskLevel,
          factors: req.trustScore.factors
        });
      }

      // Update session activity
      req.sessionId = req.trustScore.sessionId;
      next();
    } catch (error) {
      console.error('Continuous validation error:', error);
      next();
    }
  };
};

/**
 * Middleware for micro-segmentation based on resource access
 * Ensures least-privilege access to specific resources
 */
export const resourceSegmentation = (resourceType: ResourceType, action: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          code: 'unauthorized',
          message: 'Authentication required'
        });
      }

      // Build context for resource access
      const context: AccessContext = {
        userId: req.user.id,
        sessionId: req.sessionId || uuidv4(),
        deviceFingerprint: undefined, // Will be enriched by device trust service
        requestPath: req.path,
        requestMethod: req.method,
        resourceType,
        requestedAction: action,
        ipAddress: req.ip || '',
        userAgent: req.get('User-Agent') || '',
        timeOfAccess: new Date(),
        sensitivityLevel: mapResourceToSensitivity(resourceType)
      };

      // Evaluate resource access
      const decision = await zeroTrustEngine.evaluateAccess(context);

      if (!decision.allowed) {
        logSecurityEvent('resource_access_denied', req.user.id, {
          resourceType,
          action,
          path: req.path,
          trustScore: decision.trustScore.overall
        }, 'medium');

        return res.status(403).json({
          code: 'resource_access_denied',
          message: 'Access to this resource is denied by security policy',
          decision: {
            allowed: decision.allowed,
            reason: decision.reason,
            trustScore: decision.trustScore.overall,
            requiredScore: decision.requiredScore
          }
        });
      }

      next();
    } catch (error) {
      console.error('Resource segmentation error:', error);
      return res.status(500).json({
        code: 'segmentation_error',
        message: 'Resource access validation failed'
      });
    }
  };
};

/**
 * Handle access denied responses
 */
function handleAccessDenied(
  req: AuthenticatedRequest, 
  res: Response, 
  decision: ReturnType<typeof zeroTrustEngine.evaluateAccess> extends Promise<infer T> ? T : never
): void {
  const trustScore = (decision as any).trustScore;

  // Log security event
  logSecurityEvent('zero_trust_access_denied', req.user?.id || null, {
    path: req.path,
    method: req.method,
    trustScore: trustScore?.overall,
    riskLevel: trustScore?.riskLevel,
    conditions: (decision as any).conditions,
    obligations: (decision as any).obligations
  }, 'high');

  // Return appropriate response based on risk level
  if (trustScore?.riskLevel === 'critical') {
    res.status(403).json({
      code: 'access_denied_critical',
      message: 'Access denied due to critical security risk',
      trustScore: trustScore.overall,
      riskLevel: trustScore.riskLevel,
      factors: trustScore.factors,
      requiresReauthentication: true
    });
  } else if (trustScore?.riskLevel === 'high') {
    res.status(403).json({
      code: 'access_denied_high_risk',
      message: 'Access denied due to high security risk',
      trustScore: trustScore.overall,
      riskLevel: trustScore.riskLevel,
      factors: trustScore.factors,
      requiresReauthentication: true
    });
  } else {
    res.status(403).json({
      code: 'access_denied',
      message: 'Access denied by security policy',
      trustScore: trustScore?.overall,
      conditions: (decision as any).conditions
    });
  }
}

/**
 * Map resource type to sensitivity level
 */
function mapResourceToSensitivity(resourceType: ResourceType): SensitivityLevel {
  const mapping: Record<ResourceType, SensitivityLevel> = {
    'api_endpoint': 'internal',
    'database': 'confidential',
    'file_storage': 'confidential',
    'message_queue': 'internal',
    'user_data': 'confidential',
    'admin_panel': 'restricted',
    'billing_system': 'top_secret',
    'external_integration': 'internal'
  };
  return mapping[resourceType] || 'internal';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate device fingerprint from request headers
 */
export function generateDeviceFingerprint(req: Request): DeviceInfo {
  return deviceTrustService.generateFingerprint(req);
}

/**
 * Get current trust score for session
 */
export function getSessionTrustScore(sessionId: string): TrustScore | undefined {
  return zeroTrustEngine.getSessionTrustScore(sessionId);
}

/**
 * Invalidate session trust score
 */
export function invalidateSession(sessionId: string): void {
  zeroTrustEngine.invalidateSession(sessionId);
}
