import { Request, Response, RequestHandler } from 'express';
import pool from '../db/pool';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dns from 'dns';
import { promisify } from 'util';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { AuthRequest } from '../middleware/auth';
import { issueSessionToken, describeUserAgent } from '../utils/session';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import {
  sendVerificationEmail, sendWelcomeEmail,
  sendPasswordResetEmail,
} from '../services/emailService';

const resolveMx = promisify(dns.resolveMx);

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  });
}

// Known disposable / temp email domains to block
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com','guerrillamail.com','10minutemail.com','tempmail.com',
  'throwam.com','yopmail.com','sharklasers.com','guerrillamailblock.com',
  'grr.la','guerrillamail.info','spam4.me','trashmail.com','trashmail.me',
  'dispostable.com','fakeinbox.com','maildrop.cc','spamgourmet.com',
  'getairmail.com','filzmail.com','mailnull.com','spamcorners.com',
  'mt2015.com','binkmail.com','bob.email','clrmail.com','dcctb.com',
]);

// Validate that the email domain has real MX records
async function validateEmailDomain(email: string): Promise<{ valid: boolean; reason?: string }> {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return { valid: false, reason: 'Invalid email format' };
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: 'Temporary or disposable email addresses are not allowed. Please use a real email.' };
  }
  try {
    const records = await resolveMx(domain);
    if (!records || records.length === 0) {
      return { valid: false, reason: `The email domain "${domain}" does not exist or cannot receive emails.` };
    }
    return { valid: true };
  } catch {
    return { valid: false, reason: `The email domain "${domain}" does not exist or cannot receive emails.` };
  }
}

// ── Register ──────────────────────────────────────────────────────────────────
export const register: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { first_name, last_name, email, password, business_name, phone, role } = req.body;

    if (!first_name || !last_name || !email || !password || !phone) {
      res.status(400).json({ message: 'First name, last name, email, password, and phone are required' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    // Validate email domain (MX check + disposable email block)
    const emailCheck = await validateEmailDomain(email);
    if (!emailCheck.valid) {
      res.status(400).json({ message: emailCheck.reason });
      return;
    }

    const existing = await pool.query('SELECT id, email_verified FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      if (existing.rows[0].email_verified) {
        res.status(409).json({ message: 'An account with this email already exists' });
        return;
      }
      
      // If the account exists but is NOT verified, they likely abandoned registration or want to resend OTP.
      // Delete the old unverified data so we can recreate it cleanly.
      await pool.query('DELETE FROM email_verification_tokens WHERE user_id = $1', [existing.rows[0].id]);
      await pool.query('DELETE FROM users WHERE id = $1', [existing.rows[0].id]);
    }

    const fullName = `${first_name.trim()} ${last_name.trim()}`;
    const hashed = await bcrypt.hash(password, 12);
    
    // Self-registration can only ever create advertiser or screen_owner accounts.
    // 'admin' must never be settable from client input — admins are promoted
    // by an existing admin through the admin panel, not created via signup.
    const userRole = role === 'screen_owner' ? 'screen_owner' : 'advertiser';

    const result = await pool.query(
       `INSERT INTO users (name, first_name, last_name, email, password, role, business_name, phone, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
        RETURNING id, name, first_name, last_name, email, role, credits, business_name, phone, terms_accepted`,
      [fullName, first_name.trim(), last_name.trim(), email, hashed, userRole, business_name || null, phone || null]
    );
    const user = result.rows[0];

    // Create 4-digit verification code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    await pool.query(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [user.id, code]
    );

    const jwtToken = await issueSessionToken({ id: user.id, email: user.email, role: user.role, name: user.name }, req);
    res.status(201).json({
      token: jwtToken,
      user: { ...user, email_verified: false },
      message: 'Account created! Please choose a verification method.',
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message || 'Registration failed. Please try again.', error: err.toString() });
  }
};

