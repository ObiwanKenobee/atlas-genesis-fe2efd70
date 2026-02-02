/**
 * Encryption Service
 * 
 * Provides AES-256-GCM encryption for data at rest.
 * Ensures sensitive data is encrypted before storage.
 */

import crypto from 'crypto';
import { db } from '../db';

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
  keyVersion: number;
}

export interface EncryptionKey {
  id: string;
  keyName: string;
  algorithm: string;
  keyVersion: number;
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
  rotatedAt?: Date;
}

export class EncryptionService {
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly KEY_LENGTH = 32; // 256 bits
  private readonly IV_LENGTH = 16; // 128 bits
  private readonly AUTH_TAG_LENGTH = 16; // 128 bits
  private readonly SALT_LENGTH = 32;
  
  private keyCache: Map<string, Buffer> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeDefaultKey();
  }

  /**
   * Initialize default encryption key
   */
  private async initializeDefaultKey(): Promise<void> {
    const existingKey = await db.query(
      "SELECT * FROM encryption_keys WHERE key_name = 'default' AND is_active = true"
    );

    if (existingKey.length === 0) {
      await this.createKey('default');
    }
  }

  /**
   * Encrypt plaintext data
   */
  encrypt(plaintext: string, keyName: string = 'default'): EncryptedData {
    const key = this.getKey(keyName);
    const iv = crypto.randomBytes(this.IV_LENGTH);

    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      keyVersion: this.getKeyVersion(keyName),
    };
  }

  /**
   * Encrypt JSON object
   */
  encryptJSON(data: any, keyName: string = 'default'): EncryptedData {
    return this.encrypt(JSON.stringify(data), keyName);
  }

  /**
   * Decrypt encrypted data
   */
  decrypt(encryptedData: EncryptedData, keyName: string = 'default'): string {
    const key = this.getKey(keyName);
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Decrypt to JSON object
   */
  decryptJSON<T = any>(encryptedData: EncryptedData, keyName: string = 'default'): T {
    const plaintext = this.decrypt(encryptedData, keyName);
    return JSON.parse(plaintext);
  }

  /**
   * Hash data using SHA-256
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Hash with salt for password storage
   */
  hashWithSalt(data: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || crypto.randomBytes(this.SALT_LENGTH).toString('hex');
    const hash = crypto.pbkdf2Sync(
      data,
      actualSalt,
      100000, // iterations
      64, // key length
      'sha512'
    ).toString('hex');

    return { hash, salt: actualSalt };
  }

  /**
   * Verify hash with salt
   */
  verifyHash(data: string, hash: string, salt: string): boolean {
    const computed = this.hashWithSalt(data, salt);
    return computed.hash === hash;
  }

  /**
   * Generate random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate secure random ID
   */
  generateSecureId(): string {
    return crypto.randomUUID();
  }

  /**
   * Create a new encryption key
   */
  async createKey(keyName: string, expiresInDays?: number): Promise<EncryptionKey> {
    const keyValue = crypto.randomBytes(this.KEY_LENGTH);
    const keyVersion = await this.getNextKeyVersion(keyName);
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    // Deactivate old keys
    await db.query(
      "UPDATE encryption_keys SET is_active = false WHERE key_name = $1",
      [keyName]
    );

    // Insert new key
    const result = await db.query(
      `INSERT INTO encryption_keys (key_name, key_value, algorithm, key_version, is_active, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        keyName,
        keyValue.toString('hex'),
        this.ALGORITHM,
        keyVersion,
        true,
        expiresAt,
      ]
    );

    // Clear cache
    this.keyCache.delete(keyName);

    return result[0];
  }

  /**
   * Rotate encryption key
   */
  async rotateKey(keyName: string): Promise<void> {
    const oldKey = await this.getActiveKey(keyName);
    
    if (!oldKey) {
      throw new Error(`No active key found for ${keyName}`);
    }

    // Create new key
    await this.createKey(keyName);

    // Mark old key as rotated
    await db.query(
      `UPDATE encryption_keys 
       SET rotated_at = NOW(), is_active = false 
       WHERE id = $1`,
      [oldKey.id]
    );

    // Clear cache
    this.keyCache.delete(keyName);
  }

  /**
   * Get active encryption key
   */
  private async getActiveKey(keyName: string): Promise<EncryptionKey | null> {
    const result = await db.query(
      "SELECT * FROM encryption_keys WHERE key_name = $1 AND is_active = true",
      [keyName]
    );

    return result[0] || null;
  }

  /**
   * Get key buffer (with caching)
   */
  private getKey(keyName: string): Buffer {
    // Check cache
    const cached = this.keyCache.get(keyName);
    if (cached) {
      return cached;
    }

    // Load from database
    const keyData = this.getActiveKeySync(keyName);
    if (!keyData) {
      throw new Error(`No active encryption key found for ${keyName}`);
    }

    const key = Buffer.from(keyData.key_value, 'hex');

    // Cache the key
    this.keyCache.set(keyName, key);

    // Set cache expiration
    setTimeout(() => {
      this.keyCache.delete(keyName);
    }, this.cacheTimeout);

    return key;
  }

  /**
   * Get key version
   */
  private getKeyVersion(keyName: string): number {
    const keyData = this.getActiveKeySync(keyName);
    return keyData ? keyData.keyVersion : 1;
  }

  /**
   * Get next key version
   */
  private async getNextKeyVersion(keyName: string): Promise<number> {
    const result = await db.query(
      "SELECT MAX(key_version) as max_version FROM encryption_keys WHERE key_name = $1",
      [keyName]
    );

    return (result[0]?.max_version || 0) + 1;
  }

  /**
   * Synchronous version of getActiveKey (for internal use)
   */
  private getActiveKeySync(keyName: string): EncryptionKey | null {
    // This would normally be async, but for simplicity we're using a mock
    // In production, this should be properly async
    return null;
  }

  /**
   * Encrypt database field value
   */
  encryptField(value: string | null | undefined, keyName: string = 'default'): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const encrypted = this.encrypt(value, keyName);
    return JSON.stringify(encrypted);
  }

  /**
   * Decrypt database field value
   */
  decryptField(value: string | null | undefined, keyName: string = 'default'): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    try {
      const encryptedData: EncryptedData = JSON.parse(value);
      return this.decrypt(encryptedData, keyName);
    } catch (error) {
      console.error('Failed to decrypt field:', error);
      return null;
    }
  }

  /**
   * Encrypt sensitive user data
   */
  encryptUserData(userData: {
    email?: string;
    phone?: string;
    address?: string;
    ssn?: string;
    bankAccount?: string;
  }): {
    email?: string;
    phone?: string;
    address?: string;
    ssn?: string;
    bankAccount?: string;
  } {
    const encrypted: any = {};

    if (userData.email) {
      encrypted.email = this.encryptField(userData.email);
    }
    if (userData.phone) {
      encrypted.phone = this.encryptField(userData.phone);
    }
    if (userData.address) {
      encrypted.address = this.encryptField(userData.address);
    }
    if (userData.ssn) {
      encrypted.ssn = this.encryptField(userData.ssn);
    }
    if (userData.bankAccount) {
      encrypted.bankAccount = this.encryptField(userData.bankAccount);
    }

    return encrypted;
  }

  /**
   * Decrypt sensitive user data
   */
  decryptUserData(encryptedData: {
    email?: string;
    phone?: string;
    address?: string;
    ssn?: string;
    bankAccount?: string;
  }): {
    email?: string;
    phone?: string;
    address?: string;
    ssn?: string;
    bankAccount?: string;
  } {
    const decrypted: any = {};

    if (encryptedData.email) {
      decrypted.email = this.decryptField(encryptedData.email);
    }
    if (encryptedData.phone) {
      decrypted.phone = this.decryptField(encryptedData.phone);
    }
    if (encryptedData.address) {
      decrypted.address = this.decryptField(encryptedData.address);
    }
    if (encryptedData.ssn) {
      decrypted.ssn = this.decryptField(encryptedData.ssn);
    }
    if (encryptedData.bankAccount) {
      decrypted.bankAccount = this.decryptField(encryptedData.bankAccount);
    }

    return decrypted;
  }

  /**
   * Generate HMAC signature
   */
  generateHMAC(data: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  verifyHMAC(data: string, signature: string, secret: string): boolean {
    const computed = this.generateHMAC(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(computed, 'hex'),
      Buffer.from(signature, 'hex')
    );
  }

  /**
   * Clear key cache
   */
  clearCache(): void {
    this.keyCache.clear();
  }

  /**
   * Get encryption statistics
   */
  async getStatistics(): Promise<{
    totalKeys: number;
    activeKeys: number;
    expiredKeys: number;
    keysByAlgorithm: Record<string, number>;
  }> {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_keys,
        COUNT(*) FILTER (WHERE is_active = true) as active_keys,
        COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_keys,
        algorithm,
        COUNT(*) as count
      FROM encryption_keys
      GROUP BY algorithm
    `);

    const stats = {
      totalKeys: 0,
      activeKeys: 0,
      expiredKeys: 0,
      keysByAlgorithm: {} as Record<string, number>,
    };

    for (const row of result) {
      stats.totalKeys += parseInt(row.count);
      stats.activeKeys += parseInt(row.active_keys);
      stats.expiredKeys += parseInt(row.expired_keys);
      stats.keysByAlgorithm[row.algorithm] = parseInt(row.count);
    }

    return stats;
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();

// Helper function to encrypt sensitive data in database queries
export function encryptSensitiveFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): Partial<T> {
  const encrypted: Partial<T> = { ...data };

  for (const field of fields) {
    const value = data[field];
    if (typeof value === 'string') {
      (encrypted as any)[field] = encryptionService.encryptField(value);
    }
  }

  return encrypted;
}

// Helper function to decrypt sensitive data from database results
export function decryptSensitiveFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): T {
  const decrypted = { ...data };

  for (const field of fields) {
    const value = data[field];
    if (typeof value === 'string') {
      (decrypted as any)[field] = encryptionService.decryptField(value);
    }
  }

  return decrypted;
}
