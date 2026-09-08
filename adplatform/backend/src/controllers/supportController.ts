import { RequestHandler } from 'express';
import pool from '../db/pool';
import { AuthRequest } from '../middleware/auth';
import { sendSupportTicketAdminAlert } from '../services/emailService';

export const submitTicket: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { issue_type, subject, message } = req.body;
    if (!subject?.trim() || !message?.trim()) {
      res.status(400).json({ message: 'Subject and message are required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO support_tickets (user_id, issue_type, subject, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [authReq.user?.id, issue_type || null, subject.trim(), message.trim()]
    );

    const userRes = await pool.query('SELECT name, email FROM users WHERE id = $1', [authReq.user?.id]);
    const user = userRes.rows[0];
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'kaluvictor130@gmail.com';
    if (user) {
      await sendSupportTicketAdminAlert(adminEmail, user.name, user.email, issue_type, subject.trim(), message.trim())
        .catch((e) => console.error('Failed to send support ticket admin alert:', e));
    }

    res.status(201).json({
      message: "Ticket submitted! We'll get back to you within 24 hours.",
      ticket: result.rows[0],
    });
  } catch (err: any) {
    console.error('Submit support ticket error:', err);
    res.status(500).json({ message: 'Could not submit ticket. Please try again.' });
  }
};

export const getMyTickets: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const result = await pool.query(
      'SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC',
      [authReq.user?.id]
    );
    res.json({ tickets: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
