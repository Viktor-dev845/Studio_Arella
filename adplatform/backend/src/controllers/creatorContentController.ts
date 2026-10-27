import { Request, Response } from 'express';
import pool from '../db/pool';

// ── GET FEED (ALL / TRENDING / FILTERED BY CATEGORY OR TAG) ──────────────────
export async function getFeed(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || null;
    const { category, tag, view } = req.query;

    let query = `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.content_type,
        c.media_url,
        c.cover_url,
        c.duration_seconds,
        c.duration_text,
        c.category,
        c.tags,
        c.is_premium,
        c.price,
        c.likes_count,
        c.comments_count,
        c.views_count,
        c.badge_theme,
        c.created_at,
        u.id AS author_id,
        u.name AS author_name,
        COALESCE(u.avatar, '/audience/adam-udochi.png') AS author_avatar,
        COALESCE(NULLIF(u.creator_niche, ''), CASE WHEN u.role = 'creator' THEN 'Creator' WHEN u.role = 'screen_owner' THEN 'Media Partner' WHEN u.role = 'admin' THEN 'Administrator' ELSE 'Creator' END) AS author_role,
        u.creator_tier AS author_tier,
        CASE WHEN ub.id IS NOT NULL THEN true ELSE false END AS is_bookmarked,
        CASE WHEN cl.id IS NOT NULL THEN true ELSE false END AS has_liked,
        CASE 
          WHEN c.is_premium IS NOT TRUE THEN true
          WHEN c.creator_id = $1 THEN true
          WHEN pcp.id IS NOT NULL THEN true
          ELSE false 
        END AS is_unlocked
      FROM creator_content c
      JOIN users u ON c.creator_id = u.id
      LEFT JOIN user_bookmarks ub ON ub.content_id = c.id AND ub.user_id = $1
      LEFT JOIN creator_content_likes cl ON cl.content_id = c.id AND cl.user_id = $1
      LEFT JOIN premium_content_purchases pcp ON pcp.content_id = c.id AND pcp.user_id = $1
      WHERE c.status = 'published'
    `;

    const params: any[] = [userId];
    let paramIndex = 2;

    if (category) {
      query += ` AND LOWER(c.category) = LOWER($${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    if (tag) {
      query += ` AND $${paramIndex} = ANY(c.tags)`;
      params.push(tag);
      paramIndex++;
    }

    if (view === 'trending') {
      query += ` ORDER BY CASE WHEN c.created_at >= NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END DESC, (c.likes_count + c.comments_count + c.views_count) DESC, c.created_at DESC`;
    } else {
      query += ` ORDER BY c.created_at DESC`;
    }

    const { rows } = await pool.query(query, params);

    const formattedPosts = rows.map((r: any) => ({
      id: r.id,
      author: {
        id: r.author_id,
        name: r.author_name || 'Studio Arella Creator',
        role: r.author_role || 'Creator',
        avatar: r.author_avatar || '/audience/adam-udochi.png',
        tier: r.author_tier || 'pro',
      },
      author_name: r.author_name || 'Studio Arella Creator',
      author_role: r.author_role || 'Creator',
      author_avatar: r.author_avatar || '/audience/adam-udochi.png',
      author_tier: r.author_tier || 'pro',
      title: String(r.title || 'Studio Podcast').replace(/^[-–—\s]+/, ''),
      description: r.description,
      mediaUrl: r.cover_url || r.media_url || '',
      cover_url: r.cover_url || r.media_url || '',
      duration: r.duration_text || '01:15:00',
      currentTime: '00:04:15',
      progressPercent: 30,
      initialLikes: parseInt(r.likes_count, 10) || 0,
      initialComments: parseInt(r.comments_count, 10) || 0,
      likes_count: parseInt(r.likes_count, 10) || 0,
      comments_count: parseInt(r.comments_count, 10) || 0,
      badgeTheme: r.badge_theme || 'gold',
      isBookmarked: r.is_bookmarked,
      hasLiked: r.has_liked,
      isPremium: r.is_premium,
      isUnlocked: r.is_unlocked ?? (!r.is_premium),
      price: parseFloat(r.price) || 0,
      category: r.category,
      tags: r.tags || [],
    }));

    return res.json({ posts: formattedPosts });
  } catch (error: any) {
    console.error('getFeed error:', error);
    return res.status(500).json({ error: 'Failed to fetch content feed' });
  }
}

// ── GET BOOKMARKED POSTS ──────────────────────────────────────────────────────
export async function getBookmarkedContent(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const query = `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.content_type,
        c.media_url,
        c.cover_url,
        c.duration_seconds,
        c.duration_text,
        c.category,
        c.tags,
        c.is_premium,
        c.price,
        c.likes_count,
        c.comments_count,
        c.views_count,
        c.badge_theme,
        c.created_at,
        u.id AS author_id,
        u.name AS author_name,
        COALESCE(u.avatar, '/audience/adam-udochi.png') AS author_avatar,
        COALESCE(NULLIF(u.creator_niche, ''), CASE WHEN u.role = 'creator' THEN 'Creator' WHEN u.role = 'screen_owner' THEN 'Media Partner' WHEN u.role = 'admin' THEN 'Administrator' ELSE 'Creator' END) AS author_role,
        u.creator_tier AS author_tier,
        true AS is_bookmarked,
        CASE WHEN cl.id IS NOT NULL THEN true ELSE false END AS has_liked
      FROM user_bookmarks ub
      JOIN creator_content c ON ub.content_id = c.id
      JOIN users u ON c.creator_id = u.id
      LEFT JOIN creator_content_likes cl ON cl.content_id = c.id AND cl.user_id = $1
      WHERE ub.user_id = $1 AND c.status = 'published'
      ORDER BY ub.created_at DESC
    `;

    const { rows } = await pool.query(query, [userId]);

    const formattedPosts = rows.map((r: any) => ({
      id: r.id,
      author: {
        id: r.author_id,
        name: r.author_name || 'Studio Arella Creator',
        role: r.author_role || 'Creator',
        avatar: r.author_avatar || '/audience/adam-udochi.png',
        tier: r.author_tier || 'pro',
      },
      author_name: r.author_name || 'Studio Arella Creator',
      author_role: r.author_role || 'Creator',
      author_avatar: r.author_avatar || '/audience/adam-udochi.png',
      author_tier: r.author_tier || 'pro',
      title: String(r.title || 'Studio Podcast').replace(/^[-–—\s]+/, ''),
      description: r.description,
      mediaUrl: r.cover_url || r.media_url || '/audience/podcast-scthon.png',
      cover_url: r.cover_url || r.media_url || '/audience/podcast-scthon.png',
      duration: r.duration_text || '01:15:00',
      currentTime: '00:04:15',
      progressPercent: 30,
      initialLikes: parseInt(r.likes_count, 10) || 0,
      initialComments: parseInt(r.comments_count, 10) || 0,
      badgeTheme: r.badge_theme || 'gold',
      isBookmarked: true,
      hasLiked: r.has_liked,
      isPremium: r.is_premium,
      price: parseFloat(r.price) || 0,
      category: r.category,
      tags: r.tags || [],
    }));

    return res.json({ posts: formattedPosts });
  } catch (error: any) {
    console.error('getBookmarkedContent error:', error);
    return res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
}

// ── CREATE / PUBLISH CONTENT ──────────────────────────────────────────────────
export async function createContent(req: Request, res: Response) {
  try {
    const creatorId = (req as any).user.id;
    const { 
      title, 
      description, 
      content_type = 'post', 
      media_url, 
      cover_url, 
      duration_text = '00:45:00',
      category = 'General', 
      tags = [], 
      is_premium = false, 
      price = 0,
      badge_theme = 'gold' 
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO creator_content (
        creator_id, title, description, content_type, media_url, cover_url, 
        duration_text, category, tags, is_premium, price, badge_theme, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'published')
      RETURNING *`,
      [
        creatorId, title, description || '', content_type, media_url || '', cover_url || '',
        duration_text, category, tags, is_premium, price, badge_theme
      ]
    );

    return res.status(201).json({ message: 'Content published successfully', post: rows[0] });
  } catch (error: any) {
    console.error('createContent error:', error);
    return res.status(500).json({ error: 'Failed to publish content' });
  }
}

