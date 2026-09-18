import { RequestHandler } from 'express';
import pool from '../db/pool';
import { AuthRequest } from '../middleware/auth';

export const getFavorites: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const result = await pool.query(
      'SELECT path, label FROM page_favorites WHERE user_id = $1 ORDER BY created_at DESC',
      [authReq.user?.id]
    );
    res.json({ favorites: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addFavorite: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { path, label } = req.body;
    if (!path?.trim() || !label?.trim()) {
      res.status(400).json({ message: 'A path and label are required' });
      return;
    }
    const result = await pool.query(
      `INSERT INTO page_favorites (user_id, path, label) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, path) DO UPDATE SET label = EXCLUDED.label
       RETURNING path, label`,
      [authReq.user?.id, path.trim(), label.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeFavorite: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { path } = req.query;
    if (!path || typeof path !== 'string') {
      res.status(400).json({ message: 'A path is required' });
      return;
    }
    await pool.query('DELETE FROM page_favorites WHERE user_id = $1 AND path = $2', [authReq.user?.id, path]);
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
