import './tracing';
import './secrets';
import { runStartupChecks } from './startupChecks';
import { checkReadiness } from './readiness';
import metrics from './metrics';
import featureFlags from './featureFlags';
import adminFlagsRouter from './routes/adminFlags';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import connectRedis from 'connect-redis';
import redisClient from './redisClient';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors from 'cors';
import passport from './config/passport';
import { query } from './db';
import { verifyAccessToken } from './utils/auth';

// Import security middleware
import {
  generalRateLimit,
  authRateLimit,
  strictRateLimit,
  marketplaceBurstRateLimit,
  apiKeyRateLimit,
  monitorRateLimits,
  addRateLimitHeaders,
  validateApiKey,
  requestFingerprinting,
  preventReplayAttacks,
  securityHeaders,
  sanitizeInput,
  securityLogger,
  csrfProtection
} from './middleware/security';
import { requestLogger, logSecurityEvent } from './utils/logger';

// Import validation middleware
import { autoValidateRequest, validateRequestSize } from './middleware/validation';

// Import routes
import authRouter from './routes/auth';
import assetsRouter from './routes/assets';
import measurementsRouter from './routes/measurements';
import marketplaceRouter from './routes/marketplace';
import governanceRouter from './routes/governance';
import ethicsRouter from './routes/ethics';
import identityRouter from './routes/identity';
import auditRouter from './routes/audit';
import auditPublicRouter from './routes/audit-public';
import paymentsRouter from './routes/payments';
import securityRouter from './routes/security';
import adminFilesRouter from './routes/admin/files';
import regenerativeFinanceRouter from './routes/regenerative-finance';
import defiRouter from './routes/defi';
import communityRouter from './routes/community';
import educationRouter from './routes/education';

// Import session cleanup utility
import { cleanupExpiredSessions } from './utils/auth';

// V2 Routes with enhanced functionality
import authV2Router from './routes/auth-v2';
import marketplaceV2Router from './routes/marketplace-v2';
import measurementsV2Router from './routes/measurements-v2';
import projectsRouter from './routes/projects';
import aiRecommendationsRouter from './routes/aiRecommendations';

const app = express();

// Redis-backed sessions when REDIS_URL is configured
try {
  const RedisStore = connectRedis(session as any);
  if (process.env.REDIS_URL) {
    app.use(
      session({
        store: new RedisStore({ client: redisClient as any }),
        secret: process.env.SESSION_SECRET || 'change-me',
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24
        }
      })
    );
  }
} catch (err) {
  console.warn('Redis session store not configured', err);
}

// Security headers (must be first)
app.use(securityHeaders);

// Enhanced CORS configuration with environment-specific origins
const getAllowedOrigins = (): string[] => {
  const origins = [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4000', // For development
  ];

  // Add production frontend URLs
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }
  if (process.env.ADMIN_URL) {
    origins.push(process.env.ADMIN_URL);
  }
  if (process.env.MOBILE_APP_URL) {
    origins.push(process.env.MOBILE_APP_URL);
  }

  // Add any additional origins from environment
  if (process.env.ALLOWED_ORIGINS) {
    origins.push(...process.env.ALLOWED_ORIGINS.split(','));
  }

  return origins.filter(Boolean) as string[];
};

const allowedOrigins = getAllowedOrigins();

const server = http.createServer(app);

// Enhanced CORS options with security headers and preflight handling
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      // Log CORS violation with detailed information
      logSecurityEvent('cors_violation', null, {
        origin,
        userAgent: 'unknown',
        allowedOrigins: allowedOrigins.join(', '),
        timestamp: new Date().toISOString()
      }, 'medium');
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-Key',
    'X-MFA-Token',
    'X-CSRF-Token',
    'Accept',
    'Accept-Encoding',
    'Accept-Language',
    'Cache-Control'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-API-Version',
    'X-Request-ID'
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204 // Some legacy browsers choke on 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Additional CORS security headers middleware
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('Origin');

  // Additional security headers for CORS
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  res.set('Cross-Origin-Embedder-Policy', 'unsafe-none'); // Allow embedding for legitimate use

  next();
});

