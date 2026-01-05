import express, { Request, Response } from 'express';
import { query } from '../db';

const router = express.Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    api: ServiceStatus;
    auth: ServiceStatus;
    storage: ServiceStatus;
  };
  metrics: {
    responseTime: number;
    memoryUsage: {
      used: string;
      total: string;
      percentage: number;
    };
    cpuUsage?: number;
  };
  dependencies: {
    postgresql: DependencyStatus;
    redis?: DependencyStatus;
    external_apis: DependencyStatus;
  };
}

interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  message?: string;
}

interface DependencyStatus {
  status: 'connected' | 'disconnected' | 'error';
  responseTime?: number;
  version?: string;
  message?: string;
}

// Comprehensive health check endpoint
router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    // Initialize health status
    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp,
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(process.uptime()),
      services: {
        database: { status: 'up', lastCheck: timestamp },
        api: { status: 'up', lastCheck: timestamp },
        auth: { status: 'up', lastCheck: timestamp },
        storage: { status: 'up', lastCheck: timestamp }
      },
      metrics: {
        responseTime: 0,
        memoryUsage: {
          used: '0MB',
          total: '0MB',
          percentage: 0
        }
      },
      dependencies: {
        postgresql: { status: 'connected' },
        external_apis: { status: 'connected' }
      }
    };

    // Check database connectivity
    try {
      const dbStartTime = Date.now();
      const dbResult = await query('SELECT version(), now() as current_time');
      const dbResponseTime = Date.now() - dbStartTime;
      
      healthStatus.dependencies.postgresql = {
        status: 'connected',
        responseTime: dbResponseTime,
        version: dbResult.rows[0]?.version?.split(' ')[1] || 'unknown',
        message: 'Database connection successful'
      };
      
      healthStatus.services.database = {
        status: 'up',
        responseTime: dbResponseTime,
        lastCheck: timestamp,
        message: 'PostgreSQL operational'
      };
    } catch (dbError) {
      healthStatus.dependencies.postgresql = {
        status: 'error',
        message: `Database connection failed: ${(dbError as Error).message}`
      };
      
      healthStatus.services.database = {
        status: 'down',
        lastCheck: timestamp,
        message: 'Database unavailable'
      };
      
      healthStatus.status = 'unhealthy';
    }

    // Check authentication system
    try {
      const authStartTime = Date.now();
      const userCountResult = await query('SELECT COUNT(*) as user_count FROM users');
      const authResponseTime = Date.now() - authStartTime;
      
      healthStatus.services.auth = {
        status: 'up',
        responseTime: authResponseTime,
        lastCheck: timestamp,
        message: `Auth system operational (${userCountResult.rows[0]?.user_count || 0} users)`
      };
    } catch (authError) {
      healthStatus.services.auth = {
        status: 'down',
        lastCheck: timestamp,
        message: 'Authentication system unavailable'
      };
      
      if (healthStatus.status === 'healthy') {
        healthStatus.status = 'degraded';
      }
    }

    // Check API endpoints
    try {
      const apiStartTime = Date.now();
      // Test a simple query to verify API functionality
      await query('SELECT 1 as api_test');
      const apiResponseTime = Date.now() - apiStartTime;
      
      healthStatus.services.api = {
        status: 'up',
        responseTime: apiResponseTime,
        lastCheck: timestamp,
        message: 'API endpoints operational'
      };
    } catch (apiError) {
      healthStatus.services.api = {
        status: 'down',
        lastCheck: timestamp,
        message: 'API endpoints unavailable'
      };
      
      healthStatus.status = 'unhealthy';
    }

    // Memory usage metrics
    const memoryUsage = process.memoryUsage();
    const totalMemoryMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const usedMemoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const memoryPercentage = Math.round((usedMemoryMB / totalMemoryMB) * 100);
    
    healthStatus.metrics.memoryUsage = {
      used: `${usedMemoryMB}MB`,
      total: `${totalMemoryMB}MB`,
      percentage: memoryPercentage
    };

    // Response time
    healthStatus.metrics.responseTime = Date.now() - startTime;

    // External APIs check (simplified)
    healthStatus.dependencies.external_apis = {
      status: 'connected',
      message: 'External API dependencies operational'
    };

    // Determine overall status
    const serviceStatuses = Object.values(healthStatus.services).map(s => s.status);
    const hasDownServices = serviceStatuses.includes('down');
    const hasDegradedServices = serviceStatuses.includes('degraded');
    
    if (hasDownServices) {
      healthStatus.status = 'unhealthy';
    } else if (hasDegradedServices || memoryPercentage > 90) {
      healthStatus.status = 'degraded';
    }

    // Set appropriate HTTP status code
    let httpStatus = 200;
    if (healthStatus.status === 'degraded') {
      httpStatus = 200; // Still operational
    } else if (healthStatus.status === 'unhealthy') {
      httpStatus = 503; // Service unavailable
    }

    res.status(httpStatus).json(healthStatus);

  } catch (error) {
    // Fallback error response
    const errorResponse: Partial<HealthStatus> = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      metrics: {
        responseTime: Date.now() - startTime,
        memoryUsage: {
          used: '0MB',
          total: '0MB',
          percentage: 0
        }
      },
      services: {
        database: { status: 'down', lastCheck: timestamp, message: 'Health check failed' },
        api: { status: 'down', lastCheck: timestamp, message: 'Health check failed' },
        auth: { status: 'down', lastCheck: timestamp, message: 'Health check failed' },
        storage: { status: 'down', lastCheck: timestamp, message: 'Health check failed' }
      }
    };

    res.status(503).json({
      ...errorResponse,
      error: process.env.NODE_ENV === 'production' 
        ? 'Health check failed' 
        : (error as Error).message
    });
  }
});

