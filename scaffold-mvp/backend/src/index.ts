import express from 'express';
import { query } from './db';

import authRouter from './routes/auth';
import assetsRouter from './routes/assets';
import measurementsRouter from './routes/measurements';
import marketplaceRouter from './routes/marketplace';
import governanceRouter from './routes/governance';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/measurements', measurementsRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/governance', governanceRouter);

app.listen(4000, () => {
  console.log('Backend stub running on http://localhost:4000');
});
