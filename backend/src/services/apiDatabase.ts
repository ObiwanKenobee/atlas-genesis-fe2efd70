/**
 * API Backend Database Connector Service
 * Generic database connector for the api-backend-database layer
 */

import { query } from '../db';
import { v4 as uuidv4 } from 'uuid';

// Configuration
interface DatabaseConfig {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

interface QueryOptions {
  params?: unknown[];
  timeout?: number;
}

interface BatchOperationResult {
  success: boolean;
  affectedRows: number;
  errors: string[];
}

// Table metadata interface
export interface TableInfo {
  tableName: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  rowCount: number;
}

export interface ColumnInfo {
  name: string;
  type: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  defaultValue: unknown;
}

export interface IndexInfo {
  name: string;
  columns: string[];
  isUnique: boolean;
}

export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;
}

class ApiDatabaseConnector {
  private config: DatabaseConfig;

  constructor(config?: Partial<DatabaseConfig>) {
    this.config = {
      host: config?.host || process.env.DB_HOST || 'localhost',
      port: config?.port || parseInt(process.env.DB_PORT || '5432'),
      database: config?.database || process.env.DB_NAME || 'atlas_genesis',
      user: config?.user || process.env.DB_USER || 'postgres',
      password: config?.password || process.env.DB_PASSWORD || '',
      max: config?.max || 20,
      idleTimeoutMillis: config?.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config?.connectionTimeoutMillis || 5000
    };
  }

  /**
   * Get database health status
   */
  async getHealth(): Promise<DatabaseHealth> {
    const startTime = Date.now();
    
    try {
      const result = await query('SELECT 1 as health_check');
      const latency = Date.now() - startTime;
      
      const statsResult = await query(`
        SELECT 
          numbackends as active_connections,
          (SELECT setting FROM pg_settings WHERE name = 'max_connections')::int as max_connections
      `);
      
      return {
        status: 'healthy',
        latency,
        activeConnections: parseInt(statsResult.rows[0]?.active_connections || '0'),
        idleConnections: 0,
        waitingConnections: 0
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        activeConnections: 0,
        idleConnections: 0,
        waitingConnections: 0
      };
    }
  }

  /**
   * Execute a query
   */
  async query<T = unknown>(sql: string, options?: QueryOptions): Promise<T[]> {
    const result = await query(sql, options?.params || []);
    return result.rows as T[];
  }

  /**
   * Execute a query and return single row
   */
  async queryOne<T = unknown>(sql: string, options?: QueryOptions): Promise<T | null> {
    const result = await query(sql, options?.params || []);
    return (result.rows[0] as T) || null;
  }

  /**
   * Execute a raw query
   */
  async executeRaw(sql: string, params?: unknown[]): Promise<{ rows: unknown[]; rowCount: number }> {
    const result = await query(sql, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount || 0
    };
  }

  /**
   * Get list of tables
   */
  async getTables(): Promise<string[]> {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    return result.rows.map((row: Record<string, unknown>) => row.table_name as string);
  }

