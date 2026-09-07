import { RequestHandler } from 'express';
import pool from '../db/pool';
import { AuthRequest } from '../middleware/auth';

// Real global search across the current user's own bookings, ads, and
// podcast shows — backs the navbar search box, which previously did nothing.
export const globalSearch: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const q = (req.query.q as string || '').trim();
    if (q.length < 2) { res.json({ results: [] }); return; }
    const like = `%${q}%`;
    const userId = authReq.user?.id;

    const [ads, adBookings, podcastBookings, shows] = await Promise.all([
      pool.query(
        `SELECT id, title FROM ads WHERE user_id = $1 AND title ILIKE $2 ORDER BY created_at DESC LIMIT 5`,
        [userId, like]
      ),
      pool.query(
        `SELECT b.id, b.booking_number, a.title as creative_title
         FROM bookings b LEFT JOIN ads a ON b.ad_id = a.id
         WHERE b.user_id = $1 AND (b.booking_number ILIKE $2 OR a.title ILIKE $2)
         ORDER BY b.created_at DESC LIMIT 5`,
        [userId, like]
      ),
      pool.query(
        `SELECT id, booking_number, package_type FROM podcast_bookings
         WHERE user_id = $1 AND (booking_number ILIKE $2 OR package_type ILIKE $2)
         ORDER BY created_at DESC LIMIT 5`,
        [userId, like]
      ),
      pool.query(
        `SELECT id, title FROM podcasts WHERE user_id = $1 AND title ILIKE $2 ORDER BY created_at DESC LIMIT 5`,
        [userId, like]
      ),
    ]);

    const results = [
      ...ads.rows.map(r => ({ type: 'Ad', label: r.title, path: '/ads' })),
      ...adBookings.rows.map(r => ({ type: 'Booking', label: r.creative_title ? `${r.booking_number} — ${r.creative_title}` : r.booking_number, path: `/my-ads/${r.id}` })),
      ...podcastBookings.rows.map(r => ({ type: 'Podcast Session', label: `${r.booking_number} — ${r.package_type}`, path: '/bookings?tab=podcast' })),
      ...shows.rows.map(r => ({ type: 'Podcast', label: r.title, path: `/podcast/${r.id}` })),
    ];

    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
