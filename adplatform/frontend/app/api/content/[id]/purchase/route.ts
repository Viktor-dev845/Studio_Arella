import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();
  try {
    const { id: contentId } = await params;
    const body = await request.json().catch(() => ({}));
    const fanId = body.userId;

    await client.query('BEGIN');

    const contentRes = await client.query('SELECT * FROM creator_content WHERE id = $1', [contentId]);
    if (contentRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const content = contentRes.rows[0];
    const price = parseFloat(content.price || 0);
    const creatorId = content.creator_id;

    if (creatorId && fanId && creatorId === fanId) {
      await client.query('ROLLBACK');
      return NextResponse.json({ message: 'You own this content', unlocked: true });
    }

    if (fanId) {
      const existing = await client.query(
        'SELECT id FROM premium_content_purchases WHERE user_id = $1 AND content_id = $2',
        [fanId, contentId]
      );
      if (existing.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Content already unlocked', unlocked: true });
      }
    }

    const creatorShare = Number((price * 0.85).toFixed(2));
    const platformFee = Number((price * 0.15).toFixed(2));

    await client.query(
      `INSERT INTO premium_content_purchases (
         user_id, content_id, amount, creator_share, platform_fee, payment_reference, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [fanId || null, contentId, price, creatorShare, platformFee, `PREM-${Date.now()}`]
    );

    if (creatorId) {
      await client.query(
        `INSERT INTO creator_earnings_ledger (
           creator_id, source_type, source_id, gross_amount, platform_fee, net_amount, status, description
         ) VALUES ($1, 'premium_content', $2, $3, $4, $5, 'available', $6)`,
        [
          creatorId,
          contentId,
          price,
          platformFee,
          creatorShare,
          `Premium content unlock: "${content.title}" (₦${price.toLocaleString()})`
        ]
      );

      await client.query(
        `INSERT INTO creator_wallets (
           creator_id, available_balance, total_earned, updated_at
         ) VALUES ($1, $2, $2, NOW())
         ON CONFLICT (creator_id)
         DO UPDATE SET
           available_balance = creator_wallets.available_balance + $2,
           total_earned = creator_wallets.total_earned + $2,
           updated_at = NOW()`,
        [creatorId, creatorShare]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      unlocked: true,
      message: `Unlocked "${content.title}" successfully`
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Purchase error:', error);
    return NextResponse.json({ error: error.message || 'Failed to unlock content' }, { status: 500 });
  } finally {
    client.release();
  }
}
