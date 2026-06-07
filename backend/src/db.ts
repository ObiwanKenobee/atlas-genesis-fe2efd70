import { Pool, PoolConfig } from 'pg';

// Database configuration with production-safe defaults
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

// Get database configuration from environment
function getDatabaseConfig(): DatabaseConfig {
  const host = process.env.DATABASE_HOST || 'localhost';
  const port = parseInt(process.env.DATABASE_PORT || '5432');
  const database = process.env.DATABASE_NAME || 'atlas_genesis';
  const user = process.env.DATABASE_USER || 'postgres';
  const password = process.env.DATABASE_PASSWORD || '';
  const max = parseInt(process.env.DATABASE_POOL_SIZE || '20');
  const idleTimeoutMillis = parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000');
  const connectionTimeoutMillis = parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '5000');

  return {
    host,
    port,
    database,
    user,
    password,
    max,
    idleTimeoutMillis,
    connectionTimeoutMillis,
  };
}

// Check if we're in a test environment that allows mock database
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.USE_MOCK_DB === 'true';

// Support DATABASE_URL (Supabase/Render/Heroku style) as well as individual vars
const hasDatabaseConfig = !!(process.env.DATABASE_URL || process.env.DATABASE_HOST);

// Determine which database to use
const useMockDatabase = isTestEnvironment || !hasDatabaseConfig;

let pool: Pool;
let query: (text: string, params?: any[]) => Promise<any>;

if (useMockDatabase) {
  // Use mock database for testing/development
  console.log('[db] Using mock database for testing/development');
  const mockDb = require('./db.mock');
  pool = mockDb.pool;
  query = mockDb.query;
} else {
  // Use PostgreSQL database
  const config = getDatabaseConfig();
  
  console.log(`[db] Connecting to PostgreSQL: ${config.host}:${config.port}/${config.database}`);
  
  pool = new Pool(process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' }
      : false
  } : config as PoolConfig);
  
  // Handle pool errors
  pool.on('error', (err: Error) => {
    console.error('[db] Unexpected error on idle client', err);
  });

  // Test connection
  pool.query('SELECT NOW()')
    .then(() => {
      console.log('[db] Database connection established successfully');
    })
    .catch((err: Error) => {
      console.error('[db] Failed to connect to database:', err.message);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    });

  query = async (text: string, params?: any[]) => {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (> 1 second)
    if (duration > 1000) {
      console.log('[db] Slow query:', { text: text.substring(0, 100), duration, params });
    }
    
    return result;
  };
}

// Health check function for database connectivity
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
  try {
    const start = Date.now();
    await query('SELECT 1');
    return {
      healthy: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get pool statistics
export function getPoolStats() {
  if (useMockDatabase) {
    return { mock: true };
  }
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

export { pool, query };

// Export db as the pool for backward compatibility
export const db = { query, pool };
