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
      // In development fallback, return all user cards or find primary user
      const primaryUser = await pool.query('SELECT id FROM users LIMIT 1');
      if (primaryUser.rows.length === 0) {
        return NextResponse.json({ cards: [] });
      }
      const res = await pool.query(
        `SELECT id, card_type, last4, exp_month, exp_year, bank, cardholder_name, is_default, created_at
         FROM saved_cards WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
        [primaryUser.rows[0].id]
      );
      return NextResponse.json({ cards: res.rows });
    }

    const res = await pool.query(
      `SELECT id, card_type, last4, exp_month, exp_year, bank, cardholder_name, is_default, created_at
       FROM saved_cards WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    return NextResponse.json({ success: true, cards: res.rows });
  } catch (error: any) {
    console.error('Error fetching saved cards:', error);
    return NextResponse.json({ error: 'Failed to fetch saved cards', cards: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authUserId = getUserIdFromRequest(request);
    const userId = body.userId || authUserId;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const {
      cardNumber,
      cardholderName,
      expiry,
      bank,
      cardType = 'Mastercard'
    } = body;

    const cleanNumber = String(cardNumber || '').replace(/\s+/g, '');
    const last4 = cleanNumber ? cleanNumber.slice(-4) : (body.last4 || '4242');
    
    let expMonth = '12';
    let expYear = '2028';
    if (expiry && String(expiry).includes('/')) {
      const [m, y] = String(expiry).split('/');
      expMonth = m.trim().padStart(2, '0');
      expYear = y.trim().length === 2 ? `20${y.trim()}` : y.trim();
    } else if (body.exp_month && body.exp_year) {
      expMonth = String(body.exp_month);
      expYear = String(body.exp_year);
    }

    const authCode = `AUTH_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const res = await pool.query(
      `INSERT INTO saved_cards (
         id, user_id, authorization_code, card_type, last4, exp_month, exp_year, bank, cardholder_name, is_default, created_at
       ) VALUES (
         gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, true, NOW()
       )
       ON CONFLICT (user_id, authorization_code) DO NOTHING
       RETURNING id, card_type, last4, exp_month, exp_year, bank, cardholder_name, is_default, created_at`,
      [
        userId,
        authCode,
        cardType,
        last4,
        expMonth,
        expYear,
        bank || 'Access Bank',
        cardholderName || 'Cardholder'
      ]
    );

    // Record notification
    try {
      await pool.query(
        `INSERT INTO notifications (id, user_id, type, title, body, link, read, created_at)
         VALUES (gen_random_uuid(), $1, 'payment_received', 'Bank Card Linked', $2, '/settings?tab=billing', false, NOW())`,
        [userId, `Your ${cardType} ending in •••• ${last4} was successfully linked for payments & subscriptions.`]
      );
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: 'Card linked successfully',
      card: res.rows[0]
    });
  } catch (error: any) {
    console.error('Error saving bank card:', error);
    return NextResponse.json({ error: 'Failed to save card', details: error.message }, { status: 500 });
  }
}
