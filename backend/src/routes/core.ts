import express from 'express';
import { query } from '../db';
import { verifyAccessToken } from '../utils/auth';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Auth middleware
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    
    const payload = verifyAccessToken(token);
    (req as any).user = { id: payload.userId };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// CRITICAL: Authentication
router.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await query(`
      INSERT INTO users (id, email, password_hash, display_name)
      VALUES ($1, $2, $3, $4)
    `, [userId, email, hashedPassword, displayName]);
    
    const token = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '24h' });
    res.json({ success: true, token, user: { id: userId, email, displayName } });
  } catch (error) {
    res.status(400).json({ error: 'Signup failed' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '24h' });
    res.json({ 
      success: true, 
      token, 
      user: { id: user.id, email: user.email, displayName: user.display_name } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// CRITICAL: Marketplace
router.get('/marketplace/projects', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM carbon_projects 
      WHERE status = 'active' AND available_credits > 0
      ORDER BY created_at DESC
    `);
    res.json({ success: true, projects: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/marketplace/purchase', requireAuth, async (req, res) => {
  try {
    const { projectId, quantity } = req.body;
    const userId = (req as any).user.id;
    
    const projectResult = await query('SELECT * FROM carbon_projects WHERE id = $1', [projectId]);
    if (projectResult.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const project = projectResult.rows[0];
    const totalAmount = quantity * project.price_per_credit;
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await query(`
      INSERT INTO transactions (id, user_id, project_id, transaction_type, quantity, total_amount, status)
      VALUES ($1, $2, $3, 'purchase', $4, $5, 'completed')
    `, [transactionId, userId, projectId, quantity, totalAmount]);
    
    await query(`
      INSERT INTO user_holdings (id, user_id, project_id, quantity, purchase_price)
      VALUES ($1, $2, $3, $4, $5)
    `, [`hold_${transactionId}`, userId, projectId, quantity, project.price_per_credit]);
    
    res.json({ success: true, transactionId });
  } catch (error) {
    res.status(500).json({ error: 'Purchase failed' });
  }
});

// CRITICAL: Portfolio
router.get('/portfolio/holdings', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const result = await query(`
      SELECT h.*, p.title, p.project_type
      FROM user_holdings h
      JOIN carbon_projects p ON h.project_id = p.id
      WHERE h.user_id = $1
    `, [userId]);
    
    res.json({ success: true, holdings: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch holdings' });
  }
});

export default router;