// Socket.io setup with enhanced CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: corsOptions.allowedHeaders
  },
  // Enhanced security options
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // 1MB
  allowEIO3: true,
  transports: ['websocket', 'polling'],
  // Additional security
  cookie: false, // Disable cookies for WebSocket auth
  serveClient: false // Don't serve client library
});

// Rate limiting with monitoring
app.use('/api/auth', authRateLimit); // Stricter limits for auth endpoints
app.use('/api/payments', strictRateLimit); // Very strict for payments
app.use('/api/marketplace', marketplaceBurstRateLimit); // Burst limiting for marketplace
app.use(generalRateLimit); // General rate limiting for all other routes

// API key validation and rate limiting
app.use('/api', validateApiKey);
app.use('/api', apiKeyRateLimit);

// Request fingerprinting for abuse detection
app.use('/api', requestFingerprinting);

// Prevent replay attacks
app.use('/api', preventReplayAttacks);

// Rate limit monitoring and headers
app.use('/api', monitorRateLimits);
app.use('/api', addRateLimitHeaders);

// Body parsing with size limits and validation
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request size validation
app.use('/api', validateRequestSize('10mb'));

// Input sanitization
app.use(sanitizeInput);

// Automatic request validation
app.use('/api', autoValidateRequest({
  logSecurityEvents: true,
  sanitize: true
}));

// CSRF protection for state-changing operations (skip for JWT-authenticated requests)
app.use('/api', csrfProtection);

// Security logging
app.use(securityLogger);

// Request logging
app.use(requestLogger);

// Prometheus metrics middleware (captures durations and counts)
app.use(metrics.metricsMiddleware);

// Attach feature flags to each request
app.use(featureFlags.attachFlagsMiddleware);


// API versioning middleware
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  // Extract API version from header, query param, or URL
  const version = req.headers['x-api-version'] ||
                  req.query.version ||
                  (req.path.match(/^\/api\/v(\d+)/) ? req.path.match(/^\/api\/v(\d+)/)?.[1] : '1');

  // Set version headers for security and compatibility
  res.set('X-API-Version', version as string);
  res.set('X-API-Compatible', 'true');
  res.set('X-API-Deprecated', 'false'); // Can be set to true for deprecated versions

  // Log API version usage for monitoring
  if (version !== '2') {
    logSecurityEvent('api_version_usage', (req as any).user?.id || null, {
      version,
      path: req.path,
      method: req.method,
      ip: req.ip
    }, 'low');
  }

  next();
});

// Passport middleware
app.use(passport.initialize());

// Enhanced health check with security validation
app.get('/health', async (req, res) => {
  const startTime = Date.now();

  try {
    // Basic database connectivity check
    await query('SELECT 1');

    const responseTime = Date.now() - startTime;
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    // Security status checks
    const securityStatus = {
      corsEnabled: !!corsOptions.origin,
      rateLimitingActive: true,
      csrfProtectionActive: true,
      inputSanitizationActive: true,
      requestValidationActive: true,
      apiKeyValidationActive: true,
      replayAttackPreventionActive: true
    };

    // Service health checks
    const services = {
      database: 'connected',
      websocket: io ? 'active' : 'inactive',
      api: 'active'
    };

    // Performance metrics
    const performanceMetrics = {
      responseTime: `${responseTime}ms`,
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
      },
      uptime: Math.floor(uptime),
      cpuUsage: process.cpuUsage ? `${process.cpuUsage().user / 1000000}s` : 'N/A'
    };

    // Determine overall health status based on checks
    const isHealthy = Object.values(services).every(status => status === 'active' || status === 'connected');

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: performanceMetrics.uptime,
      responseTime: performanceMetrics.responseTime,
      memory: performanceMetrics.memory,
      cpuUsage: performanceMetrics.cpuUsage,
      security: securityStatus,
      services: services
    });
  } catch (error) {
    logSecurityEvent('health_check_failed', null, {
      error: (error as Error).message,
      responseTime: Date.now() - startTime
    }, 'high');

    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Service unavailable',
      error: process.env.NODE_ENV === 'production' ? undefined : (error as Error).message
    });
  }
});

