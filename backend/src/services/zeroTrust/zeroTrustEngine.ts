/**
 * Zero-Trust Architecture Framework
 * 
 * This module implements a comprehensive zero-trust security model for the Atlas Humanitarian platform.
 * Zero-Trust Principles Implemented:
 * 1. Never Trust, Always Verify - Continuous identity verification
 * 2. Assume Breach - Minimize blast radius with micro-segmentation
 * 3. Explicit Verification - Context-aware access decisions
 * 4. Least Privilege Access - Just-in-time and just-enough access
 * 5. Device Trust - Endpoint security validation
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { db } from '../db';
import { logSecurityEvent } from '../utils/logger';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Geographic location information
 */
export interface GeoLocation {
  countryCode: string;
  countryName: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

/**
 * Trust Score Components
 */
export interface TrustScoreComponents {
  identityScore: number;        // 0-100: Identity verification strength
  deviceScore: number;          // 0-100: Device trust and security
  behaviorScore: number;        // 0-100: Behavioral anomaly score
  contextScore: number;         // 0-100: Contextual risk assessment
  networkScore: number;         // 0-100: Network security posture
}

/**
 * Complete Trust Score
 */
export interface TrustScore {
  overall: number;              // 0-100: Composite trust score
  components: TrustScoreComponents;
  lastUpdated: Date;
  sessionId: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
  requiresReauthentication: boolean;
  factors: string[];
}

/**
 * Access Context for Zero-Trust Decisions
 */
export interface AccessContext {
  userId: string;
  sessionId: string;
  deviceFingerprint: DeviceFingerprint;
  requestPath: string;
  requestMethod: string;
  resourceType: ResourceType;
  requestedAction: string;
  ipAddress: string;
  userAgent: string;
  geoLocation?: GeoLocation;
  timeOfAccess: Date;
  sensitivityLevel: SensitivityLevel;
}

/**
 * Device Fingerprint for Trust Assessment
 */
export interface DeviceFingerprint {
  deviceId: string;
  fingerprintHash: string;
  deviceType: string;
  osInfo: string;
  browserInfo: string;
  isManaged: boolean;
  isTrusted: boolean;
  securityPosture: SecurityPosture;
  firstSeen: Date;
  lastSeen: Date;
  trustLevel: 'trusted' | 'known' | 'unknown' | 'compromised';
}

/**
 * Security Posture Assessment
 */
export interface SecurityPosture {
  hasAntivirus: boolean;
  firewallEnabled: boolean;
  diskEncrypted: boolean;
  osUpToDate: boolean;
  screenLockEnabled: boolean;
  biometricAvailable: boolean;
  jailbreakRooted: boolean;
  riskScore: number;
}

/**
 * Resource Types for Micro-Segmentation
 */
export type ResourceType = 
  | 'api_endpoint'
  | 'database'
  | 'file_storage'
  | 'message_queue'
  | 'user_data'
  | 'admin_panel'
  | 'billing_system'
  | 'external_integration';

/**
 * Sensitivity Levels
 */
export type SensitivityLevel = 
  | 'public'
  | 'internal'
  | 'confidential'
  | 'restricted'
  | 'top_secret';

/**
 * Policy Decision
 */
export interface PolicyDecision {
  allowed: boolean;
  reason: string;
  trustScore: TrustScore;
  requiredScore: number;
  conditions: string[];
  obligations: string[];
  sessionId: string;
  timestamp: Date;
  expiresAt: Date;
}

/**
 * Risk Indicator for Anomaly Detection
 */
export interface RiskIndicator {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  detectedAt: Date;
  mitigations: string[];
  score: number;
}

/**
 * Zero-Trust Policy Configuration
 */
export interface ZeroTrustPolicy {
  policyId: string;
  name: string;
  description: string;
  resourceType: ResourceType;
  sensitivityLevel: SensitivityLevel;
  minimumTrustScore: number;
  requiredFactors: AuthenticationFactor[];
  allowedNetworks: string[];
  timeRestrictions: TimeRestriction[];
  riskExceptions: RiskException[];
  isActive: boolean;
  priority: number;
}

export interface AuthenticationFactor {
  factorId: string;
  factorType: 'password' | 'mfa_totp' | 'mfa_sms' | 'mfa_email' | 'biometric' | 'hardware_key' | 'session_token';
  required: boolean;
  freshnessMinutes: number;
}

export interface TimeRestriction {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface RiskException {
  exceptionId: string;
  userId?: string;
  deviceId?: string;
  ipRange?: string;
  reason: string;
  expiresAt: Date;
  approvedBy: string;
}

// ============================================================================
// ZERO-TRUST ENGINE SERVICE
// ============================================================================

export class ZeroTrustEngine {
  private policyCache: Map<string, ZeroTrustPolicy> = new Map();
  private sessionTrustScores: Map<string, TrustScore> = new Map();
  private riskIndicators: Map<string, RiskIndicator[]> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializePolicyCache();
  }

