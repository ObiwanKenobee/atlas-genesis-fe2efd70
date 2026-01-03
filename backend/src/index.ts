import express from 'express';
import cors from 'cors';
import passport from './config/passport';
import { query } from './db';

// Import security middleware
import {
  generalRateLimit,
  authRateLimit,
  strictRateLimit,
  securityHeaders,
  sanitizeInput,
  securityLogger
} from './middleware/security';
import { requestLogger, logSecurityEvent } from './utils/logger';

// Import routes
import authRouter from './routes/auth';
import assetsRouter from './routes/assets';
import measurementsRouter from './routes/measurements';
import marketplaceRouter from './routes/marketplace';
import governanceRouter from './routes/governance';
import ethicsRouter from './routes/ethics';
import identityRouter from './routes/identity';
import auditRouter from './routes/audit';
import paymentsRouter from './routes/payments';

// V2 Routes with enhanced functionality
import authV2Router from './routes/auth-v2';
import marketplaceV2Router from './routes/marketplace-v2';
import measurementsV2Router from './routes/measurements-v2';
import projectsRouter from './routes/projects';

const app = express();

// Security headers (must be first)
app.use(securityHeaders);

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      logSecurityEvent('cors_violation', null, { origin, userAgent: 'unknown' }, 'medium');
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Rate limiting
app.use('/api/auth', authRateLimit); // Stricter limits for auth endpoints
app.use('/api/payments', strictRateLimit); // Very strict for payments
app.use(generalRateLimit); // General rate limiting for all other routes

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Security logging
app.use(securityLogger);

// Request logging
app.use(requestLogger);

// Passport middleware
app.use(passport.initialize());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Original API Routes
app.use('/api/auth', authRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/measurements', measurementsRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/governance', governanceRouter);
app.use('/api/ethics', ethicsRouter);
app.use('/api/identity', identityRouter);
app.use('/api/audit', auditRouter);
app.use('/api/payments', paymentsRouter);

// V2 API Routes with enhanced functionality
app.use('/api/v2/auth', authV2Router);
app.use('/api/v2/marketplace', marketplaceV2Router);
app.use('/api/v2/measurements', measurementsV2Router);
app.use('/api/v2/projects', projectsRouter);

// Root endpoint with API documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'Atlas Genesis - Regenerative Carbon Credit Platform API',
    version: '2.0.0',
    endpoints: {
      health: '/health',
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
      payments: '/api/payments'
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Atlas Genesis API running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`🌍 CORS enabled for: ${allowedOrigins.join(', ')}`);
});