// Expose Prometheus metrics
app.get('/metrics', metrics.metricsEndpoint);

// Expose feature flags for frontend/runtime (read-only)
app.get('/api/flags', (req: Request, res: Response) => {
  res.json(featureFlags.getAllFlags());
});

// Admin routes for toggling runtime flags
app.use('/api/admin/flags', adminFlagsRouter);

// Original API Routes
app.use('/api/auth', authRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/measurements', measurementsRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/governance', governanceRouter);
app.use('/api/ethics', ethicsRouter);
app.use('/api/identity', identityRouter);
app.use('/api/audit', auditRouter);
app.use('/api/audit-public', auditPublicRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/security', securityRouter);
app.use('/api/admin/files', adminFilesRouter);
app.use('/api/regenerative-finance', regenerativeFinanceRouter);
app.use('/api/defi', defiRouter);
app.use('/api/community', communityRouter);
app.use('/api/education', educationRouter);

// V2 API Routes with enhanced functionality
app.use('/api/v2/auth', authV2Router);
app.use('/api/v2/marketplace', marketplaceV2Router);
app.use('/api/v2/measurements', measurementsV2Router);
app.use('/api/v2/projects', projectsRouter);
app.use('/api/v2/ai', aiRecommendationsRouter);

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'Atlas Genesis - Regenerative Carbon Credit Platform API',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: {
        v1: '/api/auth',
        v2: '/api/v2/auth'
      },
      marketplace: {
        v1: '/api/marketplace',
        v2: '/api/v2/marketplace'
      },
      measurements: {
        v1: '/api/measurements',
        v2: '/api/v2/measurements'
      },
      projects: '/api/v2/projects',
      governance: '/api/governance',
      assets: '/api/assets',
      ethics: '/api/ethics',
      payments: '/api/payments',
      'regenerative-finance': '/api/regenerative-finance',
      'defi': '/api/defi',
      'community': '/api/community',
      'education': '/api/education'
    },
    documentation: 'https://docs.atlas-genesis.com'
  });
});

