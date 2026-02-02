/**
 * MFA (Multi-Factor Authentication) Service
 * 
 * Provides TOTP-based two-factor authentication for enhanced security.
 * Supports backup codes and recovery options.
 */

import { authenticator } from 'otplib';
import crypto from 'crypto';
import { query } from '../db';

export interface MFASecret {
  id: string;
  userId: string;
  secret: string;
  backupCodes: string[];
  verified: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
}

export interface MFAVerificationResult {
  success: boolean;
  valid: boolean;
  backupCodeUsed?: boolean;
  remainingBackupCodes?: number;
}

export class MFAService {
  constructor() {
    // Configure authenticator
    authenticator.options = {
      window: 2, // Allow 2 time steps before/after for clock drift
      step: 30, // 30-second time step
    };
  }

  /**
   * Generate a new TOTP secret for a user
   */
  async generateSecret(userId: string): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> {
    // Generate secret
    const secret = authenticator.generateSecret();

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Store in database
    await query(
      `INSERT INTO mfa_secrets (user_id, secret, backup_codes, verified, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET secret = $2, backup_codes = $3, verified = $4, created_at = NOW()`,
      [userId, secret, JSON.stringify(backupCodes), false]
    );

    // Generate QR code URL
    const user = await query('SELECT email FROM users WHERE id = $1', [userId]);
    const email = user[0]?.email || userId;
    const qrCodeUrl = authenticator.keyuri(email, 'Atlas Genesis', secret);

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Verify a TOTP code
   */
  async verifyCode(userId: string, token: string): Promise<MFAVerificationResult> {
    // Get user's MFA secret
    const result = await query(
      'SELECT * FROM mfa_secrets WHERE user_id = $1',
      [userId]
    );

    if (result.length === 0) {
      return { success: false, valid: false };
    }

    const mfaSecret = result[0];

    // Check if verified
    if (!mfaSecret.verified) {
      return { success: false, valid: false };
    }

    // Verify TOTP token
    const isValid = authenticator.verify({
      token,
      secret: mfaSecret.secret,
    });

    if (isValid) {
      // Update last used timestamp
      await query(
        'UPDATE mfa_secrets SET last_used_at = NOW() WHERE user_id = $1',
        [userId]
      );

      return { success: true, valid: true };
    }

    // Check if it's a backup code
    const backupCodes = JSON.parse(mfaSecret.backup_codes || '[]');
    const backupCodeIndex = backupCodes.indexOf(token);

    if (backupCodeIndex !== -1) {
      // Remove used backup code
      backupCodes.splice(backupCodeIndex, 1);

      await query(
        'UPDATE mfa_secrets SET backup_codes = $1, last_used_at = NOW() WHERE user_id = $2',
        [JSON.stringify(backupCodes), userId]
      );

      return {
        success: true,
        valid: true,
        backupCodeUsed: true,
        remainingBackupCodes: backupCodes.length,
      };
    }

    return { success: true, valid: false };
  }

  /**
   * Verify and enable MFA for a user
   */
  async enableMFA(userId: string, token: string): Promise<boolean> {
    const result = await this.verifyCode(userId, token);

    if (!result.valid) {
      return false;
    }

    // Mark as verified
    await query(
      'UPDATE mfa_secrets SET verified = $1 WHERE user_id = $2',
      [true, userId]
    );

    return true;
  }

  /**
   * Disable MFA for a user
   */
  async disableMFA(userId: string): Promise<void> {
    await query(
      'DELETE FROM mfa_secrets WHERE user_id = $1',
      [userId]
    );
  }

  /**
   * Check if MFA is enabled for a user
   */
  async isMFAEnabled(userId: string): Promise<boolean> {
    const result = await query(
      'SELECT verified FROM mfa_secrets WHERE user_id = $1',
      [userId]
    );

    return result.length > 0 && result[0].verified;
  }

  /**
   * Get MFA status for a user
   */
  async getMFAStatus(userId: string): Promise<{
    enabled: boolean;
    verified: boolean;
    lastUsedAt?: Date;
    remainingBackupCodes?: number;
  }> {
    const result = await query(
      'SELECT * FROM mfa_secrets WHERE user_id = $1',
      [userId]
    );

    if (result.length === 0) {
      return { enabled: false, verified: false };
    }

    const mfaSecret = result[0];
    const backupCodes = JSON.parse(mfaSecret.backup_codes || '[]');

    return {
      enabled: true,
      verified: mfaSecret.verified,
      lastUsedAt: mfaSecret.last_used_at,
      remainingBackupCodes: backupCodes.length,
    };
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const backupCodes = this.generateBackupCodes();

    await query(
      'UPDATE mfa_secrets SET backup_codes = $1 WHERE user_id = $2',
      [JSON.stringify(backupCodes), userId]
    );

    return backupCodes;
  }

  /**
   * Generate random backup codes
   */
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }

