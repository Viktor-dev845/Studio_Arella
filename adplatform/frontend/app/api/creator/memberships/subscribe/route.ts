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
  const client = await pool.connect();
  try {
    const body = await request.json().catch(() => ({}));
    const fanId = getUserIdFromRequest(request) || body.userId;
    const { creator_id, plan_id, amount = 1000 } = body;

    if (!creator_id) {
      return NextResponse.json({ error: 'creator_id is required' }, { status: 400 });
    }

    if (fanId && fanId === creator_id) {
      return NextResponse.json({ error: 'You cannot subscribe to yourself' }, { status: 400 });
    }

    const subAmount = parseFloat(String(amount)) || 1000;
    const creatorShare = Number((subAmount * 0.85).toFixed(2));
    const platformFee = Number((subAmount * 0.15).toFixed(2));
    const paymentRef = `SUB-${Date.now()}`;

    await client.query('BEGIN');

    // 1. Insert into fan_subscriptions
    const subRes = await client.query(
      `INSERT INTO fan_subscriptions (
         fan_id, creator_id, plan_id, amount, creator_share, platform_fee, status, 
         payment_reference, start_date, renews_at, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, NOW(), NOW() + INTERVAL '30 days', NOW())
       RETURNING *`,
      [fanId || null, creator_id, plan_id || null, subAmount, creatorShare, platformFee, paymentRef]
    );

    const subscription = subRes.rows[0];

    // 2. Record in creator_earnings_ledger
    await client.query(
      `INSERT INTO creator_earnings_ledger (
         creator_id, source_type, source_id, gross_amount, platform_fee, net_amount, status, description
       ) VALUES ($1, 'membership', $2, $3, $4, $5, 'available', $6)`,
      [
        creator_id,
        subscription.id,
        subAmount,
        platformFee,
        creatorShare,
        `Fan monthly membership: ₦${subAmount.toLocaleString()}`
      ]
    );

    // 3. Update creator's wallet
    await client.query(
      `INSERT INTO creator_wallets (
         creator_id, available_balance, total_earned, updated_at
       ) VALUES ($1, $2, $2, NOW())
       ON CONFLICT (creator_id)
       DO UPDATE SET
         available_balance = creator_wallets.available_balance + $2,
         total_earned = creator_wallets.total_earned + $2,
         updated_at = NOW()`,
      [creator_id, creatorShare]
    );

    // 4. Send notification to creator
    await client.query(
      `INSERT INTO notifications (user_id, type, title, body, link, read, created_at)
       VALUES ($1, 'membership', 'New Fan Member!', 'A fan just joined your monthly membership community.', '/finances?tab=creator', false, NOW())`,
      [creator_id]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      subscription,
      creatorShare,
      platformFee,
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Membership subscription error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process subscription' }, { status: 500 });
  } finally {
    client.release();
  }
}
