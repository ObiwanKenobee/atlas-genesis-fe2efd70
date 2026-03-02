/**
 * Encryption Service
 * 
 * Provides AES-256-GCM encryption for data at rest.
 * Ensures sensitive data is encrypted before storage.
 */

import crypto, { BinaryLike } from 'crypto';
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
  key_value?: string;
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
  private keyInfoCache: Map<string, EncryptionKey> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Delay initialization to avoid blocking startup
    this.initPromise = this.initializeDefaultKey();
  }

  /**
   * Ensure initialization is complete
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized && this.initPromise) {
      await this.initPromise;
    }
  }

  /**
   * Initialize default encryption key
   */
  private async initializeDefaultKey(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const existingKey = await db.query(
        "SELECT * FROM encryption_keys WHERE key_name = 'default' AND is_active = true"
      );

      if (existingKey.length === 0) {
        // Check if we should use environment-based key for development
        const envKey = process.env.ENCRYPTION_KEY;
        if (envKey) {
          await this.createKeyWithValue('default', Buffer.from(envKey, 'hex'));
        } else {
          await this.createKey('default');
        }
      }
      
      // Populate synchronous cache
      await this.populateSyncCache('default');
      this.initialized = true;
    } catch (error) {
      console.error('[encryption] Failed to initialize default key:', error);
      // In development, create an ephemeral key
      if (process.env.NODE_ENV !== 'production') {
        const ephemeralKey = crypto.randomBytes(this.KEY_LENGTH);
        this.keyCache.set('default', ephemeralKey);
        this.initialized = true;
      }
    }
  }

  /**
   * Populate synchronous cache from database
   */
  private async populateSyncCache(keyName: string): Promise<void> {
    try {
      const result = await db.query(
        "SELECT * FROM encryption_keys WHERE key_name = $1 AND is_active = true",
        [keyName]
      );
      
      if (result.length > 0) {
        const keyData = result[0];
        this.keyInfoCache.set(keyName, keyData);
        if (keyData.key_value) {
          this.keyCache.set(keyName, Buffer.from(keyData.key_value, 'hex'));
        }
      }
    } catch (error) {
      console.error('[encryption] Failed to populate sync cache:', error);
    }
  }

  /**
   * Get key buffer (with caching)
   */
  private async getKey(keyName: string): Promise<Buffer> {
    // Check cache first
    const cached = this.keyCache.get(keyName);
    if (cached) {
      return cached;
    }

    // Load from database
    await this.populateSyncCache(keyName);
    const keyData = this.keyInfoCache.get(keyName);
    
    if (!keyData || !keyData.key_value) {
      throw new Error(`No active encryption key found for ${keyName}`);
    }

    const key = Buffer.from(keyData.key_value, 'hex');

    // Cache the key
    this.keyCache.set(keyName, key);

    return key;
  }

  /**
   * Get key version
   */
  private getKeyVersion(keyName: string): number {
    const keyData = this.keyInfoCache.get(keyName);
    return keyData ? keyData.keyVersion : 1;
  }

  /**
   * Encrypt plaintext data
   */
  async encrypt(plaintext: string, keyName: string = 'default'): Promise<EncryptedData> {
    await this.ensureInitialized();
    const key = await this.getKey(keyName);
    const iv = crypto.randomBytes(this.IV_LENGTH);

    const cipher = crypto.createCipheriv(this.ALGORITHM, key as BinaryLike, iv);

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
  async encryptJSON(data: any, keyName: string = 'default'): Promise<EncryptedData> {
    return this.encrypt(JSON.stringify(data), keyName);
  }

  /**
   * Decrypt encrypted data
   */
  async decrypt(encryptedData: EncryptedData, keyName: string = 'default'): Promise<string> {
    await this.ensureInitialized();
    const key = await this.getKey(keyName);
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key as BinaryLike, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Decrypt to JSON object
   */
  async decryptJSON<T = any>(encryptedData: EncryptedData, keyName: string = 'default'): Promise<T> {
    const plaintext = await this.decrypt(encryptedData, keyName);
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
    return this.createKeyWithValue(keyName, keyValue, expiresInDays);
  }

  /**
   * Create a new encryption key with a specific value (for environment-based keys)
   */
  async createKeyWithValue(keyName: string, keyValue: Buffer, expiresInDays?: number): Promise<EncryptionKey> {
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
       VALUES ($1, $2, $3, $4, true, $5)
       RETURNING *`,
      [
        keyName,
        keyValue.toString('hex'),
        this.ALGORITHM,
        keyVersion,
        expiresAt,
      ]
    );

    // Clear and update cache
    this.keyCache.delete(keyName);
    this.keyInfoCache.delete(keyName);
    await this.populateSyncCache(keyName);

    return result[0];
  }

  /**
   * Rotate encryption key
   */
  async rotateKey(keyName: string): Promise<void> {
    const newKey = crypto.randomBytes(this.KEY_LENGTH);
    await this.createKeyWithValue(keyName, newKey);
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
   * Encrypt database field value
   */
  async encryptField(value: string | null | undefined, keyName: string = 'default'): Promise<string | null> {
    if (value === null || value === undefined) {
      return null;
    }

    const encrypted = await this.encrypt(value, keyName);
    return JSON.stringify(encrypted);
  }

  /**
   * Decrypt database field value
   */
  async decryptField(value: string | null | undefined, keyName: string = 'default'): Promise<string | null> {
    if (value === null || value === undefined) {
      return null;
    }

    try {
      const encryptedData: EncryptedData = JSON.parse(value);
      return await this.decrypt(encryptedData, keyName);
    } catch (error) {
      console.error('Failed to decrypt field:', error);
      return null;
    }
  }

  /**
   * Encrypt sensitive user data
   */
  async encryptUserData(userData: {
    email?: string;
    phone?: string;
    address?: string;
    ssn?: string;
    bankAccount?: string;
  }): Promise<{
    email?: string;
    phone?: string;
    address?: string;
    ssn?: string;
    bankAccount?: string;
  }> {
    const encrypted: any = {};

    if (userData.email) {
      encrypted.email = await this.encryptField(userData.email);
    }
    if (userData.phone) {
      encrypted.phone = await this.encryptField(userData.phone);
    }
    if (userData.address) {
      encrypted.address = await this.encryptField(userData.address);
    }
    if (userData.ssn) {
      encrypted.ssn = await this.encryptField(userData.ssn);
    }
    if (userData.bankAccount) {
      encrypted.bankAccount = await this.encryptField(userData.bankAccount);
    }

    return encrypted;
  }

  /**
   * Decrypt sensitive user data
   */
  async decryptUserData(encryptedData: {
    email?: string;
    phone?: string;
    address?: string;
    ssn?: string;
    bankAccount?: string;
  }): Promise<{
    email?: string;
    phone?: string;
    address?: string;
    ssn?: string;
    bankAccount?: string;
  }> {
    const decrypted: any = {};

    if (encryptedData.email) {
      decrypted.email = await this.decryptField(encryptedData.email);
    }
    if (encryptedData.phone) {
      decrypted.phone = await this.decryptField(encryptedData.phone);
    }
    if (encryptedData.address) {
      decrypted.address = await this.decryptField(encryptedData.address);
    }
    if (encryptedData.ssn) {
      decrypted.ssn = await this.decryptField(encryptedData.ssn);
    }
    if (encryptedData.bankAccount) {
      decrypted.bankAccount = await this.decryptField(encryptedData.bankAccount);
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
    this.keyInfoCache.clear();
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
    try {
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
    } catch (error) {
      console.error('[encryption] Failed to get statistics:', error);
      return {
        totalKeys: this.keyCache.size,
        activeKeys: this.keyCache.size,
        expiredKeys: 0,
        keysByAlgorithm: { [this.ALGORITHM]: this.keyCache.size },
      };
    }
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();

// Helper function to encrypt sensitive data in database queries
export async function encryptSensitiveFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): Promise<Partial<T>> {
  const encrypted: Partial<T> = { ...data };

  for (const field of fields) {
    const value = data[field];
    if (typeof value === 'string') {
      (encrypted as any)[field] = await encryptionService.encryptField(value);
    }
  }

  return encrypted;
}

// Helper function to decrypt sensitive data from database results
export async function decryptSensitiveFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): Promise<T> {
  const decrypted = { ...data };

  for (const field of fields) {
    const value = data[field];
    if (typeof value === 'string') {
      (decrypted as any)[field] = await encryptionService.decryptField(value);
    }
  }

  return decrypted;
}
