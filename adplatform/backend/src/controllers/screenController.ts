import { Request, Response, NextFunction, RequestHandler } from 'express';
import pool from '../db/pool';
import { AuthRequest } from '../middleware/auth';

export const getScreens : RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // All screens — managed by Bems Group admin
    const isOwner = req.query.my === 'true';
    let query = `SELECT s.*, u.name as owner_name, u.email as owner_email FROM screens s JOIN users u ON s.owner_id = u.id WHERE 1=1`;
    const params: any[] = [];

    if (isOwner) { params.push(authReq.user?.id); query += ` AND s.owner_id = $${params.length}`; }
    if (status) { params.push(status); query += ` AND s.status = $${params.length}`; }
    if (type) { params.push(type); query += ` AND s.type = $${params.length}`; }

    query += ` ORDER BY s.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) FROM screens');

    res.json({ screens: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createScreen : RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
  if (authReq.user?.role !== 'admin' && authReq.user?.role !== 'screen_owner') {
    res.status(403).json({ message: 'You need to become a screen owner to list a screen' });
    return;
  }
  try {
    const { name, location, type, size, price_per_sec, impressions_per_day } = req.body;
    const result = await pool.query(
      `INSERT INTO screens (owner_id, name, location, type, size, price_per_sec, impressions_per_day)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [authReq.user?.id, name, location, type, size, price_per_sec, impressions_per_day]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admins manage any screen regardless of owner_id. Screen owners are scoped
// to only the screens they actually own — enforced by including owner_id in
// the WHERE clause for that role, so a non-owner's request simply matches no
// row (404) rather than needing a separate authorization branch.
export const updateScreen : RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
  const role = authReq.user?.role;
  if (role !== 'admin' && role !== 'screen_owner') { res.status(403).json({ message: 'Not authorized to manage screens' }); return; }
  try {
    const { name, location, type, size, price_per_sec, impressions_per_day, status } = req.body;
    const params: any[] = [name, location, type, size, price_per_sec, impressions_per_day, status, req.params.id];
    let query = `UPDATE screens SET name=COALESCE($1,name), location=COALESCE($2,location),
       type=COALESCE($3,type), size=COALESCE($4,size), price_per_sec=COALESCE($5,price_per_sec),
       impressions_per_day=COALESCE($6,impressions_per_day), status=COALESCE($7,status)
       WHERE id=$8`;
    if (role !== 'admin') { params.push(authReq.user?.id); query += ` AND owner_id=$${params.length}`; }
    query += ' RETURNING *';
    const result = await pool.query(query, params);
    if (!result.rows[0]) { res.status(404).json({ message: 'Screen not found' }); return; }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteScreen : RequestHandler = async (req, res) => {
    const authReq = req as AuthRequest;
  const role = authReq.user?.role;
  if (role !== 'admin' && role !== 'screen_owner') { res.status(403).json({ message: 'Not authorized to manage screens' }); return; }
  try {
    // A screen's FK to bookings is ON DELETE SET NULL and to booking_slots
    // is ON DELETE CASCADE — deleting a screen with an unpaid or active
    // booking would silently null out that booking's screen and wipe its
    // scheduled slots while leaving the money already paid in place. Block
    // it instead; the owner needs to wait those out or cancel them first.
    const liveBookings = await pool.query(
      `SELECT id FROM bookings WHERE screen_id = $1 AND status IN ('pending_payment', 'active')`,
      [req.params.id]
    );
    if (liveBookings.rows.length > 0) {
      res.status(409).json({ message: `This screen has ${liveBookings.rows.length} pending or active booking(s). Cancel or wait for them to finish before deleting it.` });
      return;
    }

    const params: any[] = [req.params.id];
    let query = 'DELETE FROM screens WHERE id=$1';
    if (role !== 'admin') { params.push(authReq.user?.id); query += ` AND owner_id=$${params.length}`; }
    query += ' RETURNING id';
    const result = await pool.query(query, params);
    if (!result.rows[0]) { res.status(404).json({ message: 'Screen not found' }); return; }
    res.json({ message: 'Screen deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
