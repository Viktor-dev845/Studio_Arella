import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ reposts: [] }, { status: 400 });

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = `
      SELECT 
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
        c.created_at,
        u.id AS author_id,
        u.name AS author_name,
        COALESCE(u.handle, LOWER(REGEXP_REPLACE(u.name, '[^a-zA-Z0-9]', '', 'g'))) AS author_handle,
        COALESCE(u.avatar, '/audience/adam-udochi.png') AS author_avatar,
        COALESCE(u.creator_niche, 'Creator') AS author_role,
        COALESCE(u.creator_tier, 'free') AS author_tier
      FROM creator_content_reposts rep
      JOIN creator_content c ON rep.content_id = c.id
      JOIN users u ON c.creator_id = u.id
      WHERE 
    `;

    if (isUuid) {
      query += `rep.user_id = $1`;
    } else {
      query += `rep.user_id IN (SELECT id FROM users WHERE LOWER(name) = LOWER($1) OR LOWER(handle) = LOWER($1))`;
    }

    query += ` ORDER BY rep.created_at DESC LIMIT 20`;

    const { rows } = await pool.query(query, [id]);

    const formattedReposts = rows.map((r: any) => ({
      id: r.id,
      author: {
        id: r.author_id,
        name: r.author_name,
        handle: r.author_handle,
        role: r.author_role,
        avatar: r.author_avatar,
        tier: r.author_tier,
      },
      author_name: r.author_name,
      author_role: r.author_role,
      author_avatar: r.author_avatar,
      author_tier: r.author_tier,
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
      hasReposted: true,
      isPremium: r.is_premium,
      isUnlocked: !r.is_premium,
      price: r.price ? parseFloat(r.price) : 0,
    }));

    return NextResponse.json({ reposts: formattedReposts });
  } catch (error: any) {
    console.error('Error fetching creator reposts:', error);
    return NextResponse.json({ reposts: [] });
  }
}
