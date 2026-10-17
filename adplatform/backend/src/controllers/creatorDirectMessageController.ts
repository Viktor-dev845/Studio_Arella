import { Request, Response } from 'express';
import pool from '../db/pool';

// ── GET USER CONVERSATIONS ───────────────────────────────────────────────────
export async function getConversations(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || '22f92f4c-f014-42b5-a89a-4c64afc5f24b';

    const query = `
      SELECT 
        c.id AS conversation_id,
        c.last_message_text,
        c.last_message_at,
        CASE 
          WHEN c.participant_one_id = $1 THEN u2.id 
          ELSE u1.id 
        END AS contact_id,
        CASE 
          WHEN c.participant_one_id = $1 THEN u2.name 
          ELSE u1.name 
        END AS contact_name,
        CASE 
          WHEN c.participant_one_id = $1 THEN COALESCE(u2.avatar, '/audience/adam-udochi.png') 
          ELSE COALESCE(u1.avatar, '/audience/adam-udochi.png') 
        END AS contact_avatar,
        CASE 
          WHEN c.participant_one_id = $1 THEN COALESCE(u2.creator_niche, 'Creative') 
          ELSE COALESCE(u1.creator_niche, 'Creative') 
        END AS contact_role,
        (
          SELECT COUNT(*) 
          FROM direct_messages dm 
          WHERE dm.conversation_id = c.id 
            AND dm.recipient_id = $1 
            AND dm.is_read = false
        ) AS unread_count
      FROM conversations c
      JOIN users u1 ON c.participant_one_id = u1.id
      JOIN users u2 ON c.participant_two_id = u2.id
      WHERE c.participant_one_id = $1 OR c.participant_two_id = $1
      ORDER BY c.last_message_at DESC
    `;

    const { rows } = await pool.query(query, [userId]);

    return res.json({ conversations: rows });
  } catch (error: any) {
    console.error('getConversations error:', error);
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
}

// ── GET MESSAGES FOR A CONVERSATION ───────────────────────────────────────────
export async function getConversationMessages(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || '22f92f4c-f014-42b5-a89a-4c64afc5f24b';
    const { contactId } = req.params;

    // Find or create conversation
    let convRes = await pool.query(
      `SELECT id FROM conversations 
       WHERE (participant_one_id = $1 AND participant_two_id = $2)
          OR (participant_one_id = $2 AND participant_two_id = $1)`,
      [userId, contactId]
    );

    let conversationId: string;

    if (convRes.rows.length === 0) {
      const newConv = await pool.query(
        `INSERT INTO conversations (participant_one_id, participant_two_id, last_message_text)
         VALUES ($1, $2, '')
         RETURNING id`,
        [userId, contactId]
      );
      conversationId = newConv.rows[0].id;
    } else {
      conversationId = convRes.rows[0].id;
    }

    // Fetch messages
    const { rows } = await pool.query(
      `SELECT 
        dm.id,
        dm.sender_id,
        dm.recipient_id,
        dm.message_text,
        dm.media_url,
        dm.is_read,
        dm.created_at,
        TO_CHAR(dm.created_at, 'HH12:MI AM') AS time_formatted,
        u.name AS sender_name,
        COALESCE(u.avatar, '/audience/adam-udochi.png') AS sender_avatar
      FROM direct_messages dm
      JOIN users u ON dm.sender_id = u.id
      WHERE dm.conversation_id = $1
      ORDER BY dm.created_at ASC`,
      [conversationId]
    );

    // Mark unread as read
    await pool.query(
      'UPDATE direct_messages SET is_read = true WHERE conversation_id = $1 AND recipient_id = $2',
      [conversationId, userId]
    );

    const formatted = rows.map((r: any) => ({
      id: r.id,
      sender: r.sender_id === userId ? 'me' : 'them',
      text: r.message_text,
      time: r.time_formatted,
      isRead: r.is_read,
      avatar: r.sender_avatar,
      bgColor: r.sender_id === userId ? 'bg-[#D4AF37]' : 'bg-[#FCF6E6]',
    }));

    return res.json({ conversationId, messages: formatted });
  } catch (error: any) {
    console.error('getConversationMessages error:', error);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

// ── SEND DIRECT MESSAGE ───────────────────────────────────────────────────────
export async function sendDirectMessage(req: Request, res: Response) {
  try {
    const senderId = (req as any).user.id;
    const { contactId } = req.params;
    const { message_text, media_url = null } = req.body;

    if (!message_text || !message_text.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    // Find or create conversation
    let convRes = await pool.query(
      `SELECT id FROM conversations 
       WHERE (participant_one_id = $1 AND participant_two_id = $2)
          OR (participant_one_id = $2 AND participant_two_id = $1)`,
      [senderId, contactId]
    );

    let conversationId: string;

    if (convRes.rows.length === 0) {
      const newConv = await pool.query(
        `INSERT INTO conversations (participant_one_id, participant_two_id, last_message_text, last_message_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id`,
        [senderId, contactId, message_text.trim()]
      );
      conversationId = newConv.rows[0].id;
    } else {
      conversationId = convRes.rows[0].id;
      await pool.query(
        'UPDATE conversations SET last_message_text = $1, last_message_at = NOW() WHERE id = $2',
        [message_text.trim(), conversationId]
      );
    }

    // Insert message
    const { rows } = await pool.query(
      `INSERT INTO direct_messages (conversation_id, sender_id, recipient_id, message_text, media_url, is_read)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING *, TO_CHAR(created_at, 'HH12:MI AM') AS time_formatted`,
      [conversationId, senderId, contactId, message_text.trim(), media_url]
    );

    const inserted = rows[0];

    return res.status(201).json({
      message: {
        id: inserted.id,
        sender: 'me',
        text: inserted.message_text,
        time: inserted.time_formatted,
        isRead: false,
        bgColor: 'bg-[#D4AF37]',
      }
    });
  } catch (error: any) {
    console.error('sendDirectMessage error:', error);
    return res.status(500).json({ error: 'Failed to send direct message' });
  }
}
