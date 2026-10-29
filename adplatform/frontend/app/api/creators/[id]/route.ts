import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('currentUserId');

    if (!id) {
      return NextResponse.json({ error: 'Creator ID is required' }, { status: 400 });
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // 1. Fetch Creator User Profile
    let userQuery = `
      SELECT 
        u.id,
        u.name,
        u.handle,
        u.role,
        u.email,
        COALESCE(u.creator_niche, 'Creator') AS creator_niche,
        u.creator_tier,
        u.creator_verified,
        COALESCE(u.avatar, '/audience/adam-udochi.png') AS avatar,
        COALESCE(u.banner_url, '/audience/covers/culture.jpg') AS banner_url,
        COALESCE(u.bio, 'Audio creator & broadcaster on Studio Arella') AS bio,
        COALESCE(u.location, 'Lagos, Nigeria') AS location
      FROM users u
      WHERE 
    `;

    if (isUuid) {
      userQuery += `u.id = $1`;
    } else {
      userQuery += `LOWER(u.name) = LOWER($1) OR LOWER(u.handle) = LOWER($1)`;
    }

    const userRes = await pool.query(userQuery, [id]);

    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const creator = userRes.rows[0];
    const creatorId = creator.id;

    // 2. Followers & Following Counts
    const [followersRes, followingRes] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM follows WHERE followed_id = $1', [creatorId]),
      pool.query('SELECT COUNT(*) AS count FROM follows WHERE follower_id = $1', [creatorId])
    ]);

    const followersCount = parseInt(followersRes.rows[0]?.count || '0', 10);
    const followingCount = parseInt(followingRes.rows[0]?.count || '0', 10);

    // 3. Is current user following this creator?
    let isFollowing = false;
    if (currentUserId && currentUserId !== creatorId) {
      const followCheck = await pool.query(
        'SELECT 1 FROM follows WHERE follower_id = $1 AND followed_id = $2 LIMIT 1',
        [currentUserId, creatorId]
      );
      isFollowing = followCheck.rows.length > 0;
    }

    // 4. Fetch Mutual or Featured Followers from PostgreSQL for Social Proof
    let socialProofUsers: any[] = [];
    let isMutualProof = false;

    if (currentUserId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUserId) && currentUserId !== creatorId) {
      const mutualRes = await pool.query(
        `SELECT u.id, u.name, COALESCE(u.handle, LOWER(REGEXP_REPLACE(u.name, '[^a-zA-Z0-9]', '', 'g'))) AS handle, COALESCE(u.avatar, '/audience/adam-udochi.png') AS avatar
         FROM follows f1
         JOIN follows f2 ON f1.follower_id = f2.followed_id AND f2.follower_id = $2
         JOIN users u ON f1.follower_id = u.id
         WHERE f1.followed_id = $1
         LIMIT 3`,
        [creatorId, currentUserId]
      );
      if (mutualRes.rows.length > 0) {
        socialProofUsers = mutualRes.rows;
        isMutualProof = true;
      }
    }

    if (socialProofUsers.length === 0) {
      const followersRes = await pool.query(
        `SELECT u.id, u.name, COALESCE(u.handle, LOWER(REGEXP_REPLACE(u.name, '[^a-zA-Z0-9]', '', 'g'))) AS handle, COALESCE(u.avatar, '/audience/adam-udochi.png') AS avatar
         FROM follows f
         JOIN users u ON f.follower_id = u.id
         WHERE f.followed_id = $1
         LIMIT 3`,
        [creatorId]
      );
      if (followersRes.rows.length > 0) {
        socialProofUsers = followersRes.rows;
      } else {
        const platformUsers = await pool.query(
          `SELECT u.id, u.name, COALESCE(u.handle, LOWER(REGEXP_REPLACE(u.name, '[^a-zA-Z0-9]', '', 'g'))) AS handle, COALESCE(u.avatar, '/audience/adam-udochi.png') AS avatar
           FROM users u
           WHERE u.id != $1 AND (u.role = 'creator' OR u.creator_niche IS NOT NULL)
           ORDER BY u.created_at DESC
           LIMIT 3`,
          [creatorId]
        );
        socialProofUsers = platformUsers.rows;
      }
    }

    // 5. Fetch Creator's Published Content
    const contentRes = await pool.query(
      `SELECT 
        c.id,
        c.title,
        c.description,
        c.content_type,
        c.media_url,
        c.cover_url,
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
        c.created_at
      FROM creator_content c
      WHERE c.creator_id = $1 AND c.status = 'published'
      ORDER BY c.created_at DESC`,
      [creatorId]
    );

    const formattedPosts = contentRes.rows.map((r: any) => ({
      id: r.id,
      author: {
        id: creator.id,
        name: creator.name,
        role: creator.creator_niche || 'Creator',
        avatar: creator.avatar,
        tier: creator.creator_tier || 'free',
      },
      author_name: creator.name,
      author_role: creator.creator_niche || 'Creator',
      author_avatar: creator.avatar,
      author_tier: creator.creator_tier || 'free',
      title: String(r.title || 'Studio Podcast').replace(/^[-–—\s]+/, ''),
      description: r.description,
      mediaUrl: r.cover_url || r.media_url || '',
      cover_url: r.cover_url || r.media_url || '',
      duration: r.duration_text || '01:15:00',
      currentTime: '00:00:00',
      progressPercent: 0,
      initialLikes: parseInt(r.likes_count, 10) || 0,
      initialComments: parseInt(r.comments_count, 10) || 0,
      viewsCount: parseInt(r.views_count, 10) || 0,
      repostsCount: parseInt(r.reposts_count, 10) || 0,
      quoteParentId: r.quote_parent_id || null,
      quotePost: typeof r.quote_post === 'string' ? JSON.parse(r.quote_post) : (r.quote_post || null),
      badgeTheme: r.badge_theme || 'gold',
      isBookmarked: false,
      hasLiked: false,
      isPremium: r.is_premium,
      isUnlocked: !r.is_premium,
      price: r.price ? parseFloat(r.price) : 0,
    }));

    return NextResponse.json({
      creator,
      stats: {
        followersCount,
        followingCount,
        postsCount: formattedPosts.length,
      },
      isFollowing,
      socialProof: {
        users: socialProofUsers,
        count: followersCount,
        isMutual: isMutualProof,
      },
      posts: formattedPosts,
    });
  } catch (error: any) {
    console.error('Fetch creator profile error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load creator' }, { status: 500 });
  }
}
