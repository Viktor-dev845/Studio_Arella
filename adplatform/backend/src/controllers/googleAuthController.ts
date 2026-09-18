import { Request, Response } from 'express';
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
