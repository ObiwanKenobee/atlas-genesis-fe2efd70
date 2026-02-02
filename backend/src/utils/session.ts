import { Request } from 'express';
import { verifyAccessToken } from './auth';

export function getSessionUserId(req: Request): string | null {
  // Prioritize JWT bearer token user id (stateless)
  const auth = req.get('authorization');
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const token = auth.replace(/^Bearer\s+/, '');
      const payload: any = verifyAccessToken(token);
      if (payload && (payload.userId || payload.sub)) return String(payload.userId || payload.sub);
    } catch (e) {
      // ignore verification errors
    }
  }

  // Fallback to session-based user id (e.g., Redis-backed session)
  if ((req as any).session && (req as any).session.userId) return (req as any).session.userId;

  return null;
}

