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

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/measurements', measurementsRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/governance', governanceRouter);
app.use('/api/ethics', ethicsRouter);
app.use('/api/identity', identityRouter);
app.use('/api/audit', auditRouter);

app.listen(4000, () => {
  console.log('Backend stub running on http://localhost:4000');
});