// ── TOGGLE LIKE ───────────────────────────────────────────────────────────────
export async function toggleLikeContent(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const contentId = req.params.id;

    const existing = await pool.query(
      'SELECT id FROM creator_content_likes WHERE content_id = $1 AND user_id = $2',
      [contentId, userId]
    );

    if (existing.rows.length > 0) {
      // Unlike
      await pool.query('DELETE FROM creator_content_likes WHERE content_id = $1 AND user_id = $2', [contentId, userId]);
      await pool.query('UPDATE creator_content SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1', [contentId]);
      return res.json({ liked: false });
    } else {
      // Like
      await pool.query('INSERT INTO creator_content_likes (content_id, user_id) VALUES ($1, $2)', [contentId, userId]);
      await pool.query('UPDATE creator_content SET likes_count = likes_count + 1 WHERE id = $1', [contentId]);
      return res.json({ liked: true });
    }
  } catch (error: any) {
    console.error('toggleLikeContent error:', error);
    return res.status(500).json({ error: 'Failed to toggle like' });
  }
}

// ── TOGGLE BOOKMARK ───────────────────────────────────────────────────────────
export async function toggleBookmark(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const contentId = req.params.id;

    const existing = await pool.query(
      'SELECT id FROM user_bookmarks WHERE content_id = $1 AND user_id = $2',
      [contentId, userId]
    );

    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM user_bookmarks WHERE content_id = $1 AND user_id = $2', [contentId, userId]);
      return res.json({ bookmarked: false });
    } else {
      await pool.query('INSERT INTO user_bookmarks (content_id, user_id) VALUES ($1, $2)', [contentId, userId]);
      return res.json({ bookmarked: true });
    }
  } catch (error: any) {
    console.error('toggleBookmark error:', error);
    return res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
}

