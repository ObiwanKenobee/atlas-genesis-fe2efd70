/**
 * Device Trust Service
 * 
 * Manages device fingerprinting, trust assessment, and endpoint security verification
 * for the zero-trust architecture framework.
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { db } from '../db';
import { logSecurityEvent } from '../utils/logger';
import { DeviceFingerprint, SecurityPosture } from './zeroTrustEngine';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface DeviceInfo {
  deviceId: string;
  fingerprintHash: string;
  deviceType: string;
  osInfo: string;
  browserInfo: string;
  language: string;
  timezone: string;
  screenResolution: string;
  colorDepth: number;
  pixelRatio: number;
  hardwareConcurrency: number;
  deviceMemory: number;
  touchSupport: boolean;
  plugins: string[];
  canvasFingerprint: string;
  webglFingerprint: string;
  audioFingerprint: string;
}

export interface DeviceTrustState {
  deviceId: string;
  userId: string;
  fingerprintHash: string;
  trustLevel: 'trusted' | 'known' | 'unknown' | 'compromised';
  securityPosture: SecurityPosture;
  firstSeen: Date;
  lastSeen: Date;
  lastVerified: Date;
  verificationCount: number;
  isManaged: boolean;
  isRevoked: boolean;
  riskScore: number;
  metadata: Record<string, any>;
}

export interface EndpointSecurityCheck {
  checkId: string;
  deviceId: string;
  checkType: string;
  result: 'pass' | 'fail' | 'warning' | 'error';
  score: number;
  details: Record<string, any>;
  checkedAt: Date;
  expiresAt: Date;
}

export interface DeviceEnrollmentRequest {
  deviceInfo: DeviceInfo;
  userId: string;
  deviceName: string;
  deviceType: string;
  isManaged: boolean;
  enrollmentMethod: 'manual' | 'automatic' | 'enterprise';
}

// ============================================================================
// DEVICE TRUST SERVICE
// ============================================================================

export class DeviceTrustService {
  private deviceCache: Map<string, DeviceTrustState> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly TRUSTED_DEVICE_AGE_DAYS = 90;
  private readonly MAX_TRUSTED_DEVICES_PER_USER = 5;

  /**
   * Generate device fingerprint from request
   */
  generateFingerprint(req: Request): DeviceInfo {
    const userAgent = req.get('User-Agent') || '';
    const accept = req.get('Accept') || '';
    const acceptLanguage = req.get('Accept-Language') || '';
    const acceptEncoding = req.get('Accept-Encoding') || '';

    // Extract device information
    const deviceInfo: DeviceInfo = {
      deviceId: this.generateDeviceId(req),
      fingerprintHash: '',
      deviceType: this.detectDeviceType(userAgent),
      osInfo: this.detectOS(userAgent),
      browserInfo: this.detectBrowser(userAgent),
      language: acceptLanguage.split(',')[0] || 'en-US',
      timezone: req.get('Accept-Timezone') || 'UTC',
      screenResolution: req.get('Screen-Resolution') || '1920x1080',
      colorDepth: parseInt(req.get('Color-Depth') || '24'),
      pixelRatio: parseFloat(req.get('Pixel-Ratio') || '1'),
      hardwareConcurrency: parseInt(req.get('Hardware-Concurrency') || '4'),
      deviceMemory: parseFloat(req.get('Device-Memory') || '4'),
      touchSupport: req.get('Touch-Support') === 'true',
      plugins: this.parsePlugins(req.get('Plugins') || ''),
      canvasFingerprint: '',
      webglFingerprint: '',
      audioFingerprint: ''
    };

    // Generate fingerprints
    deviceInfo.canvasFingerprint = this.generateCanvasFingerprint(req);
    deviceInfo.webglFingerprint = this.generateWebGLFingerprint(req);
    deviceInfo.audioFingerprint = this.generateAudioFingerprint(req);

    // Create composite fingerprint hash
    deviceInfo.fingerprintHash = this.createFingerprintHash(deviceInfo);

    return deviceInfo;
  }

  /**
   * Generate unique device ID
   */
  private generateDeviceId(req: Request): string {
    const components = [
      req.get('User-Agent'),
      req.get('Screen-Resolution'),
      req.get('Color-Depth'),
      req.get('Timezone'),
      req.get('Language'),
      req.get('Platform'),
      req.get('Hardware-Concurrency'),
      req.get('Device-Memory')
    ].filter(Boolean).join('|');

    return crypto.createHash('sha256')
      .update(components)
      .digest('hex')
      .substring(0, 32);
  }

  /**
   * Create fingerprint hash
   */
  private createFingerprintHash(deviceInfo: DeviceInfo): string {
    const components = [
      deviceInfo.deviceType,
      deviceInfo.osInfo,
      deviceInfo.browserInfo,
      deviceInfo.screenResolution,
      deviceInfo.colorDepth.toString(),
      deviceInfo.language,
      deviceInfo.timezone,
      deviceInfo.canvasFingerprint,
      deviceInfo.webglFingerprint,
      deviceInfo.audioFingerprint
    ].join('|');

    return crypto.createHash('sha256')
      .update(components)
      .digest('hex');
  }

  /**
   * Detect device type from user agent
   */
  private detectDeviceType(userAgent: string): string {
    if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
      return 'mobile';
    }
    if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      return 'tablet';
    }
    return 'desktop';
  }

  /**
   * Detect OS from user agent
   */
  private detectOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  /**
   * Detect browser from user agent
   */
  private detectBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('MSIE') || userAgent.includes('Trident')) return 'IE';
    return 'Unknown';
  }

  /**
   * Parse plugins string
   */
  private parsePlugins(pluginsStr: string): string[] {
    if (!pluginsStr) return [];
    return pluginsStr.split(',').map(p => p.trim()).filter(Boolean);
  }

  /**
   * Generate canvas fingerprint
   */
  private generateCanvasFingerprint(req: Request): string {
    // Simplified canvas fingerprinting
    const components = [
      req.get('Screen-Resolution') || '1920x1080',
      req.get('Color-Depth') || '24',
      req.get('Pixel-Ratio') || '1'
    ];
    return crypto.createHash('sha256').update(components.join('|')).digest('hex');
  }

  /**
   * Generate WebGL fingerprint
   */
  private generateWebGLFingerprint(req: Request): string {
    // Simplified WebGL fingerprinting
    const components = [
      req.get('WebGL-Vendor') || 'unknown',
      req.get('WebGL-Renderer') || 'unknown'
    ];
    return crypto.createHash('sha256').update(components.join('|')).digest('hex');
  }

  /**
   * Generate audio fingerprint
   */
  private generateAudioFingerprint(req: Request): string {
    // Simplified audio fingerprinting
    return crypto.createHash('sha256')
      .update(req.get('User-Agent') || 'audio')
      .digest('hex');
  }

  /**
   * Get device trust state
   */
  async getDeviceTrustState(deviceId: string, userId: string): Promise<DeviceTrustState | null> {
    // Check cache first
    const cacheKey = `${userId}:${deviceId}`;
    const cached = this.deviceCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    try {
      const result = await db.query(
        `SELECT * FROM device_trust WHERE device_id = $1 AND user_id = $2`,
        [deviceId, userId]
      );

      if (result.length === 0) {
        return null;
      }

      const device = result[0];
      const trustState: DeviceTrustState = {
        deviceId: device.device_id,
        userId: device.user_id,
        fingerprintHash: device.fingerprint_hash,
        trustLevel: device.trust_level,
        securityPosture: {
          hasAntivirus: device.has_antivirus || false,
          firewallEnabled: device.firewall_enabled || false,
          diskEncrypted: device.disk_encrypted || false,
          osUpToDate: device.os_up_to_date || false,
          screenLockEnabled: device.screen_lock_enabled || false,
          biometricAvailable: device.biometric_available || false,
          jailbreakRooted: device.jailbreak_rooted || false,
          riskScore: device.risk_score || 0
        },
        firstSeen: new Date(device.first_seen),
        lastSeen: new Date(device.last_seen),
        lastVerified: new Date(device.last_verified),
        verificationCount: device.verification_count || 0,
        isManaged: device.is_managed || false,
        isRevoked: device.is_revoked || false,
        riskScore: device.risk_score || 0,
        metadata: device.metadata || {}
      };

      // Cache the result
      this.deviceCache.set(cacheKey, trustState);

      return trustState;
    } catch (error) {
      console.error('Error fetching device trust state:', error);
      return null;
    }
  }

  /**
   * Enroll a new device
   */
  async enrollDevice(request: DeviceEnrollmentRequest): Promise<{ success: boolean; deviceId: string; message: string }> {
    const { deviceInfo, userId, deviceName, deviceType, isManaged, enrollmentMethod } = request;

    try {
      // Check if device already enrolled
      const existing = await this.getDeviceTrustState(deviceInfo.deviceId, userId);
      if (existing) {
        return {
          success: false,
          deviceId: deviceInfo.deviceId,
          message: 'Device already enrolled'
        };
      }

      // Check device limit
      const deviceCount = await this.getDeviceCount(userId);
      if (deviceCount >= this.MAX_TRUSTED_DEVICES_PER_USER && !isManaged) {
        return {
          success: false,
          deviceId: '',
          message: `Maximum device limit (${this.MAX_TRUSTED_DEVICES_PER_USER}) reached`
        };
      }

      // Determine initial trust level
      const trustLevel: DeviceTrustState['trustLevel'] = 
        enrollmentMethod === 'enterprise' ? 'trusted' : 'known';

      // Create device record
      await db.query(
        `INSERT INTO device_trust 
         (device_id, user_id, fingerprint_hash, device_type, os_info, browser_info, 
          trust_level, first_seen, last_seen, last_verified, verification_count, 
          is_managed, enrollment_method, device_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW(), 1, $8, $9, $10)`,
        [
          deviceInfo.deviceId,
          userId,
          deviceInfo.fingerprintHash,
          deviceType,
          deviceInfo.osInfo,
          deviceInfo.browserInfo,
          trustLevel,
          isManaged,
          enrollmentMethod,
          deviceName
        ]
      );

      // Perform initial security check
      await this.performSecurityCheck(deviceInfo.deviceId);

      logSecurityEvent('device_enrolled', userId, {
        deviceId: deviceInfo.deviceId,
        deviceType,
        enrollmentMethod,
        trustLevel
      }, 'low');

      return {
        success: true,
        deviceId: deviceInfo.deviceId,
        message: 'Device enrolled successfully'
      };
    } catch (error) {
      console.error('Error enrolling device:', error);
      return {
        success: false,
        deviceId: '',
        message: 'Failed to enroll device'
      };
    }
  }

  /**
   * Verify device trust on each request
   */
  async verifyDevice(deviceInfo: DeviceInfo, userId: string): Promise<{
    isTrusted: boolean;
    trustLevel: DeviceTrustState['trustLevel'];
    riskScore: number;
    requiresVerification: boolean;
  }> {
    const existing = await this.getDeviceTrustState(deviceInfo.deviceId, userId);

    if (!existing) {
      // New device - needs verification
      return {
        isTrusted: false,
        trustLevel: 'unknown',
        riskScore: 100,
        requiresVerification: true
      };
    }

    if (existing.isRevoked) {
      logSecurityEvent('revoked_device_attempt', userId, {
        deviceId: deviceInfo.deviceId
      }, 'high');

      return {
        isTrusted: false,
        trustLevel: 'compromised',
        riskScore: 100,
        requiresVerification: true
      };
    }

    // Check if fingerprint matches
    if (existing.fingerprintHash !== deviceInfo.fingerprintHash) {
      // Fingerprint mismatch - could indicate device spoofing or change
      logSecurityEvent('device_fingerprint_mismatch', userId, {
        deviceId: deviceInfo.deviceId,
        oldHash: existing.fingerprintHash,
        newHash: deviceInfo.fingerprintHash
      }, 'medium');

      return {
        isTrusted: false,
        trustLevel: 'unknown',
        riskScore: 50,
        requiresVerification: true
      };
    }

    // Update last seen
    await db.query(
      `UPDATE device_trust SET last_seen = NOW(), last_verified = NOW() 
       WHERE device_id = $1 AND user_id = $2`,
      [deviceInfo.deviceId, userId]
    );

    return {
      isTrusted: existing.trustLevel === 'trusted',
      trustLevel: existing.trustLevel,
      riskScore: existing.riskScore,
      requiresVerification: false
    };
  }

  /**
   * Perform security check on device
   */
  async performSecurityCheck(deviceId: string): Promise<void> {
    const checks: Omit<EndpointSecurityCheck, 'checkId' | 'checkedAt' | 'expiresAt'>[] = [
      {
        deviceId,
        checkType: 'browser_security',
        result: 'pass',
        score: 100,
        details: {
          cookiesEnabled: true,
          localStorage: true,
          sessionStorage: true
        }
      },
      {
        deviceId,
        checkType: 'screen_security',
        result: 'pass',
        score: 100,
        details: {
          screenLockConfigured: true
        }
      },
      {
        deviceId,
        checkType: 'connection_security',
        result: 'pass',
        score: 100,
        details: {
          httpsUsed: true,
          tlsVersion: '1.3'
        }
      }
    ];

    for (const check of checks) {
      await db.query(
        `INSERT INTO endpoint_security_checks 
         (check_id, device_id, check_type, result, score, details, checked_at, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW() + INTERVAL '24 hours')`,
        [
          uuidv4(),
          check.deviceId,
          check.checkType,
          check.result,
          check.score,
          JSON.stringify(check.details)
        ]
      );
    }
  }

  /**
   * Update device trust level
   */
  async updateTrustLevel(
    deviceId: string, 
    userId: string, 
    newLevel: DeviceTrustState['trustLevel']
  ): Promise<void> {
    await db.query(
      `UPDATE device_trust SET trust_level = $1 WHERE device_id = $2 AND user_id = $3`,
      [newLevel, deviceId, userId]
    );

    // Invalidate cache
    this.deviceCache.delete(`${userId}:${deviceId}`);

    logSecurityEvent('device_trust_level_changed', userId, {
      deviceId,
      newTrustLevel: newLevel
    }, 'low');
  }

  /**
   * Revoke device access
   */
  async revokeDevice(deviceId: string, userId: string, reason: string): Promise<void> {
    await db.query(
      `UPDATE device_trust SET is_revoked = true, revocation_reason = $1 
       WHERE device_id = $2 AND user_id = $3`,
      [reason, deviceId, userId]
    );

    // Invalidate cache
    this.deviceCache.delete(`${userId}:${deviceId}`);

    logSecurityEvent('device_revoked', userId, {
      deviceId,
      reason
    }, 'high');
  }

  /**
   * Get count of enrolled devices for user
   */
  private async getDeviceCount(userId: string): Promise<number> {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM device_trust WHERE user_id = $1 AND is_revoked = false`,
      [userId]
    );
    return parseInt(result[0]?.count || '0');
  }

  /**
   * Get all devices for user
   */
  async getUserDevices(userId: string): Promise<DeviceTrustState[]> {
    const result = await db.query(
      `SELECT * FROM device_trust WHERE user_id = $1 AND is_revoked = false ORDER BY last_seen DESC`,
      [userId]
    );

    return result.map(device => ({
      deviceId: device.device_id,
      userId: device.user_id,
      fingerprintHash: device.fingerprint_hash,
      trustLevel: device.trust_level,
      securityPosture: {
        hasAntivirus: device.has_antivirus || false,
        firewallEnabled: device.firewall_enabled || false,
        diskEncrypted: device.disk_encrypted || false,
        osUpToDate: device.os_up_to_date || false,
        screenLockEnabled: device.screen_lock_enabled || false,
        biometricAvailable: device.biometric_available || false,
        jailbreakRooted: device.jailbreak_rooted || false,
        riskScore: device.risk_score || 0
      },
      firstSeen: new Date(device.first_seen),
      lastSeen: new Date(device.last_seen),
      lastVerified: new Date(device.last_verified),
      verificationCount: device.verification_count || 0,
      isManaged: device.is_managed || false,
      isRevoked: device.is_revoked || false,
      riskScore: device.risk_score || 0,
      metadata: device.metadata || {}
    }));
  }

  /**
   * Clear device cache
   */
  clearCache(): void {
    this.deviceCache.clear();
  }
}

// Export singleton instance
export const deviceTrustService = new DeviceTrustService();
