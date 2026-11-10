import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT p.*,
        (SELECT COUNT(*) FROM blog_post_likes l WHERE l.post_id = p.id) AS table_likes_count
       FROM blog_posts p
       WHERE p.status = 'published'
       ORDER BY p.published_at DESC
       LIMIT 20`
    );
    
    const posts = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      excerpt: row.excerpt,
      content: row.content,
      category: row.category,
      authorName: row.author_name,
      imageUrl: row.image_url,
      readingTimeMinutes: row.reading_time_minutes,
      likesCount: Math.max(Number(row.likes_count || 0), Number(row.table_likes_count || 0)),
      viewsCount: Number(row.views_count || 0),
      commentsCount: Number(row.comments_count || 0),
      publishedAt: row.published_at,
      liked: false
    }));

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Fallback DB Error:', error);
    return NextResponse.json({ posts: [] }, { status: 500 });
  }
}
