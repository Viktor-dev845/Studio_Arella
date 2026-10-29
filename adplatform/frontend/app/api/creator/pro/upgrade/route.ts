import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

function getUserIdFromRequest(request: Request): string | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    return payload?.id || payload?.sub || null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = getUserIdFromRequest(request) || body.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { rows } = await pool.query(
      `UPDATE users
       SET 
         creator_tier = 'pro',
         creator_verified = true,
         pro_subscription_expires_at = NOW() + INTERVAL '30 days',
         pro_auto_renew = $2,
         updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, handle, role, creator_tier, creator_verified, pro_subscription_expires_at`,
      [userId, body.auto_renew !== false]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Upgraded to Creator Pro successfully',
      user: rows[0],
    });
  } catch (error: any) {
    console.error('Creator Pro upgrade error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upgrade to Creator Pro' },
      { status: 500 }
    );
  }
}
