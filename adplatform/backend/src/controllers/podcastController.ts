import { Request, Response } from 'express';
import crypto from 'crypto';
import pool from '../db/pool';
import { createNotification } from '../services/notificationService';

export const getAvailability = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'start_date and end_date are required' });
    }

    const { rows } = await pool.query(
      `SELECT start_time, end_time, status 
       FROM podcast_bookings 
       WHERE start_time >= $1 AND end_time <= $2 
       AND (status IN ('confirmed', 'completed') OR (status = 'pending' AND created_at >= NOW() - INTERVAL '5 minutes'))`,
      [start_date, end_date]
    );

    res.json({ slots: rows });
  } catch (error: any) {
    console.error('Error fetching podcast availability:', error);
    res.status(500).json({ message: 'Failed to fetch availability' });
  }
};

// Real, publicly-quoted studio rates (see the pricing FAQ on the landing page).
// Kept server-side and never trusted from the client — a booking's price is
// always computed here, not sent by whoever is making the request.
const PACKAGE_RATE_PER_HOUR: Record<string, number> = {
  'Audio Only': 10000,
  'Audio + Video': 20000,
};

export const reserveSlot = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { package_type, start_time, end_time, duration_minutes, notes } = req.body;

    if (!start_time || !end_time || !duration_minutes) {
      return res.status(400).json({ message: 'Missing required time fields' });
    }

    const ratePerHour = PACKAGE_RATE_PER_HOUR[package_type];
    if (!ratePerHour) {
      return res.status(400).json({ message: 'Invalid package type' });
    }

    const conflictCheck = await pool.query(
      `SELECT id FROM podcast_bookings
       WHERE (status IN ('confirmed', 'completed') OR (status = 'pending' AND created_at >= NOW() - INTERVAL '5 minutes'))
       AND (start_time < $2 AND end_time > $1)`,
      [start_time, end_time]
    );

    if (conflictCheck.rows.length > 0) {
      return res.status(409).json({ message: 'Time slot is already booked or reserved.' });
    }

    // Generate unique booking number
    const booking_number = 'POD-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    const total_cost = Math.round((Number(duration_minutes) / 60) * ratePerHour);

    const { rows } = await pool.query(
      `INSERT INTO podcast_bookings
       (booking_number, user_id, package_type, start_time, end_time, duration_minutes, addons, base_cost, addons_cost, total_cost, status, payment_status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, '[]'::jsonb, $7, 0, $7, 'pending', 'pending', $8)
       RETURNING id, booking_number`,
      [booking_number, userId, package_type, start_time, end_time, duration_minutes, total_cost, notes?.trim() || null]
    );

    res.json({ message: 'Slot reserved successfully', booking_id: rows[0].id, booking_number: rows[0].booking_number, total_cost });
  } catch (error: any) {
    console.error('Error reserving podcast slot:', error);
    res.status(500).json({ message: 'Failed to reserve slot' });
  }
};

