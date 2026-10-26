import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');

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
        COALESCE(u.creator_niche, 'UI/UX Designer') AS author_role,
        u.creator_tier AS author_tier
      FROM creator_content c
      JOIN users u ON c.creator_id = u.id
      WHERE c.status = 'published'
    `;

    const params: any[] = [];
    let paramIndex = 1;

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
      query += ` ORDER BY (c.likes_count + c.comments_count + c.views_count) DESC, c.created_at DESC`;
    } else {
      query += ` ORDER BY c.created_at DESC`;
    }

    const { rows } = await pool.query(query, params);

    const formattedPosts = rows.map((r: any) => ({
      id: r.id,
      author: {
        id: r.author_id,
        name: r.author_name,
        role: r.author_role,
        avatar: r.author_avatar,
        tier: r.author_tier,
      },
      title: r.title.startsWith('-') ? r.title : `-${r.title}`,
      description: r.description,
      mediaUrl: r.cover_url || r.media_url || '/audience/mockup-sphinx.png',
      duration: r.duration_text || '01:15:00',
      currentTime: '00:04:15',
      progressPercent: 30,
      initialLikes: parseInt(r.likes_count, 10) || 0,
      initialComments: parseInt(r.comments_count, 10) || 0,
      badgeTheme: r.badge_theme || 'gold',
      isBookmarked: false,
      hasLiked: false,
      isPremium: r.is_premium,
      isUnlocked: !r.is_premium,
      price: parseFloat(r.price) || 0,
      category: r.category,
      tags: r.tags || [],
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Content Feed API Route Error:', error);
    return NextResponse.json({ posts: [] }, { status: 500 });
  }
}
