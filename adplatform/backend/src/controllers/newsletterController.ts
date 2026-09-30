import { RequestHandler } from 'express';
import pool from '../db/pool';

export const subscribeNewsletter: RequestHandler = async (req, res) => {
  try {
    const { firstName, email, category } = req.body;

    if (!firstName || !email) {
      res.status(400).json({ message: 'First name and email are required.' });
      return;
    }

    // Ensure the table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(100),
        subscribed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Insert or update
    await pool.query(
      `INSERT INTO newsletter_subscribers (first_name, email, category) 
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET 
       first_name = EXCLUDED.first_name,
       category = EXCLUDED.category,
       subscribed_at = NOW()`,
      [firstName, email, category || null]
    );

    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    console.error('Error subscribing to newsletter:', err);
    res.status(500).json({ message: 'Server error while subscribing' });
  }
};
