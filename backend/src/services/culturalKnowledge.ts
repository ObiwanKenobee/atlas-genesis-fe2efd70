/**
 * Cultural Knowledge Impact Platform Connector Service
 * Connector for integrating with the Culturalknowledgeimpactplatform-main layer
 */

import { query } from '../db';
import { v4 as uuidv4 } from 'uuid';

// Types for Cultural Knowledge Impact Platform
export interface CulturalKnowledgeRecord {
  id: string;
  title: string;
  description: string;
  culture: string;
  region: string;
  category: 'tradition' | 'practice' | 'art' | 'language' | 'heritage';
  impactScore: number;
  preservationStatus: 'active' | 'endangered' | 'critical' | 'revitalized';
  communitySize: number;
  historicalSignificance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CulturalImpactMetrics {
  totalRecords: number;
  avgImpactScore: number;
  byPreservationStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byRegion: Record<string, number>;
}

export interface CulturalKnowledgeQueryParams {
  culture?: string;
  region?: string;
  category?: string;
  preservationStatus?: string;
  limit?: number;
  offset?: number;
}

// Connector Configuration
interface CulturalPlatformConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
}

class CulturalKnowledgeConnector {
  private config: CulturalPlatformConfig;
  private tableName = 'cultural_knowledge_records';

