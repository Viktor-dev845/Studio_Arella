import { Request, Response, NextFunction, RequestHandler } from 'express';
import pool from '../db/pool';
import { AuthRequest } from '../middleware/auth';

export const getCampaigns : RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // "spent" is computed from real paid bookings, not the campaigns.spent
    // column — nothing anywhere ever writes to that column, so it would
    // otherwise always read 0 regardless of real activity. Uses a scalar
    // subquery rather than another LEFT JOIN alongside bookings/ads so the
    // sum isn't multiplied by the unrelated join's row count.
    let query = `SELECT c.*,
      COUNT(DISTINCT b.id) as booking_count,
      COUNT(DISTINCT a.id) as ad_count,
      COALESCE((SELECT SUM(b2.total_cost) FROM bookings b2 WHERE b2.campaign_id = c.id AND b2.status IN ('active','ended','completed')), 0) as spent
      FROM campaigns c
      LEFT JOIN bookings b ON b.campaign_id = c.id
      LEFT JOIN ads a ON a.campaign_id = c.id
      WHERE c.user_id = $1`;
    const params: any[] = [authReq.user?.id];

    if (status) {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }

    query += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM campaigns WHERE user_id = $1${status ? ' AND status = $2' : ''}`,
      status ? [authReq.user?.id, status] : [authReq.user?.id]
    );

    res.json({
      campaigns: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCampaign : RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
  try {
    const result = await pool.query(
      `SELECT c.*, COUNT(DISTINCT b.id) as booking_count, COUNT(DISTINCT a.id) as ad_count,
       COALESCE((SELECT SUM(b2.total_cost) FROM bookings b2 WHERE b2.campaign_id = c.id AND b2.status IN ('active','ended','completed')), 0) as spent
       FROM campaigns c
       LEFT JOIN bookings b ON b.campaign_id = c.id
       LEFT JOIN ads a ON a.campaign_id = c.id
       WHERE c.id = $1 AND c.user_id = $2
       GROUP BY c.id`,
      [req.params.id, authReq.user?.id]
    );
    if (!result.rows[0]) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCampaign : RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
  try {
    const { name, description, budget, start_date, end_date } = req.body;
    const result = await pool.query(
      `INSERT INTO campaigns (user_id, name, description, budget, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [authReq.user?.id, name, description || null, budget, start_date, end_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Fund a campaign's budget from the wallet (real money, drawn down later ──
// by real bookings made against this campaign_id) ────────────────────────────
export const fundCampaignWallet: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const campRes = await client.query(
      'SELECT * FROM campaigns WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [req.params.id, authReq.user?.id]
    );
    if (!campRes.rows[0]) {
      await client.query('ROLLBACK');
      res.status(404).json({ message: 'Campaign not found' }); return;
    }
    const campaign = campRes.rows[0];
    if (Number(campaign.paid_budget) > 0) {
      await client.query('ROLLBACK');
      res.status(400).json({ message: 'This campaign has already been funded.' }); return;
    }
    const amount = Number(campaign.budget);
    if (!(amount > 0)) {
      await client.query('ROLLBACK');
      res.status(400).json({ message: 'Set a budget before funding this campaign.' }); return;
    }

    const userRes = await client.query('SELECT credits FROM users WHERE id = $1 FOR UPDATE', [authReq.user?.id]);
    const credits = parseFloat(userRes.rows[0].credits);
    if (credits < amount) {
      await client.query('ROLLBACK');
      res.status(400).json({ message: 'Insufficient wallet balance' }); return;
    }

    await client.query('UPDATE users SET credits = credits - $1 WHERE id = $2', [amount, authReq.user?.id]);
    await client.query(
      `UPDATE campaigns SET paid_budget = paid_budget + $1, status = 'active', updated_at = NOW() WHERE id = $2`,
      [amount, campaign.id]
    );
    const reference = `CF-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    await client.query(
      `INSERT INTO transactions (user_id, type, source, amount, description, reference)
       VALUES ($1, 'debit', 'campaign_funding', $2, $3, $4)`,
      [authReq.user?.id, amount, `Funded campaign "${campaign.name}"`, reference]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Payment successful and campaign booked' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Fund campaign wallet error:', err);
    res.status(500).json({ message: 'Payment failed. Please try again.' });
  } finally {
    client.release();
  }
};

export const updateCampaign : RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
  try {
    const { name, status, budget, start_date, end_date } = req.body;
    const result = await pool.query(
      `UPDATE campaigns SET
        name = COALESCE($1, name),
        status = COALESCE($2, status),
        budget = COALESCE($3, budget),
        start_date = COALESCE($4, start_date),
        end_date = COALESCE($5, end_date)
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [name, status, budget, start_date, end_date, req.params.id, authReq.user?.id]
    );
    if (!result.rows[0]) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCampaign : RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
  try {
    const result = await pool.query(
      'DELETE FROM campaigns WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, authReq.user?.id]
    );
    if (!result.rows[0]) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
