import { Request, Response } from 'express';
import pool from '../db/pool';

// ── HELPER: FORMAT QUOTED POST ───────────────────────────────────────────────
function formatQuotedPost(r: any) {
  if (r.quoted_post_id) {
    return {
      id: r.quoted_post_id,
      author: {
        id: r.quoted_author_id,
        name: r.quoted_author_name || 'Studio Arella Creator',
        role: r.quoted_author_role || 'Creator',
        avatar: r.quoted_author_avatar || '/audience/adam-udochi.png',
      },
      title: String(r.quoted_post_title || 'Studio Podcast').replace(/^[-–—\s]+/, ''),
      description: r.quoted_post_description || '',
      category: r.quoted_post_category || 'General',
      mediaUrl: r.quoted_post_cover_url || r.quoted_post_media_url || '',
      coverUrl: r.quoted_post_cover_url || r.quoted_post_media_url || '',
      duration: r.quoted_post_duration || '00:00:00',
    };
  }

  if (r.quote_post) {
    try {
      const raw = typeof r.quote_post === 'string' ? JSON.parse(r.quote_post) : r.quote_post;
      if (raw && typeof raw === 'object') {
        return {
          id: raw.id || r.quote_parent_id || undefined,
          author: {
            id: raw.author?.id || undefined,
            name: raw.author?.name || 'Studio Arella Creator',
            role: raw.author?.role || 'Creator',
            avatar: raw.author?.avatar || '/audience/adam-udochi.png',
          },
          title: String(raw.title || '').replace(/^[-–—\s]+/, ''),
          description: raw.description || '',
          category: raw.category || 'General',
          mediaUrl: raw.coverUrl || raw.cover_url || raw.mediaUrl || raw.media_url || '',
          coverUrl: raw.coverUrl || raw.cover_url || raw.mediaUrl || raw.media_url || '',
          duration: raw.duration || raw.duration_text || '00:00:00',
        };
      }
    } catch {
      // ignore parse error
    }
  }

  return null;
}

// ── HELPER: FORMAT POST ROW ──────────────────────────────────────────────────
function formatPostRow(r: any) {
  const quoted = formatQuotedPost(r);
  const quoteId = r.quote_parent_id || quoted?.id || null;

  return {
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
    description: r.description || '',
    content_type: r.content_type,
    mediaUrl: r.cover_url || r.media_url || '',
    cover_url: r.cover_url || r.media_url || '',
    coverUrl: r.cover_url || r.media_url || '',
    duration: r.duration_text || '01:15:00',
    currentTime: '00:04:15',
    progressPercent: 30,
    initialLikes: parseInt(r.likes_count, 10) || 0,
    initialComments: parseInt(r.comments_count, 10) || 0,
    likes_count: parseInt(r.likes_count, 10) || 0,
    comments_count: parseInt(r.comments_count, 10) || 0,
    viewsCount: parseInt(r.views_count, 10) || 0,
    repostsCount: parseInt(r.reposts_count, 10) || 0,
    badgeTheme: r.badge_theme || 'gold',
    isBookmarked: Boolean(r.is_bookmarked),
    hasLiked: Boolean(r.has_liked),
    isPremium: Boolean(r.is_premium),
    isUnlocked: r.is_unlocked ?? (!r.is_premium),
    price: parseFloat(r.price) || 0,
    category: r.category,
    tags: r.tags || [],
    quotedPost: quoted,
    quotePost: quoted,
    quotedPostId: quoteId,
    quoteParentId: quoteId,
    createdAt: r.created_at,
    created_at: r.created_at,
  };
}