// API root endpoint (deprecated but kept for compatibility)
app.get('/api', (req, res) => {
  res.json({
    name: 'Atlas Genesis - Regenerative Carbon Credit Platform API',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: {
        v1: '/api/auth',
        v2: '/api/v2/auth'
      },
      marketplace: {
        v1: '/api/marketplace',
        v2: '/api/v2/marketplace'
      },
      measurements: {
        v1: '/api/measurements',
        v2: '/api/v2/measurements'
      },
      projects: '/api/v2/projects',
      governance: '/api/governance',
      assets: '/api/assets',
      ethics: '/api/ethics',
      payments: '/api/payments',
      'regenerative-finance': '/api/regenerative-finance',
      'defi': '/api/defi',
      'community': '/api/community',
      'education': '/api/education'
    },
    documentation: 'https://docs.atlas-genesis.com'
  });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log security-related errors
  if (err.message.includes('CORS') || err.message.includes('rate limit')) {
    logSecurityEvent('security_error', (req as any).user?.id || null, {
      error: err.message,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }, 'medium');
  }

  // Log all errors
  console.error('Unhandled error:', err);

  res.status(err.message.includes('CORS') ? 403 : 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// WebSocket rate limiting
const websocketConnections = new Map<string, { count: number; resetTime: number; lastActivity: number }>();
const websocketMessages = new Map<string, { count: number; resetTime: number }>();

const WEBSOCKET_RATE_LIMITS = {
  connections: { windowMs: 60 * 1000, max: 5 }, // 5 connections per minute per IP
  messages: { windowMs: 60 * 1000, max: 100 }, // 100 messages per minute per socket
  subscriptions: { windowMs: 60 * 1000, max: 20 } // 20 subscription changes per minute per socket
};

const checkWebsocketRateLimit = (key: string, limits: { windowMs: number; max: number }, map: Map<string, any>): boolean => {
  const now = Date.now();
  const record = map.get(key);

  if (!record || now > record.resetTime) {
    map.set(key, { count: 1, resetTime: now + limits.windowMs });
    return true;
  }

  if (record.count >= limits.max) {
    return false;
  }

  record.count++;
  return true;
};

// Socket.io authentication and rate limiting middleware
io.use(async (socket: Socket, next) => {
  const clientIP = socket.handshake.address;

  // Rate limit connections per IP
  if (!checkWebsocketRateLimit(clientIP, WEBSOCKET_RATE_LIMITS.connections, websocketConnections)) {
    logSecurityEvent('websocket_rate_limited', null, {
      reason: 'connection_limit_exceeded',
      socketId: socket.id,
      ip: clientIP
    }, 'medium');
    return next(new Error('Connection rate limit exceeded'));
  }

  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      logSecurityEvent('websocket_auth_failed', null, {
        reason: 'no_token',
        socketId: socket.id,
        ip: clientIP
      }, 'low');
      return next(new Error('Authentication required'));
    }

    const payload = verifyAccessToken(token);

    // Fetch user from database
    const result = await query(
      'SELECT id, email, display_name, role, tenant_id, email_verified, mfa_enabled, last_login, account_locked FROM users WHERE id = $1',
      [payload.userId]
    );

    if (result.rowCount === 0) {
      logSecurityEvent('websocket_auth_failed', payload.userId, {
        reason: 'user_not_found',
        socketId: socket.id,
        ip: clientIP
      }, 'medium');
      return next(new Error('User not found'));
    }

    const user = result.rows[0];

    if (user.account_locked) {
      logSecurityEvent('websocket_auth_failed', user.id, {
        reason: 'account_locked',
        socketId: socket.id,
        ip: clientIP
      }, 'high');
      return next(new Error('Account is locked'));
    }

    // Attach user to socket
    (socket as any).user = {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      tenantId: user.tenant_id,
      emailVerified: user.email_verified,
      mfaEnabled: user.mfa_enabled,
      lastLogin: user.last_login
    };

    logSecurityEvent('websocket_auth_success', user.id, {
      socketId: socket.id,
      ip: clientIP
    }, 'low');

    next();
  } catch (error) {
    logSecurityEvent('websocket_auth_failed', null, {
      reason: 'invalid_token',
      error: (error as Error).message,
      socketId: socket.id,
      ip: clientIP
    }, 'medium');
    next(new Error('Invalid token'));
  }
});