  /**
   * Get table information
   */
  async getTableInfo(tableName: string): Promise<TableInfo | null> {
    try {
      const columnsResult = await query(`
        SELECT 
          column_name as name,
          data_type as type,
          is_nullable = 'YES' as is_nullable,
          column_key = 'PRI' as is_primary_key,
          column_default as default_value
        FROM information_schema.columns
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
      `, [tableName]);

      const indexesResult = await query(`
        SELECT 
          indexname as name,
          indexdef as definition
        FROM pg_indexes
        WHERE tablename = $1
      `, [tableName]);

      const countResult = await query(`SELECT COUNT(*) as count FROM ${tableName}`);

      const columns = columnsResult.rows.map((row: Record<string, unknown>) => ({
        name: row.name as string,
        type: row.type as string,
        isNullable: row.is_nullable as boolean,
        isPrimaryKey: row.is_primary_key as boolean,
        defaultValue: row.default_value
      }));

      const indexes = indexesResult.rows.map((row: Record<string, unknown>) => {
        const def = row.definition as string;
        const match = def.match(/\\(([^)]+)\\)/);
        return {
          name: row.name as string,
          columns: match ? match[1].split(',').map((c: string) => c.trim()) : [],
          isUnique: def.includes('UNIQUE')
        };
      });

      return {
        tableName,
        columns,
        indexes,
        rowCount: parseInt(countResult.rows[0]?.count || '0')
      };
    } catch (error) {
      console.error(`Error getting table info for ${tableName}:`, error);
      return null;
    }
  }

  /**
   * Insert record into table
   */
  async insert(tableName: string, data: Record<string, unknown>): Promise<string> {
    const id = uuidv4();
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 2}`).join(', ');
    
    const sql = `
      INSERT INTO ${tableName} (id, ${keys.join(', ')})
      VALUES ($1, ${placeholders})
      RETURNING id
    `;
    
    const result = await query(sql, [id, ...values]);
    return result.rows[0]?.id;
  }

  /**
   * Update record in table
   */
  async update(tableName: string, id: string, data: Record<string, unknown>): Promise<boolean> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    
    const sql = `
      UPDATE ${tableName}
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
    `;
    
    const result = await query(sql, [id, ...values]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete record from table
   */
  async delete(tableName: string, id: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM ${tableName} WHERE id = $1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Find record by ID
   */
  async findById<T = unknown>(tableName: string, id: string): Promise<T | null> {
    const result = await query(
      `SELECT * FROM ${tableName} WHERE id = $1`,
      [id]
    );
    return (result.rows[0] as T) || null;
  }

  /**
   * Find records with conditions
   */
  async find<T = unknown>(
    tableName: string,
    conditions?: Record<string, unknown>,
    options?: { limit?: number; offset?: number; orderBy?: string; orderDir?: 'ASC' | 'DESC' }
  ): Promise<T[]> {
    let sql = `SELECT * FROM ${tableName}`;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (conditions && Object.keys(conditions).length > 0) {
      const clauses = Object.entries(conditions).map(([key, value]) => {
        if (value === null) {
          return `${key} IS NULL`;
        }
        return `${key} = ${paramIndex++}`;
      });
      
      sql += ` WHERE ${clauses.join(' AND ')}`;
      params.push(...Object.values(conditions).filter(v => v !== null));
    }

    if (options?.orderBy) {
      sql += ` ORDER BY ${options.orderBy} ${options.orderDir || 'ASC'}`;
    }

    if (options?.limit) {
      sql += ` LIMIT ${paramIndex++}`;
      params.push(options.limit);
    }

    if (options?.offset) {
      sql += ` OFFSET ${paramIndex++}`;
      params.push(options.offset);
    }

    const result = await query(sql, params);
    return result.rows as T[];
  }

  /**
   * Count records in table
   */
  async count(tableName: string, conditions?: Record<string, unknown>): Promise<number> {
    let sql = `SELECT COUNT(*) as count FROM ${tableName}`;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (conditions && Object.keys(conditions).length > 0) {
      const clauses = Object.entries(conditions).map(([key, value]) => {
        if (value === null) {
          return `${key} IS NULL`;
        }
        return `${key} = $${paramIndex++}`;
      });
      
      sql += ` WHERE ${clauses.join(' AND ')}`;
      params.push(...Object.values(conditions).filter(v => v !== null));
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0]?.count || '0');
  }

  /**
   * Check if record exists
   */
  async exists(tableName: string, id: string): Promise<boolean> {
    const result = await query(
      `SELECT 1 FROM ${tableName} WHERE id = $1 LIMIT 1`,
      [id]
    );
    return result.rows.length > 0;
  }

  /**
   * Get database version
   */
  async getVersion(): Promise<string | null> {
    const result = await query('SELECT version()');
    return result.rows[0]?.version || null;
  }

  /**
   * Get database size
   */
  async getSize(): Promise<string | null> {
    const result = await query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `);
    return result.rows[0]?.size || null;
  }

  /**
   * Create custom query view
   */
  async createView(viewName: string, querySql: string): Promise<boolean> {
    try {
      await query(`CREATE OR REPLACE VIEW ${viewName} AS ${querySql}`);
      return true;
    } catch (error) {
      console.error(`Error creating view ${viewName}:`, error);
      return false;
    }
  }
}

// Export singleton instance
const apiDatabaseConnector = new ApiDatabaseConnector();
export default apiDatabaseConnector;

// Export class for testing
export { ApiDatabaseConnector };
