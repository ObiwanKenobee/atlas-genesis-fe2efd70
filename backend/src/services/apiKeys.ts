/**
 * API Key Service
 * 
 * Manages API key generation, validation, revocation, and usage tracking.
 */

import crypto from 'crypto';
import { query } from '../db';

export interface APIKey {
  id: string;
  userId: string;
  organizationId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  scopes: string[];
  rateLimit: number;
  rateLimitWindow: number;
  allowedIPs: string[];
  allowedOrigins: string[];
  isActive: boolean;
  expiresAt?: Date;
  lastUsedAt?: Date;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface APIKeyUsage {
  id: string;
  apiKeyId: string;
  timestamp: Date;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  ipAddress: string;
  userAgent: string;
}

export interface APIKeyOptions {
  scopes?: string[];
  rateLimit?: number;
  rateLimitWindow?: number;
  allowedIPs?: string[];
  allowedOrigins?: string[];
  expiresAt?: Date;
}

export class APIKeyService {
  private readonly KEY_LENGTH = 32;
  private readonly KEY_PREFIX = 'atlas_';

  /**
   * Generate a new API key
   */
  async generateKey(
    userId: string,
    organizationId: string,
    name: string,
    options: APIKeyOptions = {}
  ): Promise<{ fullKey: string; keyData: APIKey }> {
    // Generate random key
    const randomKey = crypto.randomBytes(this.KEY_LENGTH).toString('base64url');
    const fullKey = `${this.KEY_PREFIX}${randomKey}`;
    const keyHash = this.hashKey(fullKey);

    // Store in database
    const result = await query(
      `INSERT INTO api_keys (
        user_id, organization_id, name, key_prefix, key_hash,
        scopes, rate_limit, rate_limit_window, allowed_ips, allowed_origins,
        expires_at, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, NOW(), NOW())
      RETURNING *`,
      [
        userId,
        organizationId,
        name,
        this.KEY_PREFIX,
        keyHash,
        JSON.stringify(options.scopes || []),
        options.rateLimit || 1000,
        options.rateLimitWindow || 60,
        JSON.stringify(options.allowedIPs || []),
        JSON.stringify(options.allowedOrigins || []),
        options.expiresAt || null,
      ]
    );

    const keyData = result.rows[0];
    return { fullKey, keyData };
  }

  /**
   * Validate an API key
   */
  async validateKey(apiKey: string): Promise<{ valid: boolean; keyData?: APIKey; error?: string }> {
    if (!apiKey.startsWith(this.KEY_PREFIX)) {
      return { valid: false, error: 'Invalid key format' };
    }
    // Hash the full key for comparison — never store or compare plaintext keys
    const keyHash = this.hashKey(apiKey);

    const result = await query(
      `SELECT * FROM api_keys WHERE key_prefix = $1 AND key_hash = $2 AND is_active = true`,
      [this.KEY_PREFIX, keyHash]
    );

    if (result.rowCount === 0) {
      return { valid: false, error: 'Invalid or expired key' };
    }

    const keyData = result.rows[0];

    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      return { valid: false, error: 'Key has expired' };
    }

    return { valid: true, keyData };
  }

  /**
   * Revoke an API key
   */
  async revokeKey(apiKeyId: string, userId: string): Promise<void> {
    await query(
      `UPDATE api_keys 
       SET is_active = false, updated_at = NOW()
       WHERE id = $1 AND user_id = $2`,
      [apiKeyId, userId]
    );
  }

  /**
   * Delete an API key permanently
   */
  async deleteKey(apiKeyId: string, userId: string): Promise<void> {
    await query(
      `DELETE FROM api_keys WHERE id = $1 AND user_id = $2`,
      [apiKeyId, userId]
    );
  }

