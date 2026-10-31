import { Request, Response, NextFunction, RequestHandler } from 'express';
import pool from '../db/pool';
import { AuthRequest } from '../middleware/auth';

// Guard: admin only — accepts plain Request and casts internally
const adminOnly = (req: Request, res: Response): boolean => {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return false;
  }
  return true;
};

import { createNotification } from '../services/notificationService';

export const getPlatformStats : RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
  if (!adminOnly(req, res)) return;
  try {
    const [
      users,
      campaigns,
      bookings,
      podcastBookings,
      screens,
      revenue,
      podcastRevenue,
      recentUsers,
      pendingAdsRes,
      pendingRequestsRes,
      leadsRes,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM campaigns'),
      pool.query('SELECT COUNT(*) FROM bookings'),
      pool.query('SELECT COUNT(*) FROM podcast_bookings'),
      pool.query('SELECT COUNT(*) FROM screens'),
      pool.query(`SELECT COALESCE(SUM(total_cost),0) as total FROM bookings WHERE status IN ('active','ended','completed')`),
      pool.query(`SELECT COALESCE(SUM(total_cost),0) as total FROM podcast_bookings WHERE status IN ('confirmed','completed')`),
      pool.query(`SELECT id, name, email, role, COALESCE(credits, 0) as credits, created_at FROM users ORDER BY created_at DESC LIMIT 10`),
      pool.query("SELECT COUNT(*) FROM ads WHERE status = 'pending'").catch(() => ({ rows: [{ count: '0' }] })),
      pool.query("SELECT COUNT(*) FROM creative_requests WHERE status = 'pending'").catch(() => ({ rows: [{ count: '0' }] })),
      pool.query("SELECT COUNT(*) FROM ad_leads").catch(() => ({ rows: [{ count: '0' }] })),
    ]);

    res.json({
      users: parseInt(users.rows[0].count),
      campaigns: parseInt(campaigns.rows[0].count),
      bookings: parseInt(bookings.rows[0].count) + parseInt(podcastBookings.rows[0].count),
      screens: parseInt(screens.rows[0].count),
      revenue: parseFloat(revenue.rows[0].total) + parseFloat(podcastRevenue.rows[0].total),
      recent_users: recentUsers.rows,
      pending_ads: parseInt(pendingAdsRes.rows[0].count),
      pending_requests: parseInt(pendingRequestsRes.rows[0].count),
      leads_count: parseInt(leadsRes.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers : RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
  if (!adminOnly(req, res)) return;
  try {
    const { page = 1, limit = 20, role } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let query = `SELECT id, name, email, role, credits, avatar, created_at FROM users`;
    const params: any[] = [];
    if (role) { params.push(role); query += ` WHERE role = $1`; }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);
    const result = await pool.query(query, params);
    const count = await pool.query('SELECT COUNT(*) FROM users');
    res.json({ users: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Combines screen-ad bookings and podcast studio bookings into one list —
// this page presents itself as "all bookings on the platform", so it needs
// to actually include both booking types, not just screen ads.
export const getAllBookings : RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
  if (!adminOnly(req, res)) return;
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const result = await pool.query(
      `SELECT * FROM (
         SELECT b.id, b.booking_number, 'ad' as booking_type, b.total_cost, b.status,
                b.start_time, b.created_at, u.name as user_name, u.email as user_email,
                s.name as screen_name, c.name as campaign_name
         FROM bookings b
         LEFT JOIN users u ON b.user_id = u.id
         LEFT JOIN screens s ON b.screen_id = s.id
         LEFT JOIN campaigns c ON b.campaign_id = c.id
         UNION ALL
         SELECT pb.id, pb.booking_number, 'podcast' as booking_type, pb.total_cost, pb.status,
                pb.start_time, pb.created_at, u.name as user_name, u.email as user_email,
                NULL as screen_name, pb.package_type as campaign_name
         FROM podcast_bookings pb
         LEFT JOIN users u ON pb.user_id = u.id
       ) combined
       ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [Number(limit), offset]
    );
    const count = await pool.query(
      `SELECT (SELECT COUNT(*) FROM bookings) + (SELECT COUNT(*) FROM podcast_bookings) as total`
    );
    res.json({ bookings: result.rows, total: parseInt(count.rows[0].total) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllCampaigns : RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
  if (!adminOnly(req, res)) return;
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const result = await pool.query(
      `SELECT c.*, u.name as user_name, u.email as user_email
       FROM campaigns c
       LEFT JOIN users u ON c.user_id = u.id
       ORDER BY c.created_at DESC LIMIT $1 OFFSET $2`,
      [Number(limit), offset]
    );
    const count = await pool.query('SELECT COUNT(*) FROM campaigns');
    res.json({ campaigns: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllScreens : RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
  if (!adminOnly(req, res)) return;
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const result = await pool.query(
      `SELECT s.*, u.name as owner_name, u.email as owner_email
       FROM screens s
       LEFT JOIN users u ON s.owner_id = u.id
       ORDER BY s.created_at DESC LIMIT $1 OFFSET $2`,
      [Number(limit), offset]
    );
    const count = await pool.query('SELECT COUNT(*) FROM screens');
    res.json({ screens: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserRole : RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
  if (!adminOnly(req, res)) return;
  try {
    const { role } = req.body;
    const validRoles = ['advertiser', 'admin', 'screen_owner'];
    if (!validRoles.includes(role)) { res.status(400).json({ message: 'Invalid role' }); return; }
    const result = await pool.query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role`,
      [role, req.params.id]
    );
    if (!result.rows[0]) { res.status(404).json({ message: 'User not found' }); return; }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllTransactions : RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
  if (!adminOnly(req, res)) return;
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const result = await pool.query(
      `SELECT t.*, u.name as user_name, u.email as user_email
       FROM transactions t
       LEFT JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC LIMIT $1 OFFSET $2`,
      [Number(limit), offset]
    );
    const count = await pool.query('SELECT COUNT(*) FROM transactions');
    res.json({ transactions: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllPodcastBookings : RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  if (!adminOnly(req, res)) return;
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions: string[] = [];
    const params: any[] = [];

    if (status && ['confirmed', 'completed', 'cancelled', 'pending'].includes(String(status).toLowerCase())) {
      params.push(String(status).toLowerCase());
      conditions.push(`pb.status = $${params.length}`);
    }

    if (search && String(search).trim()) {
      params.push(`%${String(search).trim()}%`);
      const pIdx = params.length;
      conditions.push(`(pb.booking_number ILIKE $${pIdx} OR u.name ILIKE $${pIdx} OR u.email ILIKE $${pIdx} OR pb.notes ILIKE $${pIdx})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT pb.*, u.name as user_name, u.email as user_email
      FROM podcast_bookings pb
      LEFT JOIN users u ON pb.user_id = u.id
      ${whereClause}
      ORDER BY pb.start_time DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const result = await pool.query(query, [...params, Number(limit), offset]);

    const countQuery = `
      SELECT COUNT(*) 
      FROM podcast_bookings pb
      LEFT JOIN users u ON pb.user_id = u.id
      ${whereClause}
    `;
    const countRes = await pool.query(countQuery, params);

    const countsRes = await pool.query(
      `SELECT
         COUNT(*) as all_count,
         COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
         COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
         COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
         COUNT(*) FILTER (WHERE status = 'pending') as pending_count
       FROM podcast_bookings`
    );

    const counts = {
      all: parseInt(countsRes.rows[0]?.all_count || '0'),
      confirmed: parseInt(countsRes.rows[0]?.confirmed_count || '0'),
      completed: parseInt(countsRes.rows[0]?.completed_count || '0'),
      cancelled: parseInt(countsRes.rows[0]?.cancelled_count || '0'),
      pending: parseInt(countsRes.rows[0]?.pending_count || '0'),
    };

    res.json({
      bookings: result.rows,
      total: parseInt(countRes.rows[0]?.count || '0'),
      counts
    });
  } catch (err) {
    console.error('getAllPodcastBookings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updatePodcastBookingStatus: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  if (!adminOnly(req, res)) return;
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status, reason, notes, refund = false } = req.body;

    if (!['confirmed', 'completed', 'cancelled', 'in_progress'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    await client.query('BEGIN');

    const bookingRes = await client.query(
      `SELECT pb.*, u.name as user_name, u.email as user_email, u.credits
       FROM podcast_bookings pb
       LEFT JOIN users u ON pb.user_id = u.id
       WHERE pb.id = $1 FOR UPDATE`,
      [id]
    );

    if (!bookingRes.rows[0]) {
      await client.query('ROLLBACK');
      res.status(404).json({ message: 'Podcast booking not found' });
      return;
    }

    const booking = bookingRes.rows[0];
    const prevStatus = booking.status;
    let refundAmount = 0;

    if (status === 'cancelled') {
      if (refund && Number(booking.total_cost) > 0) {
        refundAmount = Number(booking.total_cost);
        await client.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [refundAmount, booking.user_id]);
        await client.query(
          `INSERT INTO transactions (user_id, type, source, amount, description, reference)
           VALUES ($1, 'refund', 'podcast_booking_cancellation', $2, $3, $4)`,
          [booking.user_id, refundAmount, `Refund for cancelled podcast session ${booking.booking_number}`, booking.id]
        );
      }

      await client.query(
        `UPDATE podcast_bookings
         SET status = 'cancelled',
             cancelled_at = NOW(),
             cancellation_reason = $1,
             refund_amount = $2,
             notes = COALESCE($3, notes),
             updated_at = NOW()
         WHERE id = $4`,
        [reason || 'Cancelled by admin', refundAmount, notes || null, booking.id]
      );

      createNotification({
        user_id: booking.user_id,
        type: 'booking_cancelled',
        title: 'Studio session cancelled',
        body: refundAmount > 0
          ? `Your podcast session ${booking.booking_number} was cancelled by admin. ₦${refundAmount.toLocaleString()} has been credited to your wallet.`
          : `Your podcast session ${booking.booking_number} was cancelled by admin. Reason: ${reason || 'Admin cancellation'}`,
        link: '/bookings?tab=podcast',
      });
    } else if (status === 'completed') {
      await client.query(
        `UPDATE podcast_bookings
         SET status = 'completed',
             notes = COALESCE($1, notes),
             updated_at = NOW()
         WHERE id = $2`,
        [notes || null, booking.id]
      );

      createNotification({
        user_id: booking.user_id,
        type: 'booking_completed',
        title: 'Podcast session completed',
        body: `Your studio recording session ${booking.booking_number} (${booking.package_type}) has been marked as completed by the Studio Arella team.`,
        link: '/bookings?tab=podcast',
      });
    } else {
      // confirmed or other status
      await client.query(
        `UPDATE podcast_bookings
         SET status = $1,
             notes = COALESCE($2, notes),
             updated_at = NOW()
         WHERE id = $3`,
        [status, notes || null, booking.id]
      );

      createNotification({
        user_id: booking.user_id,
        type: 'booking_updated',
        title: 'Studio session updated',
        body: `Your studio session ${booking.booking_number} status has been updated to "${status}".`,
        link: '/bookings?tab=podcast',
      });
    }

    // Insert audit log
    await client.query(
      `INSERT INTO audit_logs (admin_id, admin_name, action_type, entity_type, entity_id, before_state, after_state)
       VALUES ($1, $2, $3, 'podcast_booking', $4, $5, $6)`,
      [
        authReq.user?.id,
        authReq.user?.email || 'admin',
        `PODCAST_${status.toUpperCase()}`,
        booking.id,
        JSON.stringify({ status: prevStatus }),
        JSON.stringify({ status, notes, refundAmount, reason })
      ]
    );

    await client.query('COMMIT');

    const updatedRes = await pool.query(
      `SELECT pb.*, u.name as user_name, u.email as user_email
       FROM podcast_bookings pb
       LEFT JOIN users u ON pb.user_id = u.id
       WHERE pb.id = $1`,
      [id]
    );

    res.json({
      booking: updatedRes.rows[0],
      message: `Podcast booking marked as ${status}${refundAmount > 0 ? ` (₦${refundAmount.toLocaleString()} refunded to wallet)` : ''}`
    });
  } catch (err: any) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('updatePodcastBookingStatus error:', err);
    res.status(500).json({ message: 'Failed to update podcast booking' });
  } finally {
    client.release();
  }
};

export const adjustUserCredits: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  if (!adminOnly(req, res)) return;
  const client = await pool.connect();
  try {
    const { amount, type = 'credit', reason = 'Admin adjustment' } = req.body;
    const numAmount = Math.abs(parseFloat(amount));

    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ message: 'Valid positive amount is required' });
      return;
    }

    await client.query('BEGIN');
    const userRes = await client.query('SELECT id, name, email, credits FROM users WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (!userRes.rows[0]) {
      await client.query('ROLLBACK');
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const currentCredits = parseFloat(userRes.rows[0].credits || '0');
    let newCredits = currentCredits;
    if (type === 'credit') {
      newCredits = currentCredits + numAmount;
    } else {
      if (currentCredits < numAmount) {
        await client.query('ROLLBACK');
        res.status(400).json({ message: `Insufficient user balance. Current balance is ₦${currentCredits.toLocaleString()}` });
        return;
      }
      newCredits = currentCredits - numAmount;
    }

    const updatedUserRes = await client.query(
      `UPDATE users SET credits = $1 WHERE id = $2 RETURNING id, name, email, role, credits`,
      [newCredits, req.params.id]
    );

    const ref = `ADM-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    await client.query(
      `INSERT INTO transactions (user_id, type, source, amount, description, reference)
       VALUES ($1, $2, 'admin_adjustment', $3, $4, $5)`,
      [
        req.params.id,
        type === 'credit' ? 'credit' : 'debit',
        numAmount,
        reason || (type === 'credit' ? 'Admin credit topup' : 'Admin credit deduction'),
        ref,
      ]
    );

    await client.query('COMMIT');

    createNotification({
      user_id: req.params.id,
      type: type === 'credit' ? 'payment_received' : 'payment_refunded',
      title: type === 'credit' ? 'Credits Added to Wallet' : 'Credits Deducted from Wallet',
      body: type === 'credit'
        ? `₦${numAmount.toLocaleString()} has been credited to your wallet by platform admin: ${reason}`
        : `₦${numAmount.toLocaleString()} was deducted from your wallet by platform admin: ${reason}`,
      link: '/finances',
    });

    res.json({
      message: `User balance adjusted successfully. New balance: ₦${newCredits.toLocaleString()}`,
      user: updatedUserRes.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('adjustUserCredits error:', err);
    res.status(500).json({ message: 'Failed to adjust user credits' });
  } finally {
    client.release();
  }
};