// ── Reserve a recurring series of podcast sessions (one combined payment) ─────
// Body: { package_type, notes, sessions: [{ start_time, end_time }, ...] }
// All sessions are checked for conflicts together and created atomically — if
// any one of them can't be booked, none of them are, so there's never a
// half-booked series waiting on payment.
export const reserveSeries = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const client = await pool.connect();
  try {
    const { package_type, notes, sessions } = req.body as {
      package_type: string; notes?: string; sessions?: { start_time: string; end_time: string }[];
    };

    if (!Array.isArray(sessions) || sessions.length < 2) {
      return res.status(400).json({ message: 'A recurring series needs at least 2 sessions — use the regular reserve endpoint for a single session.' });
    }
    if (sessions.length > 26) {
      return res.status(400).json({ message: 'A series can have at most 26 sessions.' });
    }
    const ratePerHour = PACKAGE_RATE_PER_HOUR[package_type];
    if (!ratePerHour) {
      return res.status(400).json({ message: 'Invalid package type' });
    }
    for (const s of sessions) {
      if (!s.start_time || !s.end_time || new Date(s.end_time) <= new Date(s.start_time)) {
        return res.status(400).json({ message: 'Every session needs a valid start and end time' });
      }
    }

    await client.query('BEGIN');

    // Conflict-check every session against existing bookings AND against each
    // other in this same request (in case the picked pattern overlaps itself).
    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      const conflict = await client.query(
        `SELECT id FROM podcast_bookings
         WHERE (status IN ('confirmed', 'completed') OR (status = 'pending' AND created_at >= NOW() - INTERVAL '5 minutes'))
         AND (start_time < $2 AND end_time > $1)`,
        [s.start_time, s.end_time]
      );
      if (conflict.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ message: `Session ${i + 1} (${new Date(s.start_time).toLocaleString()}) is already booked or reserved.` });
      }
      const overlapsSibling = sessions.some((other, j) => j !== i &&
        new Date(other.start_time) < new Date(s.end_time) && new Date(other.end_time) > new Date(s.start_time));
      if (overlapsSibling) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Session ${i + 1} overlaps another session in this same series.` });
      }
    }

    const seriesId = crypto.randomUUID();
    const bookingIds: string[] = [];
    let totalCost = 0;

    for (const s of sessions) {
      const durationMinutes = Math.round((new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 60000);
      const sessionCost = Math.round((durationMinutes / 60) * ratePerHour);
      totalCost += sessionCost;
      const booking_number = 'POD-' + Math.random().toString(36).substr(2, 8).toUpperCase();

      const { rows } = await client.query(
        `INSERT INTO podcast_bookings
         (booking_number, user_id, package_type, start_time, end_time, duration_minutes, addons, base_cost, addons_cost, total_cost, status, payment_status, notes, series_id)
         VALUES ($1, $2, $3, $4, $5, $6, '[]'::jsonb, $7, 0, $7, 'pending', 'pending', $8, $9)
         RETURNING id`,
        [booking_number, userId, package_type, s.start_time, s.end_time, durationMinutes, sessionCost, notes?.trim() || null, seriesId]
      );
      bookingIds.push(rows[0].id);
    }

    await client.query('COMMIT');
    res.json({ series_id: seriesId, booking_ids: bookingIds, session_count: sessions.length, total_cost: totalCost });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Reserve series error:', error);
    res.status(500).json({ message: 'Could not reserve this series. Please try again.' });
  } finally {
    client.release();
  }
};

// ── Pay for a whole recurring series at once (wallet payment only) ────────────
export const paySeriesFromWallet = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const seriesRes = await client.query(
      `SELECT * FROM podcast_bookings WHERE series_id = $1 AND user_id = $2 AND status = 'pending' FOR UPDATE`,
      [req.params.seriesId, userId]
    );
    if (seriesRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Series not found or already paid' });
    }
    // Reservations are only held for 5 minutes, same as a single session.
    const oldestCreatedAt = seriesRes.rows.reduce((min: Date, b: any) => new Date(b.created_at) < min ? new Date(b.created_at) : min, new Date(seriesRes.rows[0].created_at));
    if (Date.now() - oldestCreatedAt.getTime() > 5 * 60 * 1000) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Reservation expired (5 min limit). Please re-book your series.' });
    }

    const totalCost = seriesRes.rows.reduce((sum: number, b: any) => sum + Number(b.total_cost), 0);

    const userRes = await client.query('SELECT credits FROM users WHERE id = $1 FOR UPDATE', [userId]);
    const credits = parseFloat(userRes.rows[0].credits);
    if (credits < totalCost) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `Insufficient wallet balance. This series costs ₦${totalCost.toLocaleString()}.` });
    }

    await client.query('UPDATE users SET credits = credits - $1 WHERE id = $2', [totalCost, userId]);
    await client.query(
      `INSERT INTO transactions (user_id, type, source, amount, description, reference)
       VALUES ($1, 'debit', 'podcast_booking_series', $2, $3, $4)`,
      [userId, totalCost, `Paid for recurring podcast series (${seriesRes.rows.length} sessions)`, req.params.seriesId]
    );
    await client.query(
      `UPDATE podcast_bookings SET status = 'confirmed', payment_status = 'paid' WHERE series_id = $1`,
      [req.params.seriesId]
    );

    await client.query('COMMIT');
    res.json({ message: 'Series booked and paid', session_count: seriesRes.rows.length, total_cost: totalCost });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Pay series error:', error);
    res.status(500).json({ message: 'Payment failed. Please try again.' });
  } finally {
    client.release();
  }
};

// ── Extend a confirmed podcast booking (wallet payment only) ──────────────────
export const extendPodcastBooking = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const client = await pool.connect();
  try {
    const additionalMinutes = Number(req.body.additional_minutes);
    if (!additionalMinutes || additionalMinutes <= 0 || additionalMinutes > 60 * 12) {
      return res.status(400).json({ message: 'Please provide a valid number of additional minutes (up to 12 hours).' });
    }

    await client.query('BEGIN');

    const bookingRes = await client.query(
      `SELECT * FROM podcast_bookings WHERE id = $1 AND user_id = $2 AND status = 'confirmed' FOR UPDATE`,
      [req.params.id, userId]
    );
    if (!bookingRes.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Confirmed booking not found' });
    }
    const booking = bookingRes.rows[0];

    const ratePerHour = PACKAGE_RATE_PER_HOUR[booking.package_type];
    if (!ratePerHour) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Unknown package type on this booking' });
    }

    const newStart = new Date(booking.end_time);
    const newEnd = new Date(newStart.getTime() + additionalMinutes * 60000);

    const conflict = await client.query(
      `SELECT id FROM podcast_bookings
       WHERE id != $1
         AND (status IN ('confirmed', 'completed') OR (status = 'pending' AND created_at >= NOW() - INTERVAL '5 minutes'))
         AND (start_time < $3 AND end_time > $2)`,
      [booking.id, newStart.toISOString(), newEnd.toISOString()]
    );
    if (conflict.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'That time is already booked — someone else has the studio right after your session.' });
    }

    const additionalCost = Math.round((additionalMinutes / 60) * ratePerHour);

    const userRes = await client.query('SELECT credits FROM users WHERE id = $1 FOR UPDATE', [userId]);
    const credits = parseFloat(userRes.rows[0].credits);
    if (credits < additionalCost) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `Insufficient wallet balance. Extending by ${additionalMinutes} minutes costs ₦${additionalCost.toLocaleString()}.` });
    }

    await client.query('UPDATE users SET credits = credits - $1 WHERE id = $2', [additionalCost, userId]);
    await client.query(
      `INSERT INTO transactions (user_id, type, source, amount, description, reference)
       VALUES ($1, 'debit', 'podcast_booking_extension', $2, $3, $4)`,
      [userId, additionalCost, `Extended podcast booking ${booking.booking_number} by ${additionalMinutes} min`, booking.booking_number]
    );
    const updated = await client.query(
      `UPDATE podcast_bookings
       SET end_time = $1, duration_minutes = duration_minutes + $2, total_cost = total_cost + $3
       WHERE id = $4 RETURNING *`,
      [newEnd.toISOString(), additionalMinutes, additionalCost, booking.id]
    );

    await client.query('COMMIT');
    res.json({ booking: updated.rows[0], additional_cost: additionalCost });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Extend podcast booking error:', error);
    res.status(500).json({ message: 'Could not extend this booking. Please try again.' });
  } finally {
    client.release();
  }
};

// ── Cancel a podcast booking ────────────────────────────────────────────────
export const cancelPodcastBooking = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const client = await pool.connect();
  try {
    const bookingRes = await client.query(
      `SELECT * FROM podcast_bookings WHERE id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );
    if (!bookingRes.rows[0]) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    const booking = bookingRes.rows[0];
    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({ message: 'This booking cannot be cancelled' });
    }

    // Same 48-hour refund-eligibility window used for ad bookings.
    const hoursUntilSession = (new Date(booking.start_time).getTime() - Date.now()) / (1000 * 60 * 60);
    const eligibleForRefund = hoursUntilSession >= 48;
    const refundAmount = eligibleForRefund ? Number(booking.total_cost) : 0;

    await client.query('BEGIN');

    await client.query(
      `UPDATE podcast_bookings
       SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = $1, refund_amount = $2
       WHERE id = $3`,
      [req.body.reason || 'Cancelled by user', refundAmount, booking.id]
    );

    // Refunds are always issued as wallet credit, regardless of the original
    // payment method — there's no gateway refund integration.
    if (refundAmount > 0) {
      await client.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [refundAmount, userId]);
      await client.query(
        `INSERT INTO transactions (user_id, type, source, amount, description, reference)
         VALUES ($1, 'refund', 'podcast_booking_cancellation', $2, $3, $4)`,
        [userId, refundAmount, `Refund for cancelled podcast session ${booking.booking_number}`, booking.id]
      );
    }

    await client.query('COMMIT');

    createNotification({
      user_id: userId,
      type: 'booking_cancelled',
      title: 'Studio session cancelled',
      body: eligibleForRefund
        ? `Your podcast session ${booking.booking_number} was cancelled. ₦${refundAmount.toLocaleString()} has been credited to your wallet.`
        : `Your podcast session ${booking.booking_number} was cancelled. No refund applicable (within 48-hour window).`,
      link: '/bookings',
    });

    res.json({
      message: eligibleForRefund
        ? `Session cancelled. ₦${refundAmount.toLocaleString()} has been credited to your wallet.`
        : 'Session cancelled. No refund applicable (within 48-hour window).',
      refund_amount: refundAmount,
    });
  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Cancel podcast booking error:', error);
    res.status(500).json({ message: 'Cancellation failed' });
  } finally {
    client.release();
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { rows } = await pool.query(
      `SELECT * FROM podcast_bookings 
       WHERE user_id = $1 
       ORDER BY start_time DESC`,
      [userId]
    );

    res.json({ bookings: rows });
  } catch (error: any) {
    console.error('Error fetching podcast bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};
