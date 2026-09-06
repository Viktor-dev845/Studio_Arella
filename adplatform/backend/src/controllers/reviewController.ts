import { RequestHandler } from 'express';
import pool from '../db/pool';
import { AuthRequest } from '../middleware/auth';

const VALID_BOOKING_TYPES = new Set(['ad', 'podcast']);

// A booking can only be reviewed once it has actually happened.
async function findEndedBooking(bookingType: string, bookingId: string, userId: string) {
  if (bookingType === 'ad') {
    const res = await pool.query(
      `SELECT id, booking_number FROM bookings
       WHERE id = $1 AND user_id = $2 AND end_time <= NOW() AND status != 'cancelled'`,
      [bookingId, userId]
    );
    return res.rows[0] || null;
  }
  const res = await pool.query(
    `SELECT id, booking_number FROM podcast_bookings
     WHERE id = $1 AND user_id = $2 AND end_time <= NOW() AND status != 'cancelled'`,
    [bookingId, userId]
  );
  return res.rows[0] || null;
}

export const createReview: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { booking_type, booking_id, title, body, rating } = req.body;

    if (!VALID_BOOKING_TYPES.has(booking_type)) {
      res.status(400).json({ message: "booking_type must be 'ad' or 'podcast'" });
      return;
    }
    if (!booking_id || !body?.trim()) {
      res.status(400).json({ message: 'A booking and review text are required' });
      return;
    }
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ message: 'Rating must be a whole number from 1 to 5' });
      return;
    }

    const booking = await findEndedBooking(booking_type, booking_id, authReq.user?.id as string);
    if (!booking) {
      res.status(404).json({ message: "Booking not found, or hasn't ended yet" });
      return;
    }

    const existing = await pool.query(
      'SELECT id FROM booking_reviews WHERE booking_type = $1 AND booking_id = $2',
      [booking_type, booking_id]
    );
    if (existing.rows[0]) {
      res.status(409).json({ message: 'You already reviewed this booking' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO booking_reviews (user_id, booking_type, booking_id, title, body, rating)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [authReq.user?.id, booking_type, booking_id, title?.trim() || null, body.trim(), ratingNum]
    );

    res.status(201).json({ review: result.rows[0] });
  } catch (err: any) {
    console.error('Create review error:', err);
    res.status(500).json({ message: 'Could not submit your review. Please try again.' });
  }
};
