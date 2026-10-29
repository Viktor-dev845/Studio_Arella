import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

function getUserIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return payload.id || payload.sub || payload.userId || null;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let walletRes = await pool.query(
      `SELECT id, creator_id, available_balance, pending_balance, total_earned, total_withdrawn, currency,
              bank_name, bank_code, account_number, account_name
       FROM creator_wallets
       WHERE creator_id = $1`,
      [userId]
    );

    if (walletRes.rows.length === 0) {
      // Auto-create wallet row if absent
      walletRes = await pool.query(
        `INSERT INTO creator_wallets (id, creator_id, available_balance, pending_balance, total_earned, total_withdrawn, currency)
         VALUES (gen_random_uuid(), $1, 0.00, 0.00, 0.00, 0.00, 'NGN')
         RETURNING *`,
        [userId]
      );
    }

    return NextResponse.json({
      success: true,
      wallet: walletRes.rows[0],
    });
  } catch (error: any) {
    console.error('Error fetching creator bank details:', error);
    return NextResponse.json({ error: 'Failed to fetch bank details', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const authUserId = getUserIdFromRequest(request);
    const userId = body.userId || authUserId;
    const { bank_name, account_number, account_name, bank_code } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!bank_name || !account_number || !account_name) {
      return NextResponse.json({ error: 'Bank name, 10-digit account number, and account name are required' }, { status: 400 });
    }

    const cleanAcct = String(account_number).trim();
    if (cleanAcct.length < 10) {
      return NextResponse.json({ error: 'Please provide a valid 10-digit account number' }, { status: 400 });
    }

    // Ensure wallet exists and update bank details
    const res = await pool.query(
      `INSERT INTO creator_wallets (id, creator_id, available_balance, pending_balance, total_earned, total_withdrawn, currency, bank_name, bank_code, account_number, account_name, updated_at)
       VALUES (gen_random_uuid(), $1, 0.00, 0.00, 0.00, 0.00, 'NGN', $2, $3, $4, $5, NOW())
       ON CONFLICT (creator_id)
       DO UPDATE SET
         bank_name = EXCLUDED.bank_name,
         bank_code = COALESCE(EXCLUDED.bank_code, creator_wallets.bank_code),
         account_number = EXCLUDED.account_number,
         account_name = EXCLUDED.account_name,
         updated_at = NOW()
       RETURNING *`,
      [userId, bank_name.trim(), bank_code || null, cleanAcct, account_name.trim()]
    );

    // Create an audit notification for the creator
    try {
      const last4 = cleanAcct.slice(-4);
      await pool.query(
        `INSERT INTO notifications (id, user_id, type, title, body, link, read, created_at)
         VALUES (gen_random_uuid(), $1, 'account_update', 'Payout Bank Account Linked', $2, '/finances?tab=creator', false, NOW())`,
        [userId, `Your ${bank_name} account (•••• ${last4}) was linked for creator earnings and escrow payouts.`]
      );
    } catch (notifErr) {
      console.warn('Could not insert notification:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Bank account linked successfully for creator payouts',
      wallet: res.rows[0],
    });
  } catch (error: any) {
    console.error('Error updating creator bank account:', error);
    return NextResponse.json({ error: 'Failed to update bank account', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return PUT(request);
}
