import express from 'express';
import { query } from './db';

import authRouter from './routes/auth';
import assetsRouter from './routes/assets';
import measurementsRouter from './routes/measurements';
import marketplaceRouter from './routes/marketplace';
import governanceRouter from './routes/governance';
import ethicsRouter from './routes/ethics';
import identityRouter from './routes/identity';
import auditRouter from './routes/audit';

// V2 Routes with enhanced functionality
import authV2Router from './routes/auth-v2';
import marketplaceV2Router from './routes/marketplace-v2';
import measurementsV2Router from './routes/measurements-v2';
import projectsRouter from './routes/projects';

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined,
    });
    next();
  });
}

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
      ethics: '/api/ethics'
    },
    documentation: 'https://docs.atlas-genesis.com'
  });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
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
