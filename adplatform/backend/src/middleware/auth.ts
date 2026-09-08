import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db/pool';

// AuthRequest gives controllers typed access to req.user
export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string; name: string; jti?: string };
}

// Cast authenticate to RequestHandler so Express router accepts it
// without conflicting with the global Express.User type.
// Inside the handler we use AuthRequest for the typed user payload.
export const authenticate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string; email: string; role: string; name: string; jti?: string };

    // Real "Active Sessions" + instant revocation: a token minted after this
    // feature shipped carries a jti tied to a row in `sessions`. Revoking a
    // session (or deleting the account) removes/flags that row, so the next
    // request with that token is rejected immediately instead of only when
    // the JWT's own 7-day expiry eventually catches up.
    // Tokens issued before this shipped have no jti — reject them here would
    // instantly log out every already-logged-in production user the moment
    // this deploys, so those fall back to the old trust-the-signature-alone
    // behavior until they naturally expire.
    if (decoded.jti) {
      const sessionRes = await pool.query(
        'SELECT id FROM sessions WHERE jti = $1 AND revoked_at IS NULL',
        [decoded.jti]
      );
      if (sessionRes.rows.length === 0) {
        res.status(401).json({ message: 'Session has been revoked. Please sign in again.' });
        return;
      }
      // Fire-and-forget — activity tracking shouldn't add latency to every request.
      pool.query('UPDATE sessions SET last_active_at = NOW() WHERE jti = $1', [decoded.jti]).catch(() => {});
    }

    // Cast req to AuthRequest so we can attach our typed user object
    (req as AuthRequest).user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  next();
};