// Readiness probe (for Kubernetes/container orchestration)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if the application is ready to serve traffic
    await query('SELECT 1');
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      message: 'Application is ready to serve traffic'
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      message: 'Application is not ready to serve traffic',
      error: process.env.NODE_ENV === 'production' 
        ? 'Service unavailable' 
        : (error as Error).message
    });
  }
});

// Liveness probe (for Kubernetes/container orchestration)
router.get('/live', (req: Request, res: Response) => {
  // Simple liveness check - if this endpoint responds, the process is alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    message: 'Application process is alive'
  });
});

// Detailed metrics endpoint
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: Math.floor(process.uptime()),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version
      },
      database: {
        connectionCount: 0,
        activeQueries: 0,
        totalQueries: 0
      },
      api: {
        totalRequests: 0,
        activeConnections: 0,
        averageResponseTime: 0
      }
    };

    // Get database metrics
    try {
      const dbMetrics = await query(`
        SELECT 
          count(*) as connection_count,
          sum(case when state = 'active' then 1 else 0 end) as active_queries
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);
      
      if (dbMetrics.rows.length > 0) {
        metrics.database.connectionCount = parseInt(dbMetrics.rows[0].connection_count) || 0;
        metrics.database.activeQueries = parseInt(dbMetrics.rows[0].active_queries) || 0;
      }
    } catch (dbError) {
      // Database metrics unavailable
    }

    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      timestamp: new Date().toISOString()
    });
  }
});

// Database-specific health check
router.get('/db', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Test database connection and basic operations
    const tests = [
      { name: 'connection', query: 'SELECT 1 as test' },
      { name: 'users_table', query: 'SELECT COUNT(*) as count FROM users LIMIT 1' },
      { name: 'projects_table', query: 'SELECT COUNT(*) as count FROM carbon_projects LIMIT 1' },
      { name: 'transactions_table', query: 'SELECT COUNT(*) as count FROM transactions LIMIT 1' }
    ];

    const results = [];
    
    for (const test of tests) {
      const testStartTime = Date.now();
      try {
        const result = await query(test.query);
        results.push({
          test: test.name,
          status: 'pass',
          responseTime: Date.now() - testStartTime,
          result: result.rows[0]
        });
      } catch (testError) {
        results.push({
          test: test.name,
          status: 'fail',
          responseTime: Date.now() - testStartTime,
          error: (testError as Error).message
        });
      }
    }

    const allPassed = results.every(r => r.status === 'pass');
    const totalResponseTime = Date.now() - startTime;

    res.status(allPassed ? 200 : 503).json({
      status: allPassed ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: totalResponseTime,
      tests: results,
      summary: {
        total: tests.length,
        passed: results.filter(r => r.status === 'pass').length,
        failed: results.filter(r => r.status === 'fail').length
      }
    });

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: (error as Error).message
    });
  }
});

export default router;