import express, { Request, Response } from 'express';
import { query } from '../db';

const router = express.Router();

// Get RIU Market Data
router.get('/riums/market', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT 
        COUNT(*) as total_rius,
        AVG(price) as avg_price,
        MAX(price) as max_price,
        MIN(price) as min_price,
        SUM(quantity_traded) as total_traded_volume
       FROM riums WHERE status = 'active'`
    );

    const stats = result.rows[0] || {};
    
    res.json({
      totalRIUs: stats.total_rius || 0,
      currentPrice: stats.avg_price ? parseFloat(stats.avg_price) : 0,
      highPrice: stats.max_price ? parseFloat(stats.max_price) : 0,
      lowPrice: stats.min_price ? parseFloat(stats.min_price) : 0,
      tradingVolume: stats.total_traded_volume || 0,
      circulationM: 24.5,
      ytdChange: 19.9
    });
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

// Get RIU Listings
router.get('/riums/listings', async (req: Request, res: Response) => {
  const { page = 1, size = 20, sortBy = 'price', order = 'DESC' } = req.query as any;
  const offset = (Number(page) - 1) * Number(size);
  const allowedSortBy = ['price', 'quantity', 'created_at'];
  const sortField = allowedSortBy.includes(sortBy) ? sortBy : 'price';
  
  try {
    const result = await query(
      `SELECT id, seller_id, quantity, price, impact_score, confidence_interval, status, created_at
       FROM riums 
       WHERE status = 'active'
       ORDER BY ${sortField} ${order === 'ASC' ? 'ASC' : 'DESC'}
       LIMIT $1 OFFSET $2`,
      [Number(size), offset]
    );

    const countResult = await query('SELECT COUNT(*) as total FROM riums WHERE status = \'active\'');
    const total = parseInt(countResult.rows[0].total);

    res.json({
      items: result.rows,
      pagination: {
        page: Number(page),
        size: Number(size),
        total,
        totalPages: Math.ceil(total / Number(size))
      }
    });
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

// Create RIU Listing
router.post('/riums', async (req: Request, res: Response) => {
  const { sellerId, projectId, quantity, price, impactScore, confidenceInterval } = req.body;

  if (!sellerId || !quantity || price === undefined) {
    return res.status(422).json({ code: 'invalid', message: 'sellerId, quantity, and price required' });
  }

  try {
    const result = await query(
      `INSERT INTO riums (seller_id, project_id, quantity, price, impact_score, confidence_interval, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING *`,
      [sellerId, projectId || null, quantity, price, impactScore || 0, confidenceInterval || 0.95]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

// Purchase RIUs
router.post('/riums/:id/purchase', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { buyerId, quantity, totalPrice } = req.body;

  if (!buyerId || !quantity) {
    return res.status(422).json({ code: 'invalid', message: 'buyerId and quantity required' });
  }

  try {
    // Get RIU details
    const riuResult = await query('SELECT * FROM riums WHERE id = $1', [id]);
    if (riuResult.rowCount === 0) {
      return res.status(404).json({ code: 'not_found' });
    }

    const riu = riuResult.rows[0];
    if (riu.quantity < quantity) {
      return res.status(422).json({ code: 'insufficient_quantity', message: 'Not enough RIUs available' });
    }

    // Create transaction
    const txResult = await query(
      `INSERT INTO transactions (seller_id, buyer_id, rium_id, quantity, amount, tx_type, status)
       VALUES ($1, $2, $3, $4, $5, 'purchase', 'completed')
       RETURNING *`,
      [riu.seller_id, buyerId, id, quantity, totalPrice || quantity * riu.price]
    );

    // Update RIU quantity
    await query(
      'UPDATE riums SET quantity = quantity - $1 WHERE id = $2',
      [quantity, id]
    );

    res.status(201).json({
      transaction: txResult.rows[0],
      message: `Successfully purchased ${quantity} RIUs`
    });
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

// Get RIU Bonds
router.get('/bonds', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT id, bond_type, term_years, annual_coupon, amount_available, min_purchase, status
       FROM bonds
       WHERE status = 'available'
       ORDER BY annual_coupon DESC`
    );

    res.json({
      items: result.rows,
      bonds: [
        {
          type: '5-Year',
          coupon: 3.8,
          term: 5,
          available: 50000000,
          minPurchase: 1000
        },
        {
          type: '10-Year',
          coupon: 5.2,
          term: 10,
          available: 30000000,
          minPurchase: 5000
        },
        {
          type: 'Perpetual',
          coupon: 6.5,
          term: 0,
          available: 20000000,
          minPurchase: 25000
        },
        {
          type: 'Green Impact',
          coupon: 4.5,
          term: 7,
          available: 15000000,
          minPurchase: 10000
        }
      ]
    });
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

// Purchase Bond
router.post('/bonds/:id/purchase', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { buyerId, amount } = req.body;

  if (!buyerId || !amount) {
    return res.status(422).json({ code: 'invalid', message: 'buyerId and amount required' });
  }

  try {
    // Get bond details
    const bondResult = await query('SELECT * FROM bonds WHERE id = $1', [id]);
    if (bondResult.rowCount === 0) {
      return res.status(404).json({ code: 'not_found' });
    }

    // Create bond purchase record
    const txResult = await query(
      `INSERT INTO bond_purchases (bond_id, buyer_id, amount, purchase_date, maturity_date, status)
       VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '5 years', 'active')
       RETURNING *`,
      [id, buyerId, amount]
    );

    res.status(201).json({
      purchase: txResult.rows[0],
      message: `Successfully purchased $${amount} of bond`
    });
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

// Get Trading Volume
router.get('/trading-volume', async (req: Request, res: Response) => {
  try {
    // Return mock trading data for chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const volume = months.map((month, i) => ({
      month,
      volume: Math.floor(100 + Math.random() * 200),
      value: Math.floor(1500000 + Math.random() * 500000)
    }));

    res.json({ data: volume });
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

// Get Transaction History
router.get('/transactions', async (req: Request, res: Response) => {
  const { userId, page = 1, size = 20 } = req.query as any;
  const offset = (Number(page) - 1) * Number(size);

  try {
    let query_str = 'SELECT * FROM transactions WHERE 1=1';
    const params: any[] = [];

    if (userId) {
      query_str += ` AND (seller_id = $${params.length + 1} OR buyer_id = $${params.length + 2})`;
      params.push(userId, userId);
    }

    query_str += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(size), offset);

    const result = await query(query_str, params);

    res.json({
      items: result.rows,
      pagination: {
        page: Number(page),
        size: Number(size)
      }
    });
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

export default router;