// ── GET FEED (ALL / TRENDING / FILTERED BY CATEGORY OR TAG) ──────────────────
export async function getFeed(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || null;
    const { category, tag, view, q, search } = req.query;

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
        COALESCE(c.views_count, 0) AS views_count,
        COALESCE(c.reposts_count, 0) AS reposts_count,
        c.quote_parent_id,
        c.quote_post,
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
        END AS is_unlocked,
        qp.id AS quoted_post_id,
        qp.title AS quoted_post_title,
        qp.description AS quoted_post_description,
        qp.category AS quoted_post_category,
        qp.media_url AS quoted_post_media_url,
        qp.cover_url AS quoted_post_cover_url,
        qp.duration_text AS quoted_post_duration,
        qu.id AS quoted_author_id,
        qu.name AS quoted_author_name,
        COALESCE(NULLIF(qu.creator_niche, ''), CASE WHEN qu.role = 'creator' THEN 'Creator' WHEN qu.role = 'screen_owner' THEN 'Media Partner' WHEN qu.role = 'admin' THEN 'Administrator' ELSE 'Creator' END) AS quoted_author_role,
        COALESCE(qu.avatar, '/audience/adam-udochi.png') AS quoted_author_avatar
      FROM creator_content c
      JOIN users u ON c.creator_id = u.id
      LEFT JOIN user_bookmarks ub ON ub.content_id = c.id AND ub.user_id = $1
      LEFT JOIN creator_content_likes cl ON cl.content_id = c.id AND cl.user_id = $1
      LEFT JOIN premium_content_purchases pcp ON pcp.content_id = c.id AND pcp.user_id = $1
      LEFT JOIN creator_content qp ON c.quote_parent_id = qp.id
      LEFT JOIN users qu ON qp.creator_id = qu.id
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

    const searchQuery = ((q || search || '') as string).trim();
    if (searchQuery) {
      const cleanSearch = searchQuery.replace(/^#/, '').trim();
      const searchTerms = cleanSearch.split(/\s+/).filter((w) => w.length > 2);

      query += ` AND (
        c.title ILIKE $${paramIndex} OR
        c.description ILIKE $${paramIndex} OR
        c.category ILIKE $${paramIndex} OR
        u.name ILIKE $${paramIndex} OR
        $${paramIndex + 1} = ANY(c.tags) OR
        EXISTS (SELECT 1 FROM unnest(c.tags) t WHERE t ILIKE $${paramIndex}) OR
        (c.category IS NOT NULL AND c.category != '' AND $${paramIndex + 2} ILIKE '%' || c.category || '%') OR
        EXISTS (SELECT 1 FROM unnest(c.tags) t WHERE LENGTH(replace(t, '#', '')) >= 3 AND $${paramIndex + 2} ILIKE '%' || replace(t, '#', '') || '%')
      `;
      params.push(`%${cleanSearch}%`);
      params.push(cleanSearch.toLowerCase().startsWith('#') ? cleanSearch.toLowerCase() : `#${cleanSearch.toLowerCase()}`);
      params.push(cleanSearch);
      paramIndex += 3;

      for (const term of searchTerms) {
        query += ` OR c.category ILIKE $${paramIndex} OR EXISTS (SELECT 1 FROM unnest(c.tags) t WHERE t ILIKE $${paramIndex}) OR (c.category IS NOT NULL AND c.category != '' AND $${paramIndex + 1} ILIKE '%' || c.category || '%')`;
        params.push(`%${term}%`);
        params.push(term);
        paramIndex += 2;
      }

      query += `)`;
    }

    if (view === 'trending') {
      query += ` ORDER BY CASE WHEN c.created_at >= NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END DESC, (c.likes_count + c.comments_count + c.views_count) DESC, c.created_at DESC`;
    } else {
      query += ` ORDER BY c.created_at DESC`;
    }

    const { rows } = await pool.query(query, params);

    const formattedPosts = rows.map(formatPostRow);

    return res.json({ posts: formattedPosts });
  } catch (error: any) {
    console.error('getFeed error:', error);
    return res.status(500).json({ error: 'Failed to fetch content feed' });
  }
}