    return codes;
  }

  /**
   * Validate TOTP secret format
   */
  validateSecret(secret: string): boolean {
    try {
      return authenticator.check(secret);
    } catch {
      return false;
    }
  }

  /**
   * Get current TOTP code (for testing purposes)
   */
  getCurrentCode(secret: string): string {
    return authenticator.generate(secret);
  }

  /**
   * Get time remaining for current TOTP code
   */
  getTimeRemaining(): number {
    const epoch = Math.floor(Date.now() / 1000);
    const step = 30;
    return step - (epoch % step);
  }

  /**
   * Get MFA statistics for organization
   */
  async getOrganizationMFAStats(organizationId: string): Promise<{
    totalUsers: number;
    mfaEnabled: number;
    mfaDisabled: number;
    recentlyUsed: number;
  }> {
    const result = await query(
      `SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN ms.verified = true THEN 1 END) as mfa_enabled,
        COUNT(CASE WHEN ms.verified IS NULL OR ms.verified = false THEN 1 END) as mfa_disabled,
        COUNT(CASE WHEN ms.last_used_at > NOW() - INTERVAL '7 days' THEN 1 END) as recently_used
       FROM users u
       LEFT JOIN mfa_secrets ms ON u.id = ms.user_id
       WHERE u.organization_id = $1`,
      [organizationId]
    );

    return {
      totalUsers: parseInt(result[0].total_users),
      mfaEnabled: parseInt(result[0].mfa_enabled),
      mfaDisabled: parseInt(result[0].mfa_disabled),
      recentlyUsed: parseInt(result[0].recently_used),
    };
  }

  /**
   * Get users with MFA disabled in organization
   */
  async getMfaDisabledUsers(organizationId: string): Promise<any[]> {
    const result = await query(
      `SELECT u.id, u.email, u.name, u.created_at
       FROM users u
       LEFT JOIN mfa_secrets ms ON u.id = ms.user_id
       WHERE u.organization_id = $1
         AND (ms.verified IS NULL OR ms.verified = false)
       ORDER BY u.created_at DESC`,
      [organizationId]
    );

    return result;
  }

  /**
   * Enforce MFA for organization
   */
  async enforceMFAForOrganization(organizationId: string, enforce: boolean): Promise<void> {
    await query(
      `UPDATE organizations 
       SET settings = jsonb_set(
         COALESCE(settings, '{}'::jsonb),
         '{requireMFA}',
         $1::jsonb
       )
       WHERE id = $2`,
      [enforce, organizationId]
    );
  }

  /**
   * Check if MFA is required for organization
   */
  async isMFARequired(organizationId: string): Promise<boolean> {
    const result = await query(
      `SELECT settings->>'requireMFA' as require_mfa
       FROM organizations
       WHERE id = $1`,
      [organizationId]
    );

    return result.length > 0 && result[0].require_mfa === 'true';
  }
}

// Export singleton instance
export const mfaService = new MFAService();