  /**
   * Get API keys for a user
   */
  async getKeysForUser(userId: string): Promise<APIKey[]> {
    const result = await query(
      `SELECT * FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async getKeysForOrganization(organizationId: string): Promise<APIKey[]> {
    const result = await query(
      `SELECT * FROM api_keys WHERE organization_id = $1 ORDER BY created_at DESC`,
      [organizationId]
    );
    return result.rows;
  }

  async getKeyById(apiKeyId: string, userId: string): Promise<APIKey | null> {
    const result = await query(
      `SELECT * FROM api_keys WHERE id = $1 AND user_id = $2`,
      [apiKeyId, userId]
    );
    return result.rows[0] || null;
  }

  /**
   * Update API key
   */
  async updateKey(
    apiKeyId: string,
    userId: string,
    updates: Partial<{
      name: string;
      scopes: string[];
      rateLimit: number;
      rateLimitWindow: number;
      allowedIPs: string[];
      allowedOrigins: string[];
      expiresAt: Date;
    }>
  ): Promise<APIKey> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.scopes !== undefined) {
      fields.push(`scopes = $${paramIndex++}`);
      values.push(JSON.stringify(updates.scopes));
    }
    if (updates.rateLimit !== undefined) {
      fields.push(`rate_limit = $${paramIndex++}`);
      values.push(updates.rateLimit);
    }
    if (updates.rateLimitWindow !== undefined) {
      fields.push(`rate_limit_window = $${paramIndex++}`);
      values.push(updates.rateLimitWindow);
    }
    if (updates.allowedIPs !== undefined) {
      fields.push(`allowed_ips = $${paramIndex++}`);
      values.push(JSON.stringify(updates.allowedIPs));
    }
    if (updates.allowedOrigins !== undefined) {
      fields.push(`allowed_origins = $${paramIndex++}`);
      values.push(JSON.stringify(updates.allowedOrigins));
    }
    if (updates.expiresAt !== undefined) {
      fields.push(`expires_at = $${paramIndex++}`);
      values.push(updates.expiresAt);
    }

    fields.push(`updated_at = NOW()`);
    values.push(apiKeyId);
    values.push(userId);

    const result = await query(
      `UPDATE api_keys SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex++} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  /**
   * Record API key usage
   */
  async recordUsage(usage: Omit<APIKeyUsage, 'timestamp'>): Promise<void> {
    await query(
      `INSERT INTO api_key_usage (
        api_key_id, endpoint, method, status_code, response_time,
        ip_address, user_agent, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        usage.apiKeyId,
        usage.endpoint,
        usage.method,
        usage.statusCode,
        usage.responseTime,
        usage.ipAddress,
        usage.userAgent,
      ]
    );

    // Update usage count and last used timestamp
    await query(
      `UPDATE api_keys 
       SET usage_count = usage_count + 1, last_used_at = NOW()
       WHERE id = $1`,
      [usage.apiKeyId]
    );
  }

  /**
   * Get API key usage statistics
   */
  async getUsageStatistics(
    apiKeyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    requestsByEndpoint: Record<string, number>;
    requestsByMethod: Record<string, number>;
    requestsByHour: Record<string, number>;
  }> {
    const result = await query(
      `SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status_code < 400 THEN 1 END) as successful_requests,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as failed_requests,
        AVG(response_time) as average_response_time
       FROM api_key_usage
       WHERE api_key_id = $1
         AND timestamp >= $2
         AND timestamp <= $3`,
      [apiKeyId, startDate, endDate]
    );

    const stats = result.rows[0];

    // Get requests by endpoint
    const endpointResult = await query(
      `SELECT endpoint, COUNT(*) as count
       FROM api_key_usage
       WHERE api_key_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
       GROUP BY endpoint
       ORDER BY count DESC`,
      [apiKeyId, startDate, endDate]
    );

    const requestsByEndpoint: Record<string, number> = {};
    endpointResult.rows.forEach((row: any) => {
      requestsByEndpoint[row.endpoint] = parseInt(row.count);
    });

    const methodResult = await query(
      `SELECT method, COUNT(*) as count
       FROM api_key_usage
       WHERE api_key_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
       GROUP BY method
       ORDER BY count DESC`,
      [apiKeyId, startDate, endDate]
    );

    const requestsByMethod: Record<string, number> = {};
    methodResult.rows.forEach((row: any) => {
      requestsByMethod[row.method] = parseInt(row.count);
    });

    const hourResult = await query(
      `SELECT 
        DATE_TRUNC('hour', timestamp) as hour,
        COUNT(*) as count
       FROM api_key_usage
       WHERE api_key_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
       GROUP BY hour
       ORDER BY hour`,
      [apiKeyId, startDate, endDate]
    );

    const requestsByHour: Record<string, number> = {};
    hourResult.rows.forEach((row: any) => {
      requestsByHour[row.hour] = parseInt(row.count);
    });

    return {
      totalRequests: parseInt(stats.total_requests),
      successfulRequests: parseInt(stats.successful_requests),
      failedRequests: parseInt(stats.failed_requests),
      averageResponseTime: parseFloat(stats.average_response_time) || 0,
      requestsByEndpoint,
      requestsByMethod,
      requestsByHour,
    };
  }

  /**
   * Get organization API statistics
   */
  async getOrganizationStatistics(organizationId: string): Promise<{
    totalKeys: number;
    activeKeys: number;
    totalRequests: number;
    averageResponseTime: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
  }> {
    const result = await query(
      `SELECT 
        COUNT(*) as total_keys,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_keys,
        SUM(usage_count) as total_requests
       FROM api_keys
       WHERE organization_id = $1`,
      [organizationId]
    );

    const stats = result.rows[0];

    const avgResult = await query(
      `SELECT AVG(response_time) as avg_response_time
       FROM api_key_usage aku
       JOIN api_keys ak ON aku.api_key_id = ak.id
       WHERE ak.organization_id = $1`,
      [organizationId]
    );

    // Get top endpoints
    const topEndpointsResult = await query(
      `SELECT 
        aku.endpoint,
        COUNT(*) as count
       FROM api_key_usage aku
       JOIN api_keys ak ON aku.api_key_id = ak.id
       WHERE ak.organization_id = $1
       GROUP BY aku.endpoint
       ORDER BY count DESC
       LIMIT 10`,
      [organizationId]
    );

    return {
      totalKeys: parseInt(stats.total_keys),
      activeKeys: parseInt(stats.active_keys),
      totalRequests: parseInt(stats.total_requests) || 0,
      averageResponseTime: parseFloat(avgResult.rows[0]?.avg_response_time) || 0,
      topEndpoints: topEndpointsResult.rows.map((row: any) => ({
        endpoint: row.endpoint,
        count: parseInt(row.count),
      })),
    };
  }

  /**
   * Clean up old usage records
   */
  async cleanupOldUsageRecords(daysToKeep: number = 90): Promise<number> {
    // Use parameterized query — never interpolate values into SQL strings
    const result = await query(
      `DELETE FROM api_key_usage WHERE timestamp < NOW() - ($1 * INTERVAL '1 day') RETURNING id`,
      [Math.max(1, Math.floor(daysToKeep))]
    );
    return result.rowCount ?? 0;
  }

  /**
   * Generate a random API key
   */
  private generateRandomKey(): string {
    return crypto.randomBytes(this.KEY_LENGTH).toString('base64url');
  }

  /**
   * Hash an API key
   */
  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Check if IP is allowed
   */
  private isIPAllowed(ip: string, allowedIPs: string[]): boolean {
    if (allowedIPs.length === 0) return true;
    return allowedIPs.some(allowedIP => {
      // Support CIDR notation
      if (allowedIP.includes('/')) {
        // Simple CIDR check (for production, use ipaddr.js)
        const [network, prefix] = allowedIP.split('/');
        return ip.startsWith(network.substring(0, network.length - parseInt(prefix)));
      }
      return ip === allowedIP;
    });
  }

  /**
   * Check if origin is allowed
   */
  private isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
    if (allowedOrigins.length === 0) return true;
    return allowedOrigins.some(allowedOrigin => {
      // Support wildcard
      if (allowedOrigin === '*') return true;
      return origin === allowedOrigin;
    });
  }
}

// Export singleton instance
export const apiKeyService = new APIKeyService();