  /**
   * Initialize policy cache with default zero-trust policies
   */
  private async initializePolicyCache(): Promise<void> {
    const policies = await this.loadPolicies();
    policies.forEach(policy => this.policyCache.set(policy.policyId, policy));
  }

  /**
   * Load policies from database
   */
  private async loadPolicies(): Promise<ZeroTrustPolicy[]> {
    // Default zero-trust policies
    return [
      {
        policyId: 'ztp-api-access',
        name: 'API Access Zero-Trust Policy',
        description: 'Default policy for all API endpoints requiring continuous verification',
        resourceType: 'api_endpoint',
        sensitivityLevel: 'internal',
        minimumTrustScore: 70,
        requiredFactors: [
          { factorId: 'session_token', factorType: 'session_token', required: true, freshnessMinutes: 60 },
          { factorId: 'mfa', factorType: 'mfa_totp', required: false, freshnessMinutes: 480 }
        ],
        allowedNetworks: ['corporate', 'vpn', 'trusted'],
        timeRestrictions: [],
        riskExceptions: [],
        isActive: true,
        priority: 100
      },
      {
        policyId: 'ztp-user-data',
        name: 'User Data Protection Policy',
        description: 'Strict policy for accessing user personal data',
        resourceType: 'user_data',
        sensitivityLevel: 'confidential',
        minimumTrustScore: 80,
        requiredFactors: [
          { factorId: 'session_token', factorType: 'session_token', required: true, freshnessMinutes: 30 },
          { factorId: 'mfa', factorType: 'mfa_totp', required: true, freshnessMinutes: 240 }
        ],
        allowedNetworks: ['corporate', 'vpn'],
        timeRestrictions: [
          { daysOfWeek: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '18:00', timezone: 'UTC' }
        ],
        riskExceptions: [],
        isActive: true,
        priority: 200
      },
      {
        policyId: 'ztp-admin-panel',
        name: 'Admin Panel Access Policy',
        description: 'Highest security policy for administrative access',
        resourceType: 'admin_panel',
        sensitivityLevel: 'restricted',
        minimumTrustScore: 95,
        requiredFactors: [
          { factorId: 'session_token', factorType: 'session_token', required: true, freshnessMinutes: 15 },
          { factorId: 'mfa_hardware', factorType: 'hardware_key', required: true, freshnessMinutes: 480 },
          { factorId: 'mfa_totp', factorType: 'mfa_totp', required: true, freshnessMinutes: 240 }
        ],
        allowedNetworks: ['corporate'],
        timeRestrictions: [
          { daysOfWeek: [1, 2, 3, 4, 5], startTime: '07:00', endTime: '20:00', timezone: 'UTC' }
        ],
        riskExceptions: [],
        isActive: true,
        priority: 300
      },
      {
        policyId: 'ztp-billing',
        name: 'Billing System Access Policy',
        description: 'Strict policy for billing and payment operations',
        resourceType: 'billing_system',
        sensitivityLevel: 'top_secret',
        minimumTrustScore: 90,
        requiredFactors: [
          { factorId: 'session_token', factorType: 'session_token', required: true, freshnessMinutes: 30 },
          { factorId: 'mfa', factorType: 'mfa_totp', required: true, freshnessMinutes: 240 }
        ],
        allowedNetworks: ['corporate', 'vpn'],
        timeRestrictions: [],
        riskExceptions: [],
        isActive: true,
        priority: 250
      }
    ];
  }

