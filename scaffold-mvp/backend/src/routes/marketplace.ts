import express from 'express';
import { query } from '../db';

const router = express.Router();

router.get('/listings', async (req, res) => {
  try {
    const result = await query('SELECT l.*, a.title as asset_title FROM listings l LEFT JOIN assets a ON a.id = l.asset_id WHERE l.status=$1', ['active']);
    res.json({ listings: result.rows });
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

router.post('/listings', async (req, res) => {
  const { assetId, sellerId, priceAmount, currency } = req.body;
  if (!assetId || !priceAmount) return res.status(422).json({ code: 'invalid' });
  try {
    const result = await query('INSERT INTO listings (asset_id, seller_id, price_amount, currency) VALUES ($1,$2,$3,$4) RETURNING *', [assetId, sellerId || null, priceAmount, currency || 'USD']);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

router.post('/:id/purchase', async (req, res) => {
  const listingId = req.params.id;
  const { buyerId } = req.body;
  try {
    const result = await query('INSERT INTO orders (listing_id, buyer_id, status) VALUES ($1,$2,$3) RETURNING *', [listingId, buyerId || null, 'pending']);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

export default router;