  constructor(config?: Partial<CulturalPlatformConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || process.env.CULTURAL_PLATFORM_URL || 'http://localhost:3001',
      apiKey: config?.apiKey || process.env.CULTURAL_PLATFORM_API_KEY,
      timeout: config?.timeout || 30000
    };
  }

  /**
   * Create a new cultural knowledge record
   */
  async createRecord(data: Partial<CulturalKnowledgeRecord>): Promise<CulturalKnowledgeRecord> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const result = await query(
      `INSERT INTO ${this.tableName} 
       (id, title, description, culture, region, category, impact_score, preservation_status, community_size, historical_significance, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        id,
        data.title,
        data.description,
        data.culture,
        data.region,
        data.category || 'tradition',
        data.impactScore || 0,
        data.preservationStatus || 'active',
        data.communitySize || 0,
        data.historicalSignificance || 0,
        now,
        now
      ]
    );

    return this.mapRowToRecord(result.rows[0]);
  }

  /**
   * Get cultural knowledge record by ID
   */
  async getRecordById(id: string): Promise<CulturalKnowledgeRecord | null> {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? this.mapRowToRecord(result.rows[0]) : null;
  }

  /**
   * List cultural knowledge records with filtering
   */
  async listRecords(params: CulturalKnowledgeQueryParams = {}): Promise<CulturalKnowledgeRecord[]> {
    let sql = `SELECT * FROM ${this.tableName} WHERE 1=1`;
    const values: unknown[] = [];
    let paramIndex = 1;

    if (params.culture) {
      sql += ` AND culture = $${paramIndex++}`;
      values.push(params.culture);
    }

    if (params.region) {
      sql += ` AND region = $${paramIndex++}`;
      values.push(params.region);
    }

    if (params.category) {
      sql += ` AND category = $${paramIndex++}`;
      values.push(params.category);
    }

    if (params.preservationStatus) {
      sql += ` AND preservation_status = $${paramIndex++}`;
      values.push(params.preservationStatus);
    }

    sql += ' ORDER BY created_at DESC';

    if (params.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      values.push(params.limit);
    }

    if (params.offset) {
      sql += ` OFFSET $${paramIndex++}`;
      values.push(params.offset);
    }

    const result = await query(sql, values);
    return result.rows.map(row => this.mapRowToRecord(row));
  }

  /**
   * Update cultural knowledge record
   */
  async updateRecord(id: string, data: Partial<CulturalKnowledgeRecord>): Promise<CulturalKnowledgeRecord | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.culture !== undefined) {
      updates.push(`culture = $${paramIndex++}`);
      values.push(data.culture);
    }
    if (data.region !== undefined) {
      updates.push(`region = $${paramIndex++}`);
      values.push(data.region);
    }
    if (data.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(data.category);
    }
    if (data.impactScore !== undefined) {
      updates.push(`impact_score = $${paramIndex++}`);
      values.push(data.impactScore);
    }
    if (data.preservationStatus !== undefined) {
      updates.push(`preservation_status = $${paramIndex++}`);
      values.push(data.preservationStatus);
    }
    if (data.communitySize !== undefined) {
      updates.push(`community_size = $${paramIndex++}`);
      values.push(data.communitySize);
    }
    if (data.historicalSignificance !== undefined) {
      updates.push(`historical_significance = $${paramIndex++}`);
      values.push(data.historicalSignificance);
    }

    if (updates.length === 0) return this.getRecordById(id);

    updates.push(`updated_at = $${paramIndex++}`);
    values.push(new Date().toISOString());
    values.push(id);

    const result = await query(
      `UPDATE ${this.tableName} SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0] ? this.mapRowToRecord(result.rows[0]) : null;
  }

  /**
   * Delete cultural knowledge record
   */
  async deleteRecord(id: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Get cultural impact metrics
   */
  async getImpactMetrics(): Promise<CulturalImpactMetrics> {
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM ${this.tableName}`
    );
    const avgResult = await query(
      `SELECT AVG(impact_score) as avg_score FROM ${this.tableName}`
    );
    const statusResult = await query(
      `SELECT preservation_status, COUNT(*) as count FROM ${this.tableName} GROUP BY preservation_status`
    );
    const categoryResult = await query(
      `SELECT category, COUNT(*) as count FROM ${this.tableName} GROUP BY category`
    );
    const regionResult = await query(
      `SELECT region, COUNT(*) as count FROM ${this.tableName} GROUP BY region`
    );

    const byPreservationStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byRegion: Record<string, number> = {};

    statusResult.rows.forEach(row => {
      byPreservationStatus[row.preservation_status] = parseInt(row.count);
    });
    categoryResult.rows.forEach(row => {
      byCategory[row.category] = parseInt(row.count);
    });
    regionResult.rows.forEach(row => {
      byRegion[row.region] = parseInt(row.count);
    });

    return {
      totalRecords: parseInt(totalResult.rows[0].total) || 0,
      avgImpactScore: parseFloat(avgResult.rows[0]?.avg_score) || 0,
      byPreservationStatus,
      byCategory,
      byRegion
    };
  }

  /**
   * Search cultural knowledge records
   */
  async searchRecords(query: string, limit = 20): Promise<CulturalKnowledgeRecord[]> {
    const result = await query(
      `SELECT * FROM ${this.tableName}
       WHERE title ILIKE $1 OR description ILIKE $1 OR culture ILIKE $1
       ORDER BY impact_score DESC
       LIMIT $2`,
      [`%${query}%`, limit]
    );
    return result.rows.map(row => this.mapRowToRecord(row));
  }

  /**
   * Sync records from external Cultural Knowledge Platform API
   */
  async syncFromExternalApi(externalRecords: Partial<CulturalKnowledgeRecord>[]): Promise<{ synced: number; errors: string[] }> {
    const errors: string[] = [];
    let synced = 0;

    for (const record of externalRecords) {
      try {
        await this.createRecord(record);
        synced++;
      } catch (error) {
        errors.push(`Failed to sync record: ${(error as Error).message}`);
      }
    }

    return { synced, errors };
  }

  /**
   * Map database row to CulturalKnowledgeRecord
   */
  private mapRowToRecord(row: Record<string, unknown>): CulturalKnowledgeRecord {
    return {
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      culture: row.culture as string,
      region: row.region as string,
      category: row.category as 'tradition' | 'practice' | 'art' | 'language' | 'heritage',
      impactScore: parseFloat(row.impact_score as string) || 0,
      preservationStatus: row.preservation_status as 'active' | 'endangered' | 'critical' | 'revitalized',
      communitySize: parseInt(row.community_size as string) || 0,
      historicalSignificance: parseFloat(row.historical_significance as string) || 0,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    };
  }
}

// Export singleton instance
const culturalKnowledgeConnector = new CulturalKnowledgeConnector();
export default culturalKnowledgeConnector;

// Export class for testing
export { CulturalKnowledgeConnector };
