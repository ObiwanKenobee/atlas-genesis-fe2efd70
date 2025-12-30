import express from 'express';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(4000, () => {
  console.log('Backend stub running on http://localhost:4000');
});
