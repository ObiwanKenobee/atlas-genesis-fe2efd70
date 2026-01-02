import express, { Request, Response } from 'express';
import { query } from '../db';
import { createHash } from 'crypto';

const router = express.Router();

// Generate JWT token (basic implementation)
function generateToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ 
    userId, 
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) 
  })).toString('base64');
  const signature = createHash('sha256')
    .update(`${header}.${payload}.secret`)
    .digest('base64');
  return `${header}.${payload}.${signature}`;
}

// Sign Up
router.post('/signup', async (req: Request, res: Response) => {
  const { email, password, displayName, role = 'individual' } = req.body;
  
  if (!email || !password) {
    return res.status(422).json({ code: 'invalid', message: 'Email and password required' });
  }

  try {
    const hash = createHash('sha256').update(password).digest('hex');
    const result = await query(
      'INSERT INTO users (email, display_name, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id,email,display_name,role',
      [email, displayName || email, hash, role]
    );
    
    const user = result.rows[0];
    const token = generateToken(user.id);
    
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role
      },
      token
    });
  } catch (err: any) {
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({ code: 'email_exists', message: 'Email already registered' });
    }
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(422).json({ code: 'invalid', message: 'Email and password required' });
  }

  try {
    const hash = createHash('sha256').update(password).digest('hex');
    const result = await query(
      'SELECT id,email,display_name,role FROM users WHERE email=$1 AND password_hash=$2',
      [email, hash]
    );
    
    if (result.rowCount === 0) {
      return res.status(401).json({ code: 'invalid_credentials', message: 'Invalid email or password' });
    }
    
    const user = result.rows[0];
    const token = generateToken(user.id);
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role
      },
      token
    });
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

// Get Current User
router.get('/me', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ code: 'unauthorized', message: 'No token provided' });
  }

  try {
    // TODO: Verify token and extract userId
    const userId = 'temp-user-id'; // For now
    const result = await query(
      'SELECT id,email,display_name,role FROM users WHERE id=$1',
      [userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ code: 'not_found' });
    }
    
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

// Update Profile
router.put('/profile', async (req: Request, res: Response) => {
  const { userId, displayName, bio, avatar } = req.body;
  
  if (!userId) {
    return res.status(422).json({ code: 'invalid', message: 'User ID required' });
  }

  try {
    const result = await query(
      'UPDATE users SET display_name=$1, bio=$2, avatar=$3 WHERE id=$4 RETURNING id,email,display_name,bio,avatar',
      [displayName, bio || null, avatar || null, userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ code: 'not_found' });
    }
    
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

export default router;
