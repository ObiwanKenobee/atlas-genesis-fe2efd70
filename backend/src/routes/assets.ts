import express from 'express';
import { query } from '../db';

const router = express.Router();

router.post('/', async (req, res) => {
  const { title, type, metadata, ownerId, orgId } = req.body;
  if (!type) return res.status(422).json({ code: 'invalid', message: 'type required' });
  try {
    const result = await query('INSERT INTO assets (title,type,metadata,owner_id,org_id) VALUES ($1,$2,$3,$4,$5) RETURNING *', [title, type, metadata || {}, ownerId || null, orgId || null]);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await query('SELECT * FROM assets WHERE id=$1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ code: 'not_found' });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

router.get('/', async (req, res) => {
  const { status, type, owner, page = 1, size = 25 } = req.query as any;
  const offset = (Number(page) - 1) * Number(size);
  try {
    const q = 'SELECT * FROM assets WHERE ($1::text IS NULL OR status=$1) AND ($2::text IS NULL OR type=$2) LIMIT $3 OFFSET $4';
    const result = await query(q, [status || null, type || null, Number(size), offset]);
    res.json({ items: result.rows });
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

export default router;
