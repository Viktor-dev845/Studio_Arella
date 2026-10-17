import { Request, Response } from 'express';
import pool from '../db/pool';

// ── GET LIVE EXPERIENCES LIST ─────────────────────────────────────────────────
export async function getLiveExperiences(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || null;

    const query = `
      SELECT 
        l.id,
        l.name,
        l.description,
        l.category,
        l.participants_count,
        l.moderators_count,
        l.prize_banner_text,
        l.ticket_price,
        l.is_members_only,
        l.status,
        l.scheduled_at,
        u.id AS creator_id,
        u.name AS creator_name,
        COALESCE(u.avatar, '/audience/adam-udochi.png') AS creator_avatar,
        CASE WHEN la.id IS NOT NULL THEN true ELSE false END AS is_joined
      FROM live_experiences l
      JOIN users u ON l.creator_id = u.id
      LEFT JOIN live_experience_attendees la ON la.event_id = l.id AND la.user_id = $1
      ORDER BY l.status = 'live' DESC, l.scheduled_at ASC
    `;

    const { rows } = await pool.query(query, [userId]);

    const formatted = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      participantsCount: parseInt(r.participants_count, 10) || 0,
      moderatorsCount: parseInt(r.moderators_count, 10) || 2,
      prizeBannerText: r.prize_banner_text,
      ticketPrice: parseFloat(r.ticket_price) || 0,
      isMembersOnly: r.is_members_only,
      isJoined: r.is_joined,
      status: r.status,
      creator: {
        id: r.creator_id,
        name: r.creator_name,
        avatar: r.creator_avatar,
      }
    }));

    return res.json({ experiences: formatted });
  } catch (error: any) {
    console.error('getLiveExperiences error:', error);
    return res.status(500).json({ error: 'Failed to fetch live experiences' });
  }
}

// ── GET SINGLE LIVE EXPERIENCE DETAIL ─────────────────────────────────────────
export async function getLiveExperienceById(req: Request, res: Response) {
  try {
    const eventId = req.params.id;
    const userId = (req as any).user?.id || null;

    const { rows } = await pool.query(
      `SELECT 
        l.*,
        u.id AS creator_id,
        u.name AS creator_name,
        COALESCE(u.avatar, '/audience/adam-udochi.png') AS creator_avatar,
        COALESCE(u.creator_niche, 'Lead Creator') AS creator_role,
        CASE WHEN la.id IS NOT NULL THEN true ELSE false END AS is_joined
      FROM live_experiences l
      JOIN users u ON l.creator_id = u.id
      LEFT JOIN live_experience_attendees la ON la.event_id = l.id AND la.user_id = $2
      WHERE l.id = $1`,
      [eventId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Live experience not found' });
    }

    const r = rows[0];

    return res.json({
      event: {
        id: r.id,
        title: r.name,
        description: r.description,
        streamUrl: r.stream_url,
        participantsCount: parseInt(r.participants_count, 10) || 0,
        moderatorsCount: parseInt(r.moderators_count, 10) || 2,
        prizeBannerText: r.prize_banner_text,
        isJoined: r.is_joined,
        status: r.status,
        team: [
          {
            name: r.creator_name,
            role: 'Creator',
            avatar: r.creator_avatar,
          },
          {
            name: 'Laverne Audet',
            role: 'Co-creator',
            avatar: '/audience/nermmen-saif.png',
          }
        ]
      }
    });
  } catch (error: any) {
    console.error('getLiveExperienceById error:', error);
    return res.status(500).json({ error: 'Failed to fetch live event details' });
  }
}

// ── JOIN LIVE EXPERIENCE ──────────────────────────────────────────────────────
export async function joinLiveExperience(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const eventId = req.params.id;

    const existing = await pool.query(
      'SELECT id FROM live_experience_attendees WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    );

    if (existing.rows.length > 0) {
      // Leave
      await pool.query('DELETE FROM live_experience_attendees WHERE event_id = $1 AND user_id = $2', [eventId, userId]);
      await pool.query('UPDATE live_experiences SET participants_count = GREATEST(0, participants_count - 1) WHERE id = $1', [eventId]);
      return res.json({ joined: false });
    } else {
      // Join
      await pool.query('INSERT INTO live_experience_attendees (event_id, user_id) VALUES ($1, $2)', [eventId, userId]);
      await pool.query('UPDATE live_experiences SET participants_count = participants_count + 1 WHERE id = $1', [eventId]);
      return res.json({ joined: true });
    }
  } catch (error: any) {
    console.error('joinLiveExperience error:', error);
    return res.status(500).json({ error: 'Failed to join live experience' });
  }
}

// ── GET LIVE EVENT MESSAGES ───────────────────────────────────────────────────
export async function getLiveMessages(req: Request, res: Response) {
  try {
    const eventId = req.params.id;

    const { rows } = await pool.query(
      `SELECT 
        m.id,
        m.parent_id,
        m.message,
        m.likes_count,
        m.created_at,
        u.id AS author_id,
        u.name AS author_name,
        COALESCE(u.avatar, '/audience/adam-udochi.png') AS author_avatar
      FROM live_experience_messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.event_id = $1
      ORDER BY m.created_at ASC`,
      [eventId]
    );

    // Group nested replies
    const topLevel: any[] = [];
    const replyMap = new Map<string, any[]>();

    rows.forEach((row: any) => {
      const item = {
        id: row.id,
        author: row.author_name,
        avatarBg: 'bg-amber-100 text-amber-800',
        text: row.message,
        likes: parseInt(row.likes_count, 10) || 0,
        createdAt: row.created_at,
        replies: []
      };

      if (!row.parent_id) {
        topLevel.push(item);
      } else {
        if (!replyMap.has(row.parent_id)) {
          replyMap.set(row.parent_id, []);
        }
        replyMap.get(row.parent_id)!.push(item);
      }
    });

    topLevel.forEach((parent) => {
      parent.replies = replyMap.get(parent.id) || [];
    });

    return res.json({ messages: topLevel });
  } catch (error: any) {
    console.error('getLiveMessages error:', error);
    return res.status(500).json({ error: 'Failed to fetch live chat messages' });
  }
}

// ── SEND LIVE MESSAGE ─────────────────────────────────────────────────────────
export async function sendLiveMessage(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const eventId = req.params.id;
    const { message, parent_id = null } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO live_experience_messages (event_id, user_id, parent_id, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [eventId, userId, parent_id, message.trim()]
    );

    return res.status(201).json({ message: rows[0] });
  } catch (error: any) {
    console.error('sendLiveMessage error:', error);
    return res.status(500).json({ error: 'Failed to send live message' });
  }
}

// ── LIKE LIVE MESSAGE ─────────────────────────────────────────────────────────
export async function likeLiveMessage(req: Request, res: Response) {
  try {
    const messageId = req.params.messageId;

    const { rows } = await pool.query(
      'UPDATE live_experience_messages SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count',
      [messageId]
    );

    return res.json({ likes: rows[0]?.likes_count || 0 });
  } catch (error: any) {
    console.error('likeLiveMessage error:', error);
    return res.status(500).json({ error: 'Failed to like message' });
  }
}
