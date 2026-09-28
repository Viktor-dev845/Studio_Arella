import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import pool from '../db/pool';
import { issueSessionToken } from '../utils/session';

// This is called after Passport successfully authenticates with Google.
// At this point req.user is the resolved/created user row set by the
// strategy. The session token is issued here (not in the strategy) so it
// goes through the same real session-tracking path as password login —
// otherwise Google logins would carry no jti and never show up in, or be
// revocable from, Active Sessions.
export const googleCallback = async (req: Request, res: Response, next: any): Promise<void> => {
  try {
    const user = req.user as any;
    const isNew = user.isNew ?? false;
    const token = await issueSessionToken({ id: user.id, email: user.email, role: user.role, name: user.name }, req);

    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
      frontendUrl = 'https://' + frontendUrl;
    }

    const params = new URLSearchParams({
      token,
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'advertiser',
      credits: String(user.credits || 0),
      avatar: user.avatar || '',
      id: user.id,
      new: isNew ? '1' : '0',
    });
    const redirectUrl = `${new URL('/auth/callback', frontendUrl).toString()}#${params.toString()}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in googleCallback:', error);
    next(error);
  }
};

const oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Google One Tap ────────────────────────────────────────────────────────────
// Receives the credential JWT that Google One Tap posts back to the page,
// verifies it server-side, upserts the user (same logic as the Passport
// strategy), then returns a session token as JSON so the frontend can
// store it directly without any page redirect.
export const googleOneTap = async (req: Request, res: Response, next: any): Promise<void> => {
  try {
    const { credential } = req.body;
    if (!credential) {
      res.status(400).json({ message: 'Missing Google credential' });
      return;
    }

    // Verify the ID token with Google's public keys
    const ticket = await oauthClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(401).json({ message: 'Invalid Google token' });
      return;
    }

    const email = payload.email;
    const name = payload.name || email.split('@')[0];
    const avatar = payload.picture || null;
    const googleId = payload.sub;

    // Upsert user — same logic as the Passport strategy
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user: any;
    let isNew = false;

    if (existing.rows.length > 0) {
      const result = await pool.query(
        `UPDATE users
         SET avatar = COALESCE(avatar, $1),
             google_id = COALESCE(google_id, $2),
             email_verified = true
         WHERE email = $3
         RETURNING id, name, first_name, last_name, email, role, credits, avatar, terms_accepted, has_seen_tour`,
        [avatar, googleId, email]
      );
      user = result.rows[0];
    } else {
      const result = await pool.query(
        `INSERT INTO users (name, email, avatar, google_id, role, password, email_verified)
         VALUES ($1, $2, $3, $4, 'advertiser', '', true)
         RETURNING id, name, first_name, last_name, email, role, credits, avatar, terms_accepted, has_seen_tour`,
        [name, email, avatar, googleId]
      );
      user = result.rows[0];
      isNew = true;
    }

    if (user.suspended) {
      res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
      return;
    }

    const token = await issueSessionToken(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      req
    );

    res.json({ token, user, isNew });
  } catch (error) {
    console.error('Error in googleOneTap:', error);
    next(error);
  }
};
