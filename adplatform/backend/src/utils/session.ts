import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request } from 'express';
import pool from '../db/pool';

// Real, minimal user-agent → device label parsing. Not a full UA-parser
// dependency — just enough to show "Chrome on Windows" / "Safari on iPhone"
// in the Active Sessions list, which is all the UI needs.
export function describeUserAgent(ua: string | undefined): string {
  if (!ua) return 'Unknown device';
  const browser =
    /Edg\//.test(ua) ? 'Edge' :
    /OPR\//.test(ua) ? 'Opera' :
    /Chrome\//.test(ua) ? 'Chrome' :
    /Firefox\//.test(ua) ? 'Firefox' :
    /Safari\//.test(ua) ? 'Safari' : 'a browser';
  const os =
    /Windows/.test(ua) ? 'Windows' :
    /Mac OS X/.test(ua) ? 'macOS' :
    /iPhone|iPad/.test(ua) ? 'iOS' :
    /Android/.test(ua) ? 'Android' :
    /Linux/.test(ua) ? 'Linux' : 'an unknown OS';
  return `${browser} on ${os}`;
}

function getClientIp(req: Request): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Signs a JWT for a real login/session. When `reuseJti` is given (e.g. the
 * caller already has a valid session and is only re-issuing the token, such
 * as after a role change), the existing session row is kept as-is instead of
 * creating a duplicate "device" entry.
 */
export async function issueSessionToken(
  payload: { id: string; email: string; role: string; name: string },
  req: Request,
  reuseJti?: string
): Promise<string> {
  const jti = reuseJti || crypto.randomUUID();
  const token = jwt.sign({ ...payload, jti }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);

  if (!reuseJti) {
    await pool.query(
      `INSERT INTO sessions (user_id, jti, user_agent, ip_address) VALUES ($1, $2, $3, $4)`,
      [payload.id, jti, req.headers['user-agent'] || null, getClientIp(req)]
    );
  }

  return token;
}