  /**
   * Evaluate access request against zero-trust policies
   */
  async evaluateAccess(context: AccessContext): Promise<PolicyDecision> {
    const startTime = Date.now();
    const sessionId = context.sessionId || uuidv4();

    // Calculate trust score for this request
    const trustScore = await this.calculateTrustScore(context);

    // Get applicable policy
    const policy = await this.getApplicablePolicy(context);

    // Check if request is within allowed network
    const networkAllowed = this.checkNetworkRestrictions(context, policy);

    // Check time restrictions
    const timeAllowed = this.checkTimeRestrictions(policy);

    // Check for risk exceptions
    const hasException = await this.checkRiskExceptions(context, trustScore);

    // Determine if reauthentication is required
    const requiresReauth = trustScore.requiresReauthentication || 
                          trustScore.overall < policy.minimumTrustScore;

    // Build policy decision
    const allowed = !requiresReauth && networkAllowed && timeAllowed && !hasException;
    const conditions: string[] = [];
    const obligations: string[] = [];

    if (!networkAllowed) {
      conditions.push('Request must originate from allowed network');
    }
    if (!timeAllowed) {
      conditions.push('Access outside permitted time window - requires exception');
    }
    if (trustScore.overall < policy.minimumTrustScore) {
      conditions.push(`Trust score ${trustScore.overall} below required ${policy.minimumTrustScore}`);
      obligations.push('Request step-up authentication');
    }
    if (requiresReauth) {
      obligations.push('Force reauthentication');
    }

    // Record policy decision
    await this.recordPolicyDecision({
      policyId: policy.policyId,
      sessionId,
      allowed,
      trustScore: trustScore.overall,
      conditions,
      processingTimeMs: Date.now() - startTime
    });

    return {
      allowed,
      reason: allowed ? 'Access granted' : 'Access denied',
      trustScore,
      requiredScore: policy.minimumTrustScore,
      conditions,
      obligations,
      sessionId,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minute decision validity
    };
  }

  /**
   * Calculate comprehensive trust score for a session/request
   */
  async calculateTrustScore(context: AccessContext): Promise<TrustScore> {
    const components: TrustScoreComponents = {
      identityScore: await this.calculateIdentityScore(context),
      deviceScore: await this.calculateDeviceScore(context),
      behaviorScore: await this.calculateBehaviorScore(context),
      contextScore: await this.calculateContextScore(context),
      networkScore: await this.calculateNetworkScore(context)
    };

    // Weighted average for overall score
    const weights = {
      identity: 0.30,
      device: 0.20,
      behavior: 0.25,
      context: 0.15,
      network: 0.10
    };

    const overall = Math.round(
      components.identityScore * weights.identity +
      components.deviceScore * weights.device +
      components.behaviorScore * weights.behavior +
      components.contextScore * weights.context +
      components.networkScore * weights.network
    );

    // Determine risk level
    let riskLevel: TrustScore['riskLevel'];
    let requiresReauthentication = false;
    const factors: string[] = [];

    if (overall >= 90) {
      riskLevel = 'none';
    } else if (overall >= 75) {
      riskLevel = 'low';
    } else if (overall >= 60) {
      riskLevel = 'medium';
    } else if (overall >= 40) {
      riskLevel = 'high';
      requiresReauthentication = true;
    } else {
      riskLevel = 'critical';
      requiresReauthentication = true;
    }

    // Collect risk factors
    if (components.identityScore < 70) {
      factors.push('Weak identity verification');
    }
    if (components.deviceScore < 60) {
      factors.push('Untrusted or insecure device');
    }
    if (components.behaviorScore < 50) {
      factors.push('Anomalous behavior detected');
    }
    if (components.contextScore < 60) {
      factors.push('Unusual context for access');
    }
    if (components.networkScore < 50) {
      factors.push('Insecure network detected');
    }

    const sessionId = context.sessionId || uuidv4();
    const trustScore: TrustScore = {
      overall,
      components,
      lastUpdated: new Date(),
      sessionId,
      riskLevel,
      requiresReauthentication,
      factors
    };

    // Cache the trust score
    this.sessionTrustScores.set(sessionId, trustScore);

    return trustScore;
  }