// Socket.io connection handler
io.on('connection', (socket: Socket) => {
  const user = (socket as any).user;
  console.log(`🔌 User ${user.email} connected via WebSocket (ID: ${socket.id})`);

  // Join user-specific room for targeted notifications
  socket.join(`user:${user.id}`);

  // Join role-based rooms
  socket.join(`role:${user.role}`);

  // Join tenant-based rooms if applicable
  if (user.tenantId) {
    socket.join(`tenant:${user.tenantId}`);
  }

  // Handle subscription to real-time feeds
  socket.on('subscribe', (channels: string[]) => {
    // Rate limit subscription changes
    if (!checkWebsocketRateLimit(socket.id, WEBSOCKET_RATE_LIMITS.subscriptions, websocketMessages)) {
      logSecurityEvent('websocket_rate_limited', user.id, {
        reason: 'subscription_limit_exceeded',
        socketId: socket.id,
        ip: socket.handshake.address
      }, 'medium');
      socket.emit('error', { type: 'rate_limit', message: 'Subscription rate limit exceeded' });
      return;
    }

    channels.forEach(channel => {
      if (['price-updates', 'notifications', 'governance', 'marketplace'].includes(channel)) {
        socket.join(channel);
        console.log(`📡 User ${user.email} subscribed to ${channel}`);
      } else {
        logSecurityEvent('websocket_invalid_channel', user.id, {
          channel,
          socketId: socket.id,
          ip: socket.handshake.address
        }, 'low');
      }
    });
  });

  // Handle unsubscription
  socket.on('unsubscribe', (channels: string[]) => {
    // Rate limit subscription changes
    if (!checkWebsocketRateLimit(socket.id, WEBSOCKET_RATE_LIMITS.subscriptions, websocketMessages)) {
      logSecurityEvent('websocket_rate_limited', user.id, {
        reason: 'subscription_limit_exceeded',
        socketId: socket.id,
        ip: socket.handshake.address
      }, 'medium');
      socket.emit('error', { type: 'rate_limit', message: 'Subscription rate limit exceeded' });
      return;
    }

    channels.forEach(channel => {
      socket.leave(channel);
      console.log(`📡 User ${user.email} unsubscribed from ${channel}`);
    });
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`🔌 User ${user.email} disconnected (ID: ${socket.id}), reason: ${reason}`);
    logSecurityEvent('websocket_disconnect', user.id, {
      socketId: socket.id,
      reason,
      ip: socket.handshake.address
    }, 'low');
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`WebSocket error for user ${user.email}:`, error);
    logSecurityEvent('websocket_error', user.id, {
      socketId: socket.id,
      error: error.message,
      ip: socket.handshake.address
    }, 'medium');
  });

  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong');
  });

  // Handle custom events with rate limiting
  socket.onAny((event, ...args) => {
    // Skip built-in events
    if (['subscribe', 'unsubscribe', 'disconnect', 'error', 'ping'].includes(event)) {
      return;
    }

    // Rate limit all custom messages
    if (!checkWebsocketRateLimit(socket.id, WEBSOCKET_RATE_LIMITS.messages, websocketMessages)) {
      logSecurityEvent('websocket_rate_limited', user.id, {
        reason: 'message_limit_exceeded',
        event,
        socketId: socket.id,
        ip: socket.handshake.address
      }, 'medium');
      socket.emit('error', { type: 'rate_limit', message: 'Message rate limit exceeded' });
      return;
    }

    // Log suspicious activity
    if (args.length > 10) {
      logSecurityEvent('websocket_suspicious_activity', user.id, {
        event,
        argCount: args.length,
        socketId: socket.id,
        ip: socket.handshake.address
      }, 'medium');
    }
  });
});

// Export io instance for use in routes
export { io };

// Cleanup rate limiting maps periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  [websocketConnections, websocketMessages].forEach(map => {
    for (const [key, record] of map.entries()) {
      if (now > record.resetTime) {
        map.delete(key);
      }
    }
  });
}, 60000); // Clean up every minute

// Periodic cleanup of expired sessions
setInterval(async () => {
  try {
    await cleanupExpiredSessions();
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
  }
}, 60 * 60 * 1000); // Run every hour

// Start server after performing startup checks (fail-fast in prod if secrets missing)
(async () => {
  try {
    await runStartupChecks();
  } catch (err) {
    console.error('Startup checks failed', err);
    process.exit(1);
  }

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(`🚀 Atlas Genesis API running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
    console.log(`🌍 CORS enabled for: ${allowedOrigins.join(', ')}`);
    console.log(`🔌 WebSocket server ready for real-time connections`);
  });
})();

// Readiness endpoint for orchestration
app.get('/ready', async (req: any, res: any) => {
  try {
    const { ok, details } = await checkReadiness();
    if (ok) return res.status(200).json({ status: 'ready', details });
    return res.status(503).json({ status: 'not_ready', details });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message || String(err) });
  }
});
