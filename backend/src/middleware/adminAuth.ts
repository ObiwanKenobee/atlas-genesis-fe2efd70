import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';

// Simple admin auth: either X-Admin-Token header matches ADMIN_API_KEY
// or a JWT with role 'admin'
export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  const adminKey = process.env.ADMIN_API_KEY;

  const tokenHeader = req.get('x-admin-token');
  if (adminKey && tokenHeader && tokenHeader === adminKey) {
    return next();
  }

  // Try verifying bearer token and check role claim
  const authHeader = req.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace(/^Bearer\s+/, '');
    try {
      const payload: any = await verifyAccessToken(token);
      if (payload && (payload.role === 'admin' || payload.roles?.includes('admin'))) {
        return next();
      }
    } catch (e) {
      // fall through to forbidden
    }
  }

  res.status(403).json({ error: 'Forbidden' });
};

export default adminAuth;