  /**
   * Calculate identity verification score
   */
  private async calculateIdentityScore(context: AccessContext): Promise<number> {
    let score = 50; // Base score

    try {
      // Check if user exists and is active
      const user = await db.query(
        'SELECT id, email_verified, mfa_enabled, last_login, account_locked FROM users WHERE id = $1',
        [context.userId]
      );

      if (user.length === 0 || user[0].account_locked) {
        return 0;
      }

      // Email verified
      if (user[0].email_verified) {
        score += 15;
      }

      // MFA enabled
      if (user[0].mfa_enabled) {
        score += 20;
      }

      // Recent login (within 24 hours)
      const lastLogin = new Date(user[0].last_login);
      if (Date.now() - lastLogin.getTime() < 24 * 60 * 60 * 1000) {
        score += 10;
      }

      // Check for active MFA session
      const mfaSession = await db.query(
        'SELECT verified_at FROM mfa_sessions WHERE user_id = $1 AND expires_at > NOW() ORDER BY verified_at DESC LIMIT 1',
        [context.userId]
      );

      if (mfaSession.length > 0) {
        const mfaTime = new Date(mfaSession[0].verified_at).getTime();
        if (Date.now() - mfaTime < 4 * 60 * 60 * 1000) { // 4 hours
          score += 5;
        }
      }

    } catch (error) {
      console.error('Error calculating identity score:', error);
      return 0;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate device trust score
   */
  private async calculateDeviceScore(context: AccessContext): Promise<number> {
    const device = context.deviceFingerprint;

    if (!device) {
      return 40; // Unknown device gets lower score
    }

    let score = 50;

    // Trust level contribution
    const trustLevelScores: Record<DeviceFingerprint['trustLevel'], number> = {
      'trusted': 30,
      'known': 15,
      'unknown': 0,
      'compromised': -100
    };
    score += trustLevelScores[device.trustLevel] || 0;

    // Security posture contribution
    const posture = device.securityPosture;
    if (posture.hasAntivirus) score += 5;
    if (posture.firewallEnabled) score += 5;
    if (posture.diskEncrypted) score += 5;
    if (posture.osUpToDate) score += 5;
    if (posture.screenLockEnabled) score += 5;
    if (!posture.jailbreakRooted) score += 5;
    if (posture.biometricAvailable) score += 3;

    // Subtract for risks
    score -= posture.riskScore;

    // Managed device bonus
    if (device.isManaged) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate behavioral anomaly score
   */
  private async calculateBehaviorScore(context: AccessContext): Promise<number> {
    let score = 70; // Start with neutral score
    const anomalies: string[] = [];

    try {
      // Get recent behavior history
      const recentRequests = await db.query(
        `SELECT COUNT(*) as count, AVG(request_duration_ms) as avg_duration 
         FROM audit_logs 
         WHERE user_id = $1 
         AND created_at > NOW() - INTERVAL '1 hour'`,
        [context.userId]
      );

      if (recentRequests.length > 0) {
        const hourCount = parseInt(recentRequests[0].count);

        // Check for excessive requests
        if (hourCount > 1000) {
          score -= 20;
          anomalies.push('Excessive request volume');
        } else if (hourCount > 500) {
          score -= 10;
        }

        // Check for unusual patterns
        const avgDuration = parseFloat(recentRequests[0].avg_duration || '0');
        if (avgDuration > 5000) {
          score -= 10;
          anomalies.push('Unusually slow requests');
        }
      }

      // Check for location anomalies
      const lastAccess = await db.query(
        `SELECT ip_address, created_at FROM audit_logs 
         WHERE user_id = $1 AND action = 'authentication_success'
         ORDER BY created_at DESC LIMIT 2`,
        [context.userId]
      );

      if (lastAccess.length >= 2) {
        const currentIP = context.ipAddress;
        const previousIP = lastAccess[1].ip_address;

        // Simple IP comparison (in production, use geo-distance)
        if (currentIP !== previousIP) {
          score -= 10;
          anomalies.push('IP address changed');
        }
      }

      // Check for time anomalies
      const currentHour = context.timeOfAccess.getUTCHours();
      if (currentHour < 6 || currentHour > 22) {
        score -= 5;
        anomalies.push('Access outside normal hours');
      }

      // Record anomalies
      if (anomalies.length > 0) {
        await this.recordBehavioralAnomalies(context.userId, anomalies);
      }

    } catch (error) {
      console.error('Error calculating behavior score:', error);
      score -= 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate contextual risk score
   */
  private async calculateContextScore(context: AccessContext): Promise<number> {
    let score = 70;

    // Sensitivity level impact
    const sensitivityScores: Record<SensitivityLevel, number> = {
      'public': 10,
      'internal': 5,
      'confidential': 0,
      'restricted': -10,
      'top_secret': -20
    };
    score += sensitivityScores[context.sensitivityLevel] || 0;

    // Check for sensitive operations
    const sensitivePatterns = ['password', 'billing', 'admin', 'delete', 'transfer'];
    const action = context.requestedAction.toLowerCase();
    
    for (const pattern of sensitivePatterns) {
      if (action.includes(pattern)) {
        score -= 10;
      }
    }

    // Resource type impact
    const resourceScores: Record<ResourceType, number> = {
      'api_endpoint': 5,
      'database': -15,
      'file_storage': -10,
      'message_queue': -5,
      'user_data': -15,
      'admin_panel': -25,
      'billing_system': -20,
      'external_integration': -10
    };
    score += resourceScores[context.resourceType] || 0;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate network security score
   */
  private async calculateNetworkScore(context: AccessContext): Promise<number> {
    let score = 60;

    // Corporate network bonus
    const corporateRanges = process.env.CORPORATE_IP_RANGES?.split(',') || [];
    
    for (const range of corporateRanges) {
      if (this.ipInRange(context.ipAddress, range.trim())) {
        score += 25;
        break;
      }
    }

    // VPN check
    const vpnRanges = process.env.VPN_IP_RANGES?.split(',') || [];
    for (const range of vpnRanges) {
      if (this.ipInRange(context.ipAddress, range.trim())) {
        score += 20;
        break;
      }
    }

    // Known data center ranges
    const trustedRanges = process.env.TRUSTED_IP_RANGES?.split(',') || [];
    for (const range of trustedRanges) {
      if (this.ipInRange(context.ipAddress, range.trim())) {
        score += 15;
        break;
      }
    }

    // Geographic risk (simplified - in production use MaxMind or similar)
    if (context.geoLocation) {
      const riskyCountries = ['unknown'];
      if (riskyCountries.includes(context.geoLocation.countryCode)) {
        score -= 30;
      }
    }

    // Check if IP is known malicious
    const maliciousIP = await this.checkMaliciousIP(context.ipAddress);
    if (maliciousIP) {
      score = 0;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get applicable policy for access context
   */
  private async getApplicablePolicy(context: AccessContext): Promise<ZeroTrustPolicy> {
    // Find matching policy
    const policies = Array.from(this.policyCache.values())
      .filter(p => p.isActive)
      .sort((a, b) => b.priority - a.priority);

    for (const policy of policies) {
      if (this.matchesResourceType(policy.resourceType, context.resourceType)) {
        return policy;
      }
    }

    // Return default policy
    return this.policyCache.get('ztp-api-access')!;
  }

  /**
   * Check network restrictions
   */
  private checkNetworkRestrictions(context: AccessContext, policy: ZeroTrustPolicy): boolean {
    if (policy.allowedNetworks.length === 0) {
      return true; // No restriction
    }

    // Check if current network is allowed
    const currentNetwork = this.classifyNetwork(context.ipAddress);
    return policy.allowedNetworks.includes(currentNetwork);
  }

  /**
   * Classify network type
   */
  private classifyNetwork(ip: string): string {
    const corporateRanges = process.env.CORPORATE_IP_RANGES?.split(',') || [];
    const vpnRanges = process.env.VPN_IP_RANGES?.split(',') || [];

    for (const range of corporateRanges) {
      if (this.ipInRange(ip, range.trim())) return 'corporate';
    }

    for (const range of vpnRanges) {
      if (this.ipInRange(ip, range.trim())) return 'vpn';
    }

    return 'unknown';
  }

  /**
   * Check if IP is in range (simplified CIDR check)
   */
  private ipInRange(ip: string, cidr: string): boolean {
    try {
      const [range, bits] = cidr.split('/');
      const mask = parseInt(bits);
      
      const ipNum = this.ipToNumber(ip);
      const rangeNum = this.ipToNumber(range);
      const maskNum = ~((1 << (32 - mask)) - 1) >>> 0;

      return (ipNum & maskNum) === (rangeNum & maskNum);
    } catch {
      return false;
    }
  }

  /**
   * Convert IP to number
   */
  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  /**
   * Check time restrictions
   */
  private checkTimeRestrictions(policy: ZeroTrustPolicy): boolean {
    if (policy.timeRestrictions.length === 0) {
      return true;
    }

    const now = new Date();
    const currentDay = now.getUTCDay();
    const currentTime = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`;

    for (const restriction of policy.timeRestrictions) {
      if (restriction.daysOfWeek.includes(currentDay)) {
        if (currentTime >= restriction.startTime && currentTime <= restriction.endTime) {
          return true;
        }
      }
    }

    return policy.timeRestrictions.length === 0;
  }

  /**
   * Check for risk exceptions
   */
  private async checkRiskExceptions(context: AccessContext, trustScore: TrustScore): Promise<boolean> {
    // Check if there's an exception for this user/device/IP
    const exceptions = await db.query(
      `SELECT * FROM zero_trust_exceptions 
       WHERE (user_id = $1 OR device_id = $2 OR ip_range = $3)
       AND expires_at > NOW()`,
      [context.userId, context.deviceFingerprint?.deviceId, context.ipAddress]
    );

    return exceptions.length > 0;
  }

  /**
   * Check if IP is known malicious
   */
  private async checkMaliciousIP(ip: string): Promise<boolean> {
    // In production, integrate with threat intelligence feeds
    // For now, check against local blacklist
    const blacklisted = await db.query(
      'SELECT id FROM ip_blacklist WHERE ip_address = $1 AND expires_at > NOW()',
      [ip]
    );

    return blacklisted.length > 0;
  }

  /**
   * Check if resource type matches policy
   */
  private matchesResourceType(policyType: ResourceType, requestType: ResourceType): boolean {
    const hierarchy: Record<ResourceType, ResourceType[]> = {
      'api_endpoint': ['api_endpoint'],
      'database': ['database', 'user_data'],
      'file_storage': ['file_storage', 'user_data'],
      'message_queue': ['message_queue'],
      'user_data': ['user_data'],
      'admin_panel': ['admin_panel', 'api_endpoint'],
      'billing_system': ['billing_system', 'user_data'],
      'external_integration': ['external_integration']
    };

    return hierarchy[policyType]?.includes(requestType) || false;
  }

  /**
   * Record behavioral anomalies for user
   */
  private async recordBehavioralAnomalies(userId: string, anomalies: string[]): Promise<void> {
    const existing = this.riskIndicators.get(userId) || [];

    for (const anomaly of anomalies) {
      existing.push({
        type: anomaly,
        severity: 'medium',
        description: anomaly,
        detectedAt: new Date(),
        mitigations: ['Monitor closely', 'Consider step-up authentication'],
        score: 10
      });
    }

    this.riskIndicators.set(userId, existing.slice(-50)); // Keep last 50

    // Log security event
    logSecurityEvent('behavioral_anomaly', userId, {
      anomalies,
      riskIndicators: existing.length
    }, 'low');
  }

  /**
   * Record policy decision for auditing
   */
  private async recordPolicyDecision(decision: {
    policyId: string;
    sessionId: string;
    allowed: boolean;
    trustScore: number;
    conditions: string[];
    processingTimeMs: number;
  }): Promise<void> {
    try {
      await db.query(
        `INSERT INTO zero_trust_policy_decisions 
         (policy_id, session_id, allowed, trust_score, conditions, processing_time_ms)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          decision.policyId,
          decision.sessionId,
          decision.allowed,
          decision.trustScore,
          JSON.stringify(decision.conditions),
          decision.processingTimeMs
        ]
      );
    } catch (error) {
      console.error('Failed to record policy decision:', error);
    }
  }

  /**
   * Invalidate session trust score
   */
  invalidateSession(sessionId: string): void {
    this.sessionTrustScores.delete(sessionId);
  }

  /**
   * Get session trust score
   */
  getSessionTrustScore(sessionId: string): TrustScore | undefined {
    return this.sessionTrustScores.get(sessionId);
  }

  /**
   * Add risk exception
   */
  async addRiskException(exception: RiskException): Promise<void> {
    await db.query(
      `INSERT INTO zero_trust_exceptions 
       (exception_id, user_id, device_id, ip_range, reason, expires_at, approved_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        exception.exceptionId,
        exception.userId,
        exception.deviceId,
        exception.ipRange,
        exception.reason,
        exception.expiresAt,
        exception.approvedBy
      ]
    );
  }
}

// Export singleton instance
export const zeroTrustEngine = new ZeroTrustEngine();
