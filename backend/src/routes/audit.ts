import express from 'express';
import crypto from 'crypto';
import { query } from '../db';

const router = express.Router();

router.post('/', async (req, res) => {
  const { eventType, payload, actorId } = req.body;
  if (!eventType || !payload) return res.status(422).json({ code: 'invalid' });
  const payloadStr = JSON.stringify(payload);
  const hash = crypto.createHash('sha256').update(payloadStr).digest('hex');
  try {
    const result = await query('INSERT INTO audits (event_type, actor_id, payload, payload_hash) VALUES ($1,$2,$3,$4) RETURNING id,payload_hash', [eventType, actorId || null, payload, hash]);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await query('SELECT id,event_type,actor_id,payload_hash,anchor_ref,created_at FROM audits WHERE id=$1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ code: 'not_found' });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

export default router;