// ── Verify email ──────────────────────────────────────────────────────────────
export const verifyEmail: RequestHandler = async (req, res) => {
  try {
    const { code } = req.body;
    const authReq = req as AuthRequest; // Assume they send their JWT token when verifying
    const userId = authReq.user?.id;
    
    if (!code) { res.status(400).json({ message: 'Verification code is required' }); return; }
    if (!userId) { res.status(401).json({ message: 'Unauthorized. Please login first.' }); return; }

    const result = await pool.query(
      `SELECT * FROM email_verification_tokens
       WHERE user_id = $1 AND token = $2 AND used = false AND expires_at > NOW()`,
      [userId, code]
    );
    if (!result.rows[0]) {
      res.status(400).json({ message: 'Invalid or expired 4-digit code. Please request a new one.' });
      return;
    }

    const tokenRow = result.rows[0];

    await pool.query('UPDATE users SET email_verified = true WHERE id = $1', [tokenRow.user_id]);
    await pool.query('UPDATE email_verification_tokens SET used = true WHERE id = $1', [tokenRow.id]);

    // Send welcome email
    const user = await pool.query('SELECT name, email FROM users WHERE id = $1', [tokenRow.user_id]);
    sendWelcomeEmail(user.rows[0].email, user.rows[0].name).catch(console.error);

    res.json({ message: 'Email verified successfully! Your account is now active.' });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed' });
  }
};

// ── Resend verification ───────────────────────────────────────────────────────
export const resendVerification: RequestHandler = async (req, res) => {
  try {
    const { email, method } = req.body; // method can be 'email' or 'sms'
    
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];
    if (!user) { res.json({ message: 'If this email exists, a verification code has been sent.' }); return; }
    if (user.email_verified) { res.status(400).json({ message: 'Email is already verified.' }); return; }

    // Invalidate old tokens
    await pool.query('UPDATE email_verification_tokens SET used = true WHERE user_id = $1', [user.id]);

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    await pool.query(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [user.id, code]
    );

    if (method === 'sms') {
      if (!user.phone) {
        res.status(400).json({ message: 'No phone number associated with this account.' });
        return;
      }
      try {
        const { sendSms } = await import('../services/smsService');
        await sendSms(user.phone, `Your Studio Arella verification code is: ${code}`);
        res.json({ message: 'Verification code sent to your phone via SMS' });
      } catch (err: any) {
        console.error('❌ Failed to send SMS:', err.message);
        res.status(500).json({ message: `SMS Error: ${err.message}` });
      }
    } else {
      try {
        await sendVerificationEmail(email, user.first_name, code);
        res.json({ message: 'Verification code sent to your email' });
      } catch (emailErr: any) {
        console.error('❌ Failed to resend verification email:', emailErr.message);
        res.status(500).json({ message: `Failed to send email: ${emailErr.message}. Please contact support if this persists.` });
      }
    }
  } catch (err: any) {
    console.error('Server error in resendVerification:', err);
    res.status(500).json({ message: err.message || err.toString() || 'Server error' });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ message: 'Email and password are required' }); return; }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) { res.status(401).json({ message: 'Incorrect email or password' }); return; }

    if (user.suspended) {
      res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
      return;
    }
    if (!user.password) {
      res.status(401).json({ message: 'This account uses Google sign-in. Please use "Continue with Google".' });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) { res.status(401).json({ message: 'Incorrect email or password' }); return; }

    if (user.two_factor_enabled) {
      // Short-lived, session-less token — proves the password step already
      // passed, without granting API access until the TOTP step also passes.
      const pendingToken = jwt.sign(
        { id: user.id, type: 'pending_2fa' },
        process.env.JWT_SECRET as string,
        { expiresIn: '5m' }
      );
      res.json({ requires_2fa: true, pending_token: pendingToken });
      return;
    }

    const token = await issueSessionToken({ id: user.id, email: user.email, role: user.role, name: user.name }, req);
    const { password: _, two_factor_secret: __, two_factor_last_code: ___, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
};

