import { RequestHandler } from 'express';
import pool from '../db/pool';

export const submitLead: RequestHandler = async (req, res) => {
  try {
    const { name, email, phone, company, message } = req.body;

    if (!name || !email || !phone) {
      res.status(400).json({ message: 'Name, email, and phone are required.' });
      return;
    }

    // Ensure the table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ad_leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        company VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(
      `INSERT INTO ad_leads (name, email, phone, company, message) 
       VALUES ($1, $2, $3, $4, $5)`,
      [name, email, phone, company, message]
    );

    res.status(201).json({ message: 'Lead submitted successfully' });
  } catch (err) {
    console.error('Error submitting lead:', err);
    res.status(500).json({ message: 'Server error while submitting lead' });
  }
};

export const getLeads: RequestHandler = async (req, res) => {
  try {
    const authReq = req as any;
    if (authReq.user?.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    // Ensure the table exists before querying to avoid crashes on first load
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ad_leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        company VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const result = await pool.query('SELECT * FROM ad_leads ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ message: 'Server error while fetching leads' });
  }
};
