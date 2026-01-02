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
app.use(express.json());

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend stub running on http://localhost:${PORT}`);
});
