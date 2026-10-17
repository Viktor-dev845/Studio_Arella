import { Request, Response } from 'express';
import pool from '../db/pool';

// ── GET CREATOR MEMBERSHIP PLANS ──────────────────────────────────────────────
export async function getMembershipPlans(req: Request, res: Response) {
  try {
    const creatorId = req.params.creatorId;

    const { rows } = await pool.query(
      `SELECT * FROM creator_membership_plans 
       WHERE (creator_id = $1 OR $1 IS NULL) AND active = true
       ORDER BY price ASC`,
      [creatorId || null]
    );

    return res.json({ plans: rows });
  } catch (error: any) {
    console.error('getMembershipPlans error:', error);
    return res.status(500).json({ error: 'Failed to fetch membership plans' });
  }
}

// ── SUBSCRIBE TO CREATOR MEMBERSHIP ───────────────────────────────────────────
export async function subscribeMembership(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    const fanId = (req as any).user.id;
    const { creator_id, plan_id, payment_reference } = req.body;

    if (!creator_id) {
      return res.status(400).json({ error: 'Creator ID is required' });
    }

    await client.query('BEGIN');

    // 1. Get plan details or default to 1,000 NGN
    let amount = 1000.00;
    let planId = plan_id;

    if (planId) {
      const planRes = await client.query('SELECT * FROM creator_membership_plans WHERE id = $1', [planId]);
      if (planRes.rows.length > 0) {
        amount = parseFloat(planRes.rows[0].price);
      }
    } else {
      const defaultPlan = await client.query(
        'SELECT id, price FROM creator_membership_plans WHERE creator_id = $1 LIMIT 1',
        [creator_id]
      );
      if (defaultPlan.rows.length > 0) {
        planId = defaultPlan.rows[0].id;
        amount = parseFloat(defaultPlan.rows[0].price);
      }
    }

    // 85% creator share, 15% platform fee
    const creatorShare = amount * 0.85;
    const platformFee = amount * 0.15;

    // 2. Insert subscription record
    const subRes = await client.query(
      `INSERT INTO fan_subscriptions (
        fan_id, creator_id, plan_id, amount, creator_share, platform_fee, status, payment_reference
      ) VALUES ($1, $2, $3, $4, $5, $6, 'active', $7)
      RETURNING *`,
      [fanId, creator_id, planId, amount, creatorShare, platformFee, payment_reference || `sub-${Date.now()}`]
    );

    // 3. Credit Creator Wallet & Ledger
    await client.query(
      `INSERT INTO creator_wallets (creator_id, available_balance, total_earned)
       VALUES ($1, $2, $2)
       ON CONFLICT (creator_id) DO UPDATE SET 
         available_balance = creator_wallets.available_balance + EXCLUDED.available_balance,
         total_earned = creator_wallets.total_earned + EXCLUDED.total_earned`,
      [creator_id, creatorShare]
    );

    await client.query(
      `INSERT INTO creator_earnings_ledger (
        creator_id, source_type, source_id, gross_amount, platform_fee, net_amount, status, description
      ) VALUES ($1, 'membership', $2, $3, $4, $5, 'available', 'Fan monthly community membership')`,
      [creator_id, subRes.rows[0].id, amount, platformFee, creatorShare]
    );

    // 4. Send Notification to creator
    await client.query(
      `INSERT INTO notifications (user_id, type, title, body)
       VALUES ($1, 'new_membership', 'New Fan Member', 'A new community member has subscribed to your channel!')`,
      [creator_id]
    );

    await client.query('COMMIT');
    return res.status(201).json({ message: 'Subscribed successfully', subscription: subRes.rows[0] });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('subscribeMembership error:', error);
    return res.status(500).json({ error: 'Failed to process subscription' });
  } finally {
    client.release();
  }
}

// ── GET USER ACTIVE SUBSCRIPTIONS ─────────────────────────────────────────────
export async function getMySubscriptions(req: Request, res: Response) {
  try {
    const fanId = (req as any).user.id;

    const { rows } = await pool.query(
      `SELECT 
        s.id,
        s.amount,
        s.status,
        s.start_date,
        s.renews_at,
        s.cancelled_at,
        u.id AS creator_id,
        u.name AS creator_name,
        COALESCE(u.avatar, '/audience/adam-udochi.png') AS creator_avatar,
        COALESCE(u.creator_niche, 'Creative Producer') AS creator_role,
        p.name AS plan_name
      FROM fan_subscriptions s
      JOIN users u ON s.creator_id = u.id
      LEFT JOIN creator_membership_plans p ON s.plan_id = p.id
      WHERE s.fan_id = $1
      ORDER BY s.created_at DESC`,
      [fanId]
    );

    return res.json({ subscriptions: rows });
  } catch (error: any) {
    console.error('getMySubscriptions error:', error);
    return res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
}

// ── CANCEL SUBSCRIPTION ───────────────────────────────────────────────────────
export async function cancelSubscription(req: Request, res: Response) {
  try {
    const fanId = (req as any).user.id;
    const subscriptionId = req.params.id;

    const { rows } = await pool.query(
      `UPDATE fan_subscriptions 
       SET status = 'cancelled', cancelled_at = NOW()
       WHERE id = $1 AND fan_id = $2
       RETURNING *`,
      [subscriptionId, fanId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found or already cancelled' });
    }

    return res.json({ message: 'Subscription cancelled successfully', subscription: rows[0] });
  } catch (error: any) {
    console.error('cancelSubscription error:', error);
    return res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}

// ── GET CREATOR'S SUBSCRIBERS ─────────────────────────────────────────────────
export async function getCreatorMembers(req: Request, res: Response) {
  try {
    const creatorId = (req as any).user.id;

    const { rows } = await pool.query(
      `SELECT 
        s.id,
        s.amount,
        s.status,
        s.start_date,
        u.id AS fan_id,
        u.name AS fan_name,
        COALESCE(u.avatar, '/audience/adam-udochi.png') AS fan_avatar
      FROM fan_subscriptions s
      JOIN users u ON s.fan_id = u.id
      WHERE s.creator_id = $1 AND s.status = 'active'
      ORDER BY s.start_date DESC`,
      [creatorId]
    );

    const mrr = rows.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

    return res.json({ members: rows, count: rows.length, mrr });
  } catch (error: any) {
    console.error('getCreatorMembers error:', error);
    return res.status(500).json({ error: 'Failed to fetch creator members' });
  }
}
