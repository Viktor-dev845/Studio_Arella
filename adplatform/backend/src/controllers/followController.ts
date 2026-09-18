import { RequestHandler } from 'express';
import pool from '../db/pool';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from '../services/notificationService';

const ROLE_LABELS: Record<string, string> = {
  advertiser: 'Advertiser',
  screen_owner: 'Screen Owner',
  admin: 'Studio Arella Team',
};

// ── Follow a user ─────────────────────────────────────────────────────────
export const followUser: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const targetId = req.params.userId;
    if (targetId === authReq.user?.id) {
      res.status(400).json({ message: "You can't follow yourself" }); return;
    }
    const target = await pool.query('SELECT id, name FROM users WHERE id = $1', [targetId]);
    if (!target.rows[0]) { res.status(404).json({ message: 'User not found' }); return; }

    const result = await pool.query(
      `INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)
       ON CONFLICT (follower_id, followed_id) DO NOTHING RETURNING id`,
      [authReq.user?.id, targetId]
    );

    if (result.rows.length > 0) {
      const me = await pool.query('SELECT name FROM users WHERE id = $1', [authReq.user?.id]);
      createNotification({
        user_id: targetId,
        type: 'new_follower',
        title: 'New follower',
        body: `${me.rows[0]?.name || 'Someone'} started following you.`,
        link: '/followers',
      });
    }

    res.json({ following: true });
  } catch (err) {
    console.error('Follow error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Unfollow a user ───────────────────────────────────────────────────────
export const unfollowUser: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    await pool.query(
      'DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2',
      [authReq.user?.id, req.params.userId]
    );
    res.json({ following: false });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const mapProfile = (row: any) => ({
  id: row.id,
  name: row.name,
  avatar: row.avatar || null,
  role: row.role,
  roleLabel: ROLE_LABELS[row.role] || row.role,
  bio: row.bio || null,
  businessName: row.business_name || null,
  followerCount: Number(row.follower_count || 0),
});

// ── People who follow me ──────────────────────────────────────────────────
export const getFollowers: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { limit = 50, page = 1 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const myId = authReq.user?.id;

    const lastSeenRes = await pool.query('SELECT followers_last_seen_at FROM users WHERE id = $1', [myId]);
    const lastSeenAt: string | null = lastSeenRes.rows[0]?.followers_last_seen_at || null;

    const result = await pool.query(
      `SELECT u.id, u.name, u.avatar, u.role, u.bio, u.business_name,
         f.created_at as followed_at,
         (f.created_at > COALESCE($2::timestamptz, 'epoch'::timestamptz)) as is_new,
         EXISTS(SELECT 1 FROM follows f2 WHERE f2.follower_id = $1 AND f2.followed_id = u.id) as i_follow_back,
         (SELECT COUNT(*) FROM follows f3 WHERE f3.followed_id = u.id) as follower_count
       FROM follows f
       JOIN users u ON u.id = f.follower_id
       WHERE f.followed_id = $1
       ORDER BY f.created_at DESC
       LIMIT $3 OFFSET $4`,
      [myId, lastSeenAt, Number(limit), offset]
    );

    const countRes = await pool.query('SELECT COUNT(*) FROM follows WHERE followed_id = $1', [myId]);

    // Mark as seen now that we've computed which ones were new relative to the old timestamp.
    await pool.query('UPDATE users SET followers_last_seen_at = NOW() WHERE id = $1', [myId]);

    res.json({
      followers: result.rows.map((r) => ({ ...mapProfile(r), isNew: r.is_new, iFollowBack: r.i_follow_back })),
      total: parseInt(countRes.rows[0].count),
    });
  } catch (err) {
    console.error('Get followers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── People I follow ───────────────────────────────────────────────────────
export const getFollowing: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { limit = 50, page = 1 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const myId = authReq.user?.id;

    const result = await pool.query(
      `SELECT u.id, u.name, u.avatar, u.role, u.bio, u.business_name,
         (SELECT COUNT(*) FROM follows f3 WHERE f3.followed_id = u.id) as follower_count
       FROM follows f
       JOIN users u ON u.id = f.followed_id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [myId, Number(limit), offset]
    );

    const countRes = await pool.query('SELECT COUNT(*) FROM follows WHERE follower_id = $1', [myId]);

    res.json({
      following: result.rows.map((r) => ({ ...mapProfile(r), iFollowBack: true })),
      total: parseInt(countRes.rows[0].count),
    });
  } catch (err) {
    console.error('Get following error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