// ── GET TRENDING TOPICS & TAGS ───────────────────────────────────────────────
export async function getTrending(req: Request, res: Response) {
  try {
    // 1. Fetch top tags from published content
    const tagsRes = await pool.query(`
      SELECT 
        TRIM(LOWER(t)) AS tag_name,
        COUNT(*) AS post_count
      FROM creator_content, unnest(tags) AS t
      WHERE status = 'published' AND tags IS NOT NULL
      GROUP BY TRIM(LOWER(t))
      HAVING COUNT(*) > 0
      ORDER BY post_count DESC
      LIMIT 6
    `).catch(() => ({ rows: [] }));

    // 2. Fetch categories with content count & engagement
    const catRes = await pool.query(`
      SELECT 
        category,
        COUNT(*) AS post_count,
        SUM(COALESCE(likes_count, 0) + COALESCE(comments_count, 0) + COALESCE(views_count, 0)) AS total_engagement
      FROM creator_content
      WHERE status = 'published' AND category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY total_engagement DESC, post_count DESC
      LIMIT 5
    `).catch(() => ({ rows: [] }));

    // 3. Fetch top engagement posts for headline trends
    const topPostsRes = await pool.query(`
      SELECT 
        title,
        category,
        COALESCE(views_count, 0) + COALESCE(likes_count, 0) * 10 + COALESCE(comments_count, 0) * 20 AS engagement_score
      FROM creator_content
      WHERE status = 'published'
      ORDER BY engagement_score DESC, created_at DESC
      LIMIT 4
    `).catch(() => ({ rows: [] }));

    const trends: any[] = [];
    let idx = 1;

    // Add top category trends
    catRes.rows.forEach((cat: any) => {
      trends.push({
        id: `trend-cat-${idx++}`,
        category: `${cat.category} · Trending`,
        title: cat.category.toUpperCase(),
        postCount: `${parseInt(cat.post_count, 10) * 12 + 15}K posts`,
        query: cat.category,
      });
    });

    // Add headline post trends
    topPostsRes.rows.forEach((p: any) => {
      const cleanTitle = p.title.replace(/^[-–—\s]+/, '').trim();
      if (cleanTitle && !trends.some((t) => t.title.toLowerCase() === cleanTitle.toLowerCase())) {
        trends.push({
          id: `trend-post-${idx++}`,
          category: p.category ? `${p.category} · Trending` : 'Trending in Nigeria',
          title: cleanTitle.length > 32 ? cleanTitle.slice(0, 32) + '...' : cleanTitle,
          postCount: `${Math.floor((p.engagement_score || 50) * 1.5 + 20)}K posts`,
          query: cleanTitle,
        });
      }
    });

    // Add tag trends
    tagsRes.rows.forEach((t: any) => {
      const tagLabel = t.tag_name.startsWith('#') ? t.tag_name : `#${t.tag_name}`;
      if (!trends.some((tr) => tr.title.toLowerCase() === tagLabel.toLowerCase())) {
        trends.push({
          id: `trend-tag-${idx++}`,
          category: 'Trending',
          title: tagLabel,
          postCount: `${parseInt(t.post_count, 10) * 8 + 10}K posts`,
          query: t.tag_name.replace('#', ''),
        });
      }
    });

    // Fallback defaults if database has very few items
    if (trends.length === 0) {
      trends.push(
        { id: 't-1', category: 'Trending in Nigeria', title: 'THE GREATEST OF ALL TIME', postCount: '84.5K posts', query: 'wealth' },
        { id: 't-2', category: 'Sports · Trending', title: 'Ororo', postCount: '32.1K posts', query: 'sports' },
        { id: 't-3', category: 'Entertainment · Trending', title: '#StudioArella', postCount: '45.8K posts', query: 'entertainment' },
        { id: 't-4', category: 'Business · Trending', title: 'African Podcasting', postCount: '19.4K posts', query: 'business' }
      );
    }

    return res.json({ trends });
  } catch (error: any) {
    console.error('getTrending error:', error);
    return res.json({
      trends: [
        { id: 't-1', category: 'Trending in Nigeria', title: 'THE GREATEST OF ALL TIME', postCount: '84.5K posts', query: 'wealth' },
        { id: 't-2', category: 'Sports · Trending', title: 'Ororo', postCount: '32.1K posts', query: 'sports' },
        { id: 't-3', category: 'Entertainment · Trending', title: '#StudioArella', postCount: '45.8K posts', query: 'entertainment' },
        { id: 't-4', category: 'Business · Trending', title: 'African Podcasting', postCount: '19.4K posts', query: 'business' }
      ],
    });
  }
}

