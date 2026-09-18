import { RequestHandler } from 'express';
import pool from '../db/pool';
import { AuthRequest } from '../middleware/auth';

const estimateReadingMinutes = (content: string) => Math.max(1, Math.round(content.trim().split(/\s+/).length / 200));

const mapPost = (row: any) => ({
  id: row.id,
  title: row.title,
  excerpt: row.excerpt,
  content: row.content,
  category: row.category,
  authorName: row.author_name,
  imageUrl: row.image_url,
  readingTimeMinutes: row.reading_time_minutes,
  likesCount: Number(row.likes_count || 0),
  viewsCount: Number(row.views_count || 0),
  commentsCount: Number(row.comments_count || 0),
  publishedAt: row.published_at,
  liked: row.liked === true || row.liked === 't',
});

// ── List published posts (public) ─────────────────────────────────────────
export const getBlogPosts: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { limit = 20, page = 1 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const myId = authReq.user?.id || null;

    const result = await pool.query(
      `SELECT p.*,
        (SELECT COUNT(*) FROM blog_post_likes l WHERE l.post_id = p.id) as likes_count,
        EXISTS(SELECT 1 FROM blog_post_likes l2 WHERE l2.post_id = p.id AND l2.user_id = $1) as liked
       FROM blog_posts p
       WHERE p.status = 'published'
       ORDER BY p.published_at DESC
       LIMIT $2 OFFSET $3`,
      [myId, Number(limit), offset]
    );
    const countRes = await pool.query("SELECT COUNT(*) FROM blog_posts WHERE status = 'published'");

    res.json({ posts: result.rows.map(mapPost), total: parseInt(countRes.rows[0].count) });
  } catch (err) {
    console.error('Get blog posts error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Single post (public) — increments a real view count each load ─────────
export const getBlogPost: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const myId = authReq.user?.id || null;
    const updated = await pool.query(
      `UPDATE blog_posts SET views_count = views_count + 1 WHERE id = $1 AND status = 'published' RETURNING id`,
      [req.params.id]
    );
    if (updated.rows.length === 0) { res.status(404).json({ message: 'Post not found' }); return; }

    const result = await pool.query(
      `SELECT p.*,
        (SELECT COUNT(*) FROM blog_post_likes l WHERE l.post_id = p.id) as likes_count,
        EXISTS(SELECT 1 FROM blog_post_likes l2 WHERE l2.post_id = p.id AND l2.user_id = $1) as liked
       FROM blog_posts p WHERE p.id = $2`,
      [myId, req.params.id]
    );
    res.json(mapPost(result.rows[0]));
  } catch (err) {
    console.error('Get blog post error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const likeBlogPost: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    await pool.query(
      `INSERT INTO blog_post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT (post_id, user_id) DO NOTHING`,
      [req.params.id, authReq.user?.id]
    );
    const count = await pool.query('SELECT COUNT(*) FROM blog_post_likes WHERE post_id = $1', [req.params.id]);
    res.json({ liked: true, likesCount: parseInt(count.rows[0].count) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const unlikeBlogPost: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    await pool.query('DELETE FROM blog_post_likes WHERE post_id = $1 AND user_id = $2', [req.params.id, authReq.user?.id]);
    const count = await pool.query('SELECT COUNT(*) FROM blog_post_likes WHERE post_id = $1', [req.params.id]);
    res.json({ liked: false, likesCount: parseInt(count.rows[0].count) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Admin: create/update/delete ────────────────────────────────────────────
export const createBlogPost: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== 'admin') { res.status(403).json({ message: 'Admin only' }); return; }
  try {
    const { title, excerpt, content, category, author_name, image_url, status } = req.body;
    if (!title || !content) { res.status(400).json({ message: 'Title and content are required' }); return; }
    const result = await pool.query(
      `INSERT INTO blog_posts (title, excerpt, content, category, author_name, image_url, reading_time_minutes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, excerpt || null, content, category || null, author_name || authReq.user?.name, image_url || null, estimateReadingMinutes(content), status || 'published']
    );
    res.status(201).json(mapPost({ ...result.rows[0], likes_count: 0, liked: false }));
  } catch (err) {
    console.error('Create blog post error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBlogPost: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== 'admin') { res.status(403).json({ message: 'Admin only' }); return; }
  try {
    const { title, excerpt, content, category, author_name, image_url, status } = req.body;
    const result = await pool.query(
      `UPDATE blog_posts SET
        title = COALESCE($1, title), excerpt = COALESCE($2, excerpt), content = COALESCE($3, content),
        category = COALESCE($4, category), author_name = COALESCE($5, author_name), image_url = COALESCE($6, image_url),
        status = COALESCE($7, status),
        reading_time_minutes = CASE WHEN $3::text IS NOT NULL THEN $8 ELSE reading_time_minutes END,
        updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [title, excerpt, content, category, author_name, image_url, status, content ? estimateReadingMinutes(content) : null, req.params.id]
    );
    if (!result.rows[0]) { res.status(404).json({ message: 'Post not found' }); return; }
    res.json(mapPost({ ...result.rows[0], likes_count: 0, liked: false }));
  } catch (err) {
    console.error('Update blog post error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBlogPost: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== 'admin') { res.status(403).json({ message: 'Admin only' }); return; }
  try {
    const result = await pool.query('DELETE FROM blog_posts WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) { res.status(404).json({ message: 'Post not found' }); return; }
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Admin: list all posts, including drafts ────────────────────────────────
export const getAllBlogPostsAdmin: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== 'admin') { res.status(403).json({ message: 'Admin only' }); return; }
  try {
    const result = await pool.query(
      `SELECT p.*, (SELECT COUNT(*) FROM blog_post_likes l WHERE l.post_id = p.id) as likes_count
       FROM blog_posts p ORDER BY p.created_at DESC`
    );
    res.json({ posts: result.rows.map((r) => mapPost({ ...r, liked: false })) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