// ── Get current user ──────────────────────────────────────────────────────────
export const getMe: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const result = await pool.query(
      `SELECT id, name, first_name, last_name, email, role, credits, business_name, phone, logo_url,
              avatar, email_verified, suspended, language, terms_accepted, has_seen_tour, created_at,
              handle, location, bio, two_factor_enabled, notification_preferences,
              display_currency, display_timezone, sound_enabled
       FROM users WHERE id = $1`,
      [authReq.user?.id]
    );
    if (!result.rows[0]) { res.status(404).json({ message: 'User not found' }); return; }
    
    const user = result.rows[0];

    // If has_seen_tour is false/null, check if user has any existing activity.
    // Existing users (with bookings or created before the column existed) should
    // not see the tour — automatically mark them as seen.
    if (!user.has_seen_tour) {
      const bookingCheck = await pool.query(
        `SELECT 1 FROM bookings WHERE user_id = $1
         UNION ALL
         SELECT 1 FROM podcast_bookings WHERE user_id = $1
         LIMIT 1`,
        [user.id]
      );
      if (bookingCheck.rows.length > 0) {
        // Active user — silently mark tour as seen
        await pool.query('UPDATE users SET has_seen_tour = true WHERE id = $1', [user.id]);
        user.has_seen_tour = true;
      }
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


// ── Update profile ────────────────────────────────────────────────────────────
export const updateProfile: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { name, first_name, last_name, business_name, phone, language, logo_url, handle, location, bio } = req.body;
    const fullName = first_name && last_name ? `${first_name.trim()} ${last_name.trim()}` : name;
    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           business_name = COALESCE($4, business_name),
           phone = COALESCE($5, phone),
           language = COALESCE($6, language),
           logo_url = COALESCE($7, logo_url),
           handle = COALESCE($8, handle),
           location = COALESCE($9, location),
           bio = COALESCE($10, bio)
       WHERE id = $11
       RETURNING id, name, first_name, last_name, email, role, credits, business_name, phone, logo_url, language, handle, location, bio`,
      [fullName, first_name, last_name, business_name, phone, language, logo_url, handle, location, bio, authReq.user?.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
};

// ── Upload profile photo ────────────────────────────────────────────────────
export const uploadAvatar: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) { res.status(400).json({ message: 'No image file provided' }); return; }

    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `studio-arella/avatars/${authReq.user?.id}`, resource_type: 'image' },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      const readable = new Readable();
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(stream);
    });

    const result = await pool.query(
      'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING id, name, first_name, last_name, email, role, credits, business_name, phone, logo_url, language, avatar',
      [uploadResult.secure_url, authReq.user?.id]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ message: 'Could not upload photo. Please try again.' });
  }
};

// ── Change Password ───────────────────────────────────────────────────────────
export const changePassword: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current password and new password are required' });
      return;
    }
    
    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters long' });
      return;
    }
    
    const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [authReq.user?.id]);
    const user = userResult.rows[0];
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    if (!user.password) {
      res.status(400).json({ message: 'This account uses Google sign-in. You cannot change the password.' });
      return;
    }
    
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      res.status(401).json({ message: 'Incorrect current password' });
      return;
    }
    
    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, authReq.user?.id]);
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to change password' });
  }
};

// ── Delete Account ─────────────────────────────────────────────────────────────
// Soft-deletes (suspends the account, same gate the login flow already checks)
// rather than hard-deleting — bookings/transactions must survive for financial
// record-keeping even after a user closes their account.
export const deleteAccount: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { password } = req.body;
    if (!password) {
      res.status(400).json({ message: 'Please enter your password to confirm account deletion' });
      return;
    }

    const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [authReq.user?.id]);
    const user = userResult.rows[0];
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }

    if (user.password) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) { res.status(401).json({ message: 'Incorrect password' }); return; }
    }

    await pool.query('UPDATE users SET suspended = true, deleted_at = NOW() WHERE id = $1', [authReq.user?.id]);
    // Revoke every live session outright — otherwise a token issued before
    // deletion keeps working for its full remaining lifetime (authenticate's
    // suspended check is a backstop, this makes the account's own "Active
    // Sessions" list honest immediately).
    await pool.query('UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [authReq.user?.id]);
    res.json({ message: 'Your account has been deleted.' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ message: 'Failed to delete account' });
  }
};

// ── Become a Screen Owner ───────────────────────────────────────────────────────
// One-way upgrade from 'advertiser' — unlocks self-service screen listing
// (POST/PUT/DELETE /screens scoped to screens they own) without taking away
// any existing advertiser capability, since every other permission check in
// this app is a deny-list on 'admin', not an allow-list on 'advertiser'.
export const becomeScreenOwner: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const userResult = await pool.query('SELECT id, email, name, role FROM users WHERE id = $1', [authReq.user?.id]);
    const user = userResult.rows[0];
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    if (user.role === 'admin') { res.status(400).json({ message: 'Admin accounts already manage all screens.' }); return; }
    if (user.role === 'screen_owner') { res.json({ message: 'You are already a screen owner.', role: 'screen_owner' }); return; }

    await pool.query(`UPDATE users SET role = 'screen_owner' WHERE id = $1`, [authReq.user?.id]);
    // The JWT embeds role at issue time and is never re-checked against the
    // DB per-request (see middleware/auth.ts), so the client's existing
    // token would keep failing every screen-management call as the old role
    // until it expires — issue a fresh one now instead. Reusing the current
    // jti (when present) keeps this as the same session rather than adding
    // a phantom extra "device" to the Active Sessions list.
    const token = await issueSessionToken(
      { id: user.id, email: user.email, role: 'screen_owner', name: user.name },
      req,
      authReq.user?.jti
    );
    res.json({ message: 'You can now list and manage your own screens!', role: 'screen_owner', token });
  } catch (err) {
    console.error('Become screen owner error:', err);
    res.status(500).json({ message: 'Could not complete upgrade. Please try again.' });
  }
};

// ── Accept Terms ──────────────────────────────────────────────────────────────
export const acceptTerms: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const result = await pool.query(
      `UPDATE users SET terms_accepted = true WHERE id = $1 RETURNING id, terms_accepted`,
      [authReq.user?.id]
    );
    res.json({ message: 'Terms accepted', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to accept terms' });
  }
};

// ── Mark Tour Seen ────────────────────────────────────────────────────────────
export const markTourSeen: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const result = await pool.query(
      `UPDATE users SET has_seen_tour = true WHERE id = $1 RETURNING id, has_seen_tour`,
      [authReq.user?.id]
    );
    res.json({ message: 'Tour marked as seen', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark tour as seen' });
  }
};

// ── Forgot password ───────────────────────────────────────────────────────────
export const forgotPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    // Always return success to prevent email enumeration
    res.json({ message: 'If this email is registered, a password reset link has been sent.' });

    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!user.rows[0]) return;

    // Invalidate old tokens
    await pool.query('UPDATE password_reset_tokens SET used = true WHERE user_id = $1', [user.rows[0].id]);

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
      [user.rows[0].id, code]
    );
    sendPasswordResetEmail(email, user.rows[0].name, code).catch(console.error);
  } catch (err) {
    console.error('Forgot password error:', err);
  }
};

// ── Reset password ────────────────────────────────────────────────────────────
// Per-token attempt lockout below is defense in depth alongside the IP-based
// otpGuessLimiter on this route — the limiter alone can be bypassed by an
// attacker spread across many IPs, but a lockout tied to the token itself
// can't be, since it caps guesses against that one code regardless of source.
const MAX_RESET_ATTEMPTS = 5;

export const resetPassword: RequestHandler = async (req, res) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password) { res.status(400).json({ message: 'Email, code, and password are required' }); return; }
    if (password.length < 6) { res.status(400).json({ message: 'Password must be at least 6 characters' }); return; }

    // The current active (unused, unexpired) reset token for this email, if any.
    const activeToken = await pool.query(
      `SELECT t.* FROM password_reset_tokens t
       JOIN users u ON u.id = t.user_id
       WHERE u.email = $1 AND t.used = false AND t.expires_at > NOW()
       ORDER BY t.created_at DESC LIMIT 1`,
      [email]
    );
    const tokenRow = activeToken.rows[0];

    if (tokenRow && tokenRow.attempts >= MAX_RESET_ATTEMPTS) {
      await pool.query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [tokenRow.id]);
      res.status(429).json({ message: 'Too many incorrect attempts. Please request a new reset code.' });
      return;
    }

    if (!tokenRow || tokenRow.token !== code) {
      if (tokenRow) {
        await pool.query('UPDATE password_reset_tokens SET attempts = attempts + 1 WHERE id = $1', [tokenRow.id]);
      }
      res.status(400).json({ message: 'Invalid or expired reset code. Please request a new one.' });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, tokenRow.user_id]);
    await pool.query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [tokenRow.id]);
    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    res.status(500).json({ message: 'Reset failed' });
  }
};

// ── Two-Factor Auth (TOTP) ──────────────────────────────────────────────────────
// Real, standard authenticator-app based 2FA (Google Authenticator, Authy,
// etc.) — no SMS cost, works offline. The secret is stored as soon as setup
// starts but two_factor_enabled only flips true after the user proves they
// actually scanned it by submitting one real code, so a setup a user never
// finishes can't accidentally lock them out.
export const setup2FA: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { password } = req.body;
    if (!password) { res.status(400).json({ message: 'Enter your password to confirm' }); return; }

    const userRes = await pool.query('SELECT email, password FROM users WHERE id = $1', [authReq.user?.id]);
    const user = userRes.rows[0];
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    // A stolen/leaked bearer token alone must not be enough to plant a new
    // 2FA device on someone else's account — require the password step-up,
    // same as disabling 2FA already does.
    if (!user.password || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Incorrect password' });
      return;
    }

    const secret = speakeasy.generateSecret({ name: `Studio Arella (${user.email})` });
    await pool.query('UPDATE users SET two_factor_secret = $1 WHERE id = $2', [secret.base32, authReq.user?.id]);

    const qrCode = await QRCode.toDataURL(secret.otpauth_url as string);
    res.json({ qr_code: qrCode, manual_key: secret.base32 });
  } catch (err) {
    console.error('2FA setup error:', err);
    res.status(500).json({ message: 'Could not start 2FA setup. Please try again.' });
  }
};

export const verifySetup2FA: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { code } = req.body;
    if (!code) { res.status(400).json({ message: 'Enter the 6-digit code from your authenticator app' }); return; }

    const userRes = await pool.query('SELECT two_factor_secret, two_factor_last_code FROM users WHERE id = $1', [authReq.user?.id]);
    const secret = userRes.rows[0]?.two_factor_secret;
    if (!secret) { res.status(400).json({ message: 'Start 2FA setup first' }); return; }

    // A captured code stays valid for its ~90s window (window: 1) — reject
    // an immediate repeat of the exact same code so a leaked/observed code
    // can't be replayed.
    if (code === userRes.rows[0]?.two_factor_last_code) {
      res.status(400).json({ message: 'That code was already used. Wait for a new one.' });
      return;
    }

    const valid = speakeasy.totp.verify({ secret, encoding: 'base32', token: code, window: 1 });
    if (!valid) { res.status(400).json({ message: 'Incorrect code. Please try again.' }); return; }

    await pool.query('UPDATE users SET two_factor_enabled = true, two_factor_last_code = $2 WHERE id = $1', [authReq.user?.id, code]);
    res.json({ message: 'Two-factor authentication enabled!' });
  } catch (err) {
    res.status(500).json({ message: 'Could not verify code. Please try again.' });
  }
};

export const disable2FA: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { password } = req.body;
    if (!password) { res.status(400).json({ message: 'Enter your password to confirm' }); return; }

    const userRes = await pool.query('SELECT password FROM users WHERE id = $1', [authReq.user?.id]);
    const user = userRes.rows[0];
    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Incorrect password' });
      return;
    }

    await pool.query('UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL WHERE id = $1', [authReq.user?.id]);
    res.json({ message: 'Two-factor authentication disabled.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not disable 2FA. Please try again.' });
  }
};

// Completes login for an account with 2FA enabled — exchanges the short-lived
// pending_token (proof the password step passed) plus a real TOTP code for
// an actual session token.
export const verify2FALogin: RequestHandler = async (req, res) => {
  try {
    const { pending_token, code } = req.body;
    if (!pending_token || !code) { res.status(400).json({ message: 'Missing verification code' }); return; }

    let decoded: { id: string; type: string };
    try {
      decoded = jwt.verify(pending_token, process.env.JWT_SECRET as string) as any;
    } catch {
      res.status(401).json({ message: 'Your session expired. Please sign in again.' });
      return;
    }
    if (decoded.type !== 'pending_2fa') { res.status(401).json({ message: 'Invalid verification session' }); return; }

    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = userRes.rows[0];
    if (!user?.two_factor_secret) { res.status(400).json({ message: '2FA is not set up on this account' }); return; }

    if (code === user.two_factor_last_code) {
      res.status(400).json({ message: 'That code was already used. Wait for a new one.' });
      return;
    }

    const valid = speakeasy.totp.verify({ secret: user.two_factor_secret, encoding: 'base32', token: code, window: 1 });
    if (!valid) { res.status(400).json({ message: 'Incorrect code' }); return; }

    await pool.query('UPDATE users SET two_factor_last_code = $2 WHERE id = $1', [user.id, code]);
    const token = await issueSessionToken({ id: user.id, email: user.email, role: user.role, name: user.name }, req);
    const { password: _, two_factor_secret: __, two_factor_last_code: ___, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
};

// ── Active Sessions ──────────────────────────────────────────────────────────────
export const getSessions: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const result = await pool.query(
      `SELECT id, jti, user_agent, ip_address, created_at, last_active_at
       FROM sessions WHERE user_id = $1 AND revoked_at IS NULL
       ORDER BY last_active_at DESC`,
      [authReq.user?.id]
    );
    const sessions = result.rows.map((s) => ({
      id: s.id,
      device: describeUserAgent(s.user_agent),
      ip_address: s.ip_address,
      created_at: s.created_at,
      last_active_at: s.last_active_at,
      is_current: s.jti === authReq.user?.jti,
    }));
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const revokeSession: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const result = await pool.query(
      'UPDATE sessions SET revoked_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, authReq.user?.id]
    );
    if (!result.rows[0]) { res.status(404).json({ message: 'Session not found' }); return; }
    res.json({ message: 'Session revoked' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Notification Preferences ────────────────────────────────────────────────────
export const updateNotificationPreferences: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const prefs = req.body;
    if (!prefs || typeof prefs !== 'object') { res.status(400).json({ message: 'Invalid preferences' }); return; }

    const result = await pool.query(
      `UPDATE users SET notification_preferences = COALESCE(notification_preferences, '{}'::jsonb) || $1::jsonb
       WHERE id = $2 RETURNING notification_preferences`,
      [JSON.stringify(prefs), authReq.user?.id]
    );
    res.json({ notification_preferences: result.rows[0].notification_preferences });
  } catch (err) {
    res.status(500).json({ message: 'Could not save preferences' });
  }
};

const SUPPORTED_CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR'];
// A generous but real IANA timezone list — not exhaustive, but covers the
// regions this platform's advertisers actually operate from.
const SUPPORTED_TIMEZONES = new Set([
  'Africa/Lagos', 'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Nairobi',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'America/Toronto',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Singapore',
  'Australia/Sydney', 'UTC',
]);

// Currency and timezone are presentation-only — every real charge, booking,
// and stored timestamp stays in NGN / UTC underneath regardless of this
// preference. This only changes what's displayed back to the user.
export const updateDisplayPreferences: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { currency, timezone, sound_enabled } = req.body;
    if (currency !== undefined && !SUPPORTED_CURRENCIES.includes(currency)) {
      res.status(400).json({ message: `Unsupported currency. Choose one of: ${SUPPORTED_CURRENCIES.join(', ')}` });
      return;
    }
    if (timezone !== undefined && !SUPPORTED_TIMEZONES.has(timezone)) {
      res.status(400).json({ message: 'Unsupported timezone' });
      return;
    }
    const result = await pool.query(
      `UPDATE users SET
         display_currency = COALESCE($1, display_currency),
         display_timezone = COALESCE($2, display_timezone),
         sound_enabled = COALESCE($3, sound_enabled)
       WHERE id = $4
       RETURNING display_currency, display_timezone, sound_enabled`,
      [currency ?? null, timezone ?? null, typeof sound_enabled === 'boolean' ? sound_enabled : null, authReq.user?.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Could not save preferences' });
  }
};
