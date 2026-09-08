import { Request, Response } from 'express';
import { issueSessionToken } from '../utils/session';

// This is called after Passport successfully authenticates with Google.
// At this point req.user is the resolved/created user row set by the
// strategy. The session token is issued here (not in the strategy) so it
// goes through the same real session-tracking path as password login —
// otherwise Google logins would carry no jti and never show up in, or be
// revocable from, Active Sessions.
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as any;
  const isNew = user.isNew ?? false;
  const token = await issueSessionToken({ id: user.id, email: user.email, role: user.role, name: user.name }, req);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  // Carry the token (and profile fields) in the URL *fragment*, not the
  // query string. A fragment is never sent in the HTTP request to any
  // server — browsers strip it before the request leaves the client — so
  // it never lands in this app's, a proxy's, or Render's access logs, and
  // won't leak via a Referer header either. It's still readable client-side
  // via location.hash, which is all /auth/callback needs.
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
};