// ── GET SINGLE CONTENT POST DETAIL ────────────────────────────────────────────
export async function getContentById(req: Request, res: Response) {
  try {
    const contentId = req.params.id;
    const userId = (req as any).user?.id || null;

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
        COALESCE(c.views_count, 0) AS views_count,
        COALESCE(c.reposts_count, 0) AS reposts_count,
        c.quote_parent_id,
        c.quote_post,
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
          WHEN c.creator_id = $2 THEN true
          WHEN pcp.id IS NOT NULL THEN true
          ELSE false 
        END AS is_unlocked,
        qp.id AS quoted_post_id,
        qp.title AS quoted_post_title,
        qp.description AS quoted_post_description,
        qp.category AS quoted_post_category,
        qp.media_url AS quoted_post_media_url,
        qp.cover_url AS quoted_post_cover_url,
        qp.duration_text AS quoted_post_duration,
        qu.id AS quoted_author_id,
        qu.name AS quoted_author_name,
        COALESCE(NULLIF(qu.creator_niche, ''), CASE WHEN qu.role = 'creator' THEN 'Creator' WHEN qu.role = 'screen_owner' THEN 'Media Partner' WHEN qu.role = 'admin' THEN 'Administrator' ELSE 'Creator' END) AS quoted_author_role,
        COALESCE(qu.avatar, '/audience/adam-udochi.png') AS quoted_author_avatar
      FROM creator_content c
      JOIN users u ON c.creator_id = u.id
      LEFT JOIN user_bookmarks ub ON ub.content_id = c.id AND ub.user_id = $2
      LEFT JOIN creator_content_likes cl ON cl.content_id = c.id AND cl.user_id = $2
      LEFT JOIN premium_content_purchases pcp ON pcp.content_id = c.id AND pcp.user_id = $2
      LEFT JOIN creator_content qp ON c.quote_parent_id = qp.id
      LEFT JOIN users qu ON qp.creator_id = qu.id
      WHERE c.id = $1
    `;

    const { rows } = await pool.query(query, [contentId, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const formattedPost = formatPostRow(rows[0]);

    return res.json({
      post: formattedPost,
      ...formattedPost
    });
  } catch (error: any) {
    console.error('getContentById error:', error);
    return res.status(500).json({ error: 'Failed to fetch content' });
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
        COALESCE(c.views_count, 0) AS views_count,
        COALESCE(c.reposts_count, 0) AS reposts_count,
        c.quote_parent_id,
        c.quote_post,
        c.badge_theme,
        c.created_at,
        u.id AS author_id,
        u.name AS author_name,
        COALESCE(u.avatar, '/audience/adam-udochi.png') AS author_avatar,
        COALESCE(NULLIF(u.creator_niche, ''), CASE WHEN u.role = 'creator' THEN 'Creator' WHEN u.role = 'screen_owner' THEN 'Media Partner' WHEN u.role = 'admin' THEN 'Administrator' ELSE 'Creator' END) AS author_role,
        u.creator_tier AS author_tier,
        true AS is_bookmarked,
        CASE WHEN cl.id IS NOT NULL THEN true ELSE false END AS has_liked,
        true AS is_unlocked,
        qp.id AS quoted_post_id,
        qp.title AS quoted_post_title,
        qp.description AS quoted_post_description,
        qp.category AS quoted_post_category,
        qp.media_url AS quoted_post_media_url,
        qp.cover_url AS quoted_post_cover_url,
        qp.duration_text AS quoted_post_duration,
        qu.id AS quoted_author_id,
        qu.name AS quoted_author_name,
        COALESCE(NULLIF(qu.creator_niche, ''), CASE WHEN qu.role = 'creator' THEN 'Creator' WHEN qu.role = 'screen_owner' THEN 'Media Partner' WHEN qu.role = 'admin' THEN 'Administrator' ELSE 'Creator' END) AS quoted_author_role,
        COALESCE(qu.avatar, '/audience/adam-udochi.png') AS quoted_author_avatar
      FROM user_bookmarks ub
      JOIN creator_content c ON ub.content_id = c.id
      JOIN users u ON c.creator_id = u.id
      LEFT JOIN creator_content_likes cl ON cl.content_id = c.id AND cl.user_id = $1
      LEFT JOIN creator_content qp ON c.quote_parent_id = qp.id
      LEFT JOIN users qu ON qp.creator_id = qu.id
      WHERE ub.user_id = $1 AND c.status = 'published'
      ORDER BY ub.created_at DESC
    `;

    const { rows } = await pool.query(query, [userId]);

    const formattedPosts = rows.map(formatPostRow);

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
      badge_theme = 'gold',
      quotedPostId,
      quote_parent_id,
      quoteParentId,
      quotedPost,
      quote_post,
      quotePost
    } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const targetQuotedId = quotedPostId || quote_parent_id || quoteParentId || null;
    const isQuoteUuid = targetQuotedId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetQuotedId);

    let finalContentType = content_type;
    let quotePostData = quotedPost || quote_post || quotePost || null;

    if (isQuoteUuid) {
      if (!content_type || content_type === 'post') {
        finalContentType = 'quote';
      }

      // If snapshot is not provided, fetch original post from database
      if (!quotePostData || !quotePostData.author) {
        try {
          const originalRes = await pool.query(
            `SELECT 
              c.id, c.title, c.description, c.category, c.cover_url, c.media_url, c.duration_text,
              u.id AS author_id, u.name AS author_name,
              COALESCE(NULLIF(u.creator_niche, ''), CASE WHEN u.role = 'creator' THEN 'Creator' WHEN u.role = 'screen_owner' THEN 'Media Partner' WHEN u.role = 'admin' THEN 'Administrator' ELSE 'Creator' END) AS author_role,
              COALESCE(u.avatar, '/audience/adam-udochi.png') AS author_avatar
            FROM creator_content c
            JOIN users u ON c.creator_id = u.id
            WHERE c.id = $1`,
            [targetQuotedId]
          );

          if (originalRes.rows.length > 0) {
            const orig = originalRes.rows[0];
            quotePostData = {
              id: orig.id,
              author: {
                id: orig.author_id,
                name: orig.author_name || 'Studio Arella Creator',
                role: orig.author_role || 'Creator',
                avatar: orig.author_avatar || '/audience/adam-udochi.png'
              },
              title: String(orig.title || '').replace(/^[-–—\s]+/, ''),
              description: orig.description || '',
              category: orig.category || 'General',
              mediaUrl: orig.cover_url || orig.media_url || '',
              coverUrl: orig.cover_url || orig.media_url || '',
              duration: orig.duration_text || '00:00:00'
            };
          }
        } catch (origErr) {
          console.warn('Failed to fetch quoted post details for snapshot:', origErr);
        }
      }

      // Increment reposts_count on original post
      try {
        await pool.query(
          'UPDATE creator_content SET reposts_count = COALESCE(reposts_count, 0) + 1 WHERE id = $1',
          [targetQuotedId]
        );
      } catch (repErr) {
        console.warn('Failed to increment reposts_count:', repErr);
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO creator_content (
        creator_id, title, description, content_type, media_url, cover_url, 
        duration_text, category, tags, is_premium, price, badge_theme, status,
        quote_parent_id, quote_post
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'published', $13, $14)
      RETURNING *`,
      [
        creatorId,
        title.trim(),
        description || '',
        finalContentType,
        media_url || '',
        cover_url || '',
        duration_text,
        category,
        Array.isArray(tags) ? tags : [],
        Boolean(is_premium),
        parseFloat(String(price)) || 0,
        badge_theme,
        isQuoteUuid ? targetQuotedId : null,
        quotePostData ? JSON.stringify(quotePostData) : null
      ]
    );

    const created = rows[0];

    // Fetch author info for response
    const authorRes = await pool.query(
      `SELECT name, avatar, creator_niche, creator_tier, role FROM users WHERE id = $1`,
      [creatorId]
    );
    const author = authorRes.rows[0] || {};
    const authorName = author.name || 'Studio Arella Creator';
    const authorRole = author.creator_niche || (author.role === 'creator' ? 'Creator' : author.role === 'screen_owner' ? 'Media Partner' : 'Creator');
    const authorAvatar = author.avatar || '/audience/adam-udochi.png';

    const formattedCreatedPost = {
      id: created.id,
      author: {
        id: creatorId,
        name: authorName,
        role: authorRole,
        avatar: authorAvatar,
        tier: author.creator_tier || 'pro',
      },
      author_name: authorName,
      author_role: authorRole,
      author_avatar: authorAvatar,
      author_tier: author.creator_tier || 'pro',
      title: String(created.title || 'Studio Podcast').replace(/^[-–—\s]+/, ''),
      description: created.description || '',
      content_type: created.content_type,
      mediaUrl: created.cover_url || created.media_url || '',
      cover_url: created.cover_url || created.media_url || '',
      coverUrl: created.cover_url || created.media_url || '',
      duration: created.duration_text || '00:45:00',
      category: created.category,
      tags: created.tags || [],
      isPremium: created.is_premium,
      price: parseFloat(created.price) || 0,
      badgeTheme: created.badge_theme,
      likes_count: 0,
      comments_count: 0,
      viewsCount: 0,
      repostsCount: 0,
      quotedPost: quotePostData,
      quotePost: quotePostData,
      quotedPostId: created.quote_parent_id,
      quoteParentId: created.quote_parent_id,
      created_at: created.created_at,
      createdAt: created.created_at
    };

    return res.status(201).json({
      message: 'Content published successfully',
      post: formattedCreatedPost,
      ...formattedCreatedPost
    });
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

