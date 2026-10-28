import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { creator_id, content_id, amount, message, userId } = body;

    if (!creator_id) {
      return NextResponse.json({ error: 'creator_id is required' }, { status: 400 });
    }

    const tipAmount = parseFloat(amount);
    if (isNaN(tipAmount) || tipAmount <= 0) {
      return NextResponse.json({ error: 'A valid tip amount is required' }, { status: 400 });
    }

    if (userId && userId === creator_id) {
      return NextResponse.json({ error: 'You cannot tip your own content' }, { status: 400 });
    }

    const creatorShare = Number((tipAmount * 0.85).toFixed(2));
    const platformFee = Number((tipAmount * 0.15).toFixed(2));

    await client.query('BEGIN');

    // 1. Record in creator_tips
    const tipRes = await client.query(
      `INSERT INTO creator_tips (
         fan_id, creator_id, content_id, amount, creator_share, platform_fee, message, payment_reference, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed')
       RETURNING *`,
      [userId || null, creator_id, content_id || null, tipAmount, creatorShare, platformFee, message || null, `TIP-${Date.now()}`]
    );

    const tipRecord = tipRes.rows[0];

    // 2. Record in creator_earnings_ledger
    await client.query(
      `INSERT INTO creator_earnings_ledger (
         creator_id, source_type, source_id, gross_amount, platform_fee, net_amount, status, description
       ) VALUES ($1, 'tip', $2, $3, $4, $5, 'available', $6)`,
      [
        creator_id,
        tipRecord.id,
        tipAmount,
        platformFee,
        creatorShare,
        `Fan tip received: ₦${tipAmount.toLocaleString()}${message ? ` - "${message}"` : ''}`
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

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      tip: tipRecord,
      creatorShare,
      platformFee
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Tip error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process tip' }, { status: 500 });
  } finally {
    client.release();
  }
}