// ── GET COMMENTS ──────────────────────────────────────────────────────────────
export async function getContentComments(req: Request, res: Response) {
  try {
    const contentId = req.params.id;

    const { rows } = await pool.query(
      `SELECT 
        c.id,
        c.parent_id,
        c.comment_text,
        c.likes_count,
        c.created_at,
        u.id AS author_id,
        u.name AS author_name,
        COALESCE(u.avatar, '/audience/adam-udochi.png') AS author_avatar
      FROM creator_content_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.content_id = $1
      ORDER BY c.created_at ASC`,
      [contentId]
    );

    // Group nested replies
    const topLevel: any[] = [];
    const replyMap = new Map<string, any[]>();

    rows.forEach((row: any) => {
      const item = {
        id: row.id,
        author: row.author_name,
        avatar: row.author_avatar,
        text: row.comment_text,
        likes: row.likes_count,
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

    return res.json({ comments: topLevel });
  } catch (error: any) {
    console.error('getContentComments error:', error);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

// ── ADD COMMENT ───────────────────────────────────────────────────────────────
export async function addContentComment(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const contentId = req.params.id;
    const commentBody = req.body.text || req.body.comment;
    const { parent_id = null } = req.body;

    if (!commentBody || !commentBody.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO creator_content_comments (content_id, user_id, parent_id, comment_text)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [contentId, userId, parent_id, commentBody.trim()]
    );

    await pool.query('UPDATE creator_content SET comments_count = comments_count + 1 WHERE id = $1', [contentId]);

    return res.status(201).json({ comment: rows[0] });
  } catch (error: any) {
    console.error('addContentComment error:', error);
    return res.status(500).json({ error: 'Failed to add comment' });
  }
}

// ── PURCHASE PREMIUM CONTENT (85% CREATOR / 15% PLATFORM) ─────────────────────
export async function purchasePremiumContent(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    const fanId = (req as any).user.id;
    const contentId = req.params.id;

    await client.query('BEGIN');

    const contentRes = await client.query('SELECT * FROM creator_content WHERE id = $1', [contentId]);
    if (contentRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Content not found' });
    }

    const content = contentRes.rows[0];
    const price = parseFloat(content.price || 0);
    const creatorId = content.creator_id;

    if (creatorId === fanId) {
      await client.query('ROLLBACK');
      return res.json({ message: 'You own this content', unlocked: true });
    }

    const existing = await client.query(
      'SELECT id FROM premium_content_purchases WHERE user_id = $1 AND content_id = $2',
      [fanId, contentId]
    );
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.json({ message: 'Content already unlocked', unlocked: true });
    }

    // Split: 85% creator, 15% platform fee
    const creatorShare = Number((price * 0.85).toFixed(2));
    const platformFee = Number((price * 0.15).toFixed(2));

    const purchaseRes = await client.query(
      `INSERT INTO premium_content_purchases (
         user_id, content_id, amount, creator_share, platform_fee, payment_reference, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [fanId, contentId, price, creatorShare, platformFee, `PREM-${Date.now()}`]
    );

    // Earnings ledger for creator
    await client.query(
      `INSERT INTO creator_earnings_ledger (
         creator_id, source_type, source_id, gross_amount, platform_fee, net_amount, status, description
       ) VALUES ($1, 'premium_content', $2, $3, $4, $5, 'available', $6)`,
      [
        creatorId,
        contentId,
        price,
        platformFee,
        creatorShare,
        `Premium content unlock: "${content.title}" (₦${price.toLocaleString()})`
      ]
    );

    // Credit creator wallet
    await client.query(
      `INSERT INTO creator_wallets (
         creator_id, available_balance, total_earned, updated_at
       ) VALUES ($1, $2, $2, NOW())
       ON CONFLICT (creator_id)
       DO UPDATE SET
         available_balance = creator_wallets.available_balance + $2,
         total_earned = creator_wallets.total_earned + $2,
         updated_at = NOW()`,
      [creatorId, creatorShare]
    );

    // Notification to creator
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES ($1, 'Premium Content Purchased', $2, 'earnings', false, NOW())`,
      [
        creatorId,
        `A supporter unlocked your premium content "${content.title}" for ₦${price.toLocaleString()}!`
      ]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Premium content unlocked successfully',
      unlocked: true,
      purchase: purchaseRes.rows[0]
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('purchasePremiumContent error:', error);
    return res.status(500).json({ error: 'Failed to purchase premium content' });
  } finally {
    client.release();
  }
}

