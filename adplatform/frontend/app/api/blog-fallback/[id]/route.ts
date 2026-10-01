import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});
export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    const result = await pool.query(`SELECT * FROM blog_posts WHERE id = $1`, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const row = result.rows[0];
    const post = {
      id: row.id,
      title: row.title,
      category: row.category,
      excerpt: row.excerpt,
      content: row.content,
      authorName: row.author_name,
      imageUrl: row.image_url,
      status: row.status,
      publishedAt: row.published_at,
      readingTimeMinutes: row.reading_time_minutes,
      likesCount: Number(row.likes_count || 0),
      viewsCount: Number(row.views_count || 0),
      commentsCount: Number(row.comments_count || 0),
      liked: false // Default to false for public view
    };

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
