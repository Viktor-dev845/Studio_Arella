import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});
export const dynamic = 'force-dynamic';

let schemaChecked = false;
async function ensureColumns() {
  if (schemaChecked) return;
  try {
    await pool.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;`);
    schemaChecked = true;
  } catch {
    // Ignore if already exists or read-only
  }
}

function formatRow(row: any) {
  const tableLikes = Number(row.table_likes_count || 0);
  const colLikes = Number(row.likes_count || 0);
  return {
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
    likesCount: Math.max(colLikes, tableLikes),
    viewsCount: Number(row.views_count || 0),
    commentsCount: Number(row.comments_count || 0),
    liked: Boolean(row.liked)
  };
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await ensureColumns();
    const params = await context.params;
    const id = params.id;
    const url = new URL(request.url);
    const skipViewIncrement = url.searchParams.get('noView') === '1';

    let result;
    if (skipViewIncrement) {
      result = await pool.query(
        `SELECT p.*,
          (SELECT COUNT(*) FROM blog_post_likes l WHERE l.post_id = p.id) AS table_likes_count
         FROM blog_posts p
         WHERE p.id = $1`,
        [id]
      );
    } else {
      result = await pool.query(
        `UPDATE blog_posts p
         SET views_count = COALESCE(p.views_count, 0) + 1
         WHERE p.id = $1
         RETURNING p.*,
           (SELECT COUNT(*) FROM blog_post_likes l WHERE l.post_id = p.id) AS table_likes_count`,
        [id]
      );
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(formatRow(result.rows[0]));
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await ensureColumns();
    const params = await context.params;
    const id = params.id;
    const body = await request.json().catch(() => ({}));
    const action = body.action as 'like' | 'unlike' | 'share' | 'view';
    const userId = body.userId as string | undefined;

    if (action === 'like') {
      if (userId) {
        await pool.query(
          `INSERT INTO blog_post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT (post_id, user_id) DO NOTHING`,
          [id, userId]
        ).catch(() => {});
      }
      const res = await pool.query(
        `UPDATE blog_posts p
         SET likes_count = COALESCE(p.likes_count, 0) + 1
         WHERE p.id = $1
         RETURNING p.*,
           (SELECT COUNT(*) FROM blog_post_likes l WHERE l.post_id = p.id) AS table_likes_count`,
        [id]
      );
      if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ ...formatRow(res.rows[0]), liked: true });
    }

    if (action === 'unlike') {
      if (userId) {
        await pool.query(
          `DELETE FROM blog_post_likes WHERE post_id = $1 AND user_id = $2`,
          [id, userId]
        ).catch(() => {});
      }
      const res = await pool.query(
        `UPDATE blog_posts p
         SET likes_count = GREATEST(0, COALESCE(p.likes_count, 0) - 1)
         WHERE p.id = $1
         RETURNING p.*,
           (SELECT COUNT(*) FROM blog_post_likes l WHERE l.post_id = p.id) AS table_likes_count`,
        [id]
      );
      if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ ...formatRow(res.rows[0]), liked: false });
    }

    if (action === 'share') {
      const res = await pool.query(
        `UPDATE blog_posts p
         SET comments_count = COALESCE(p.comments_count, 0) + 1
         WHERE p.id = $1
         RETURNING p.*,
           (SELECT COUNT(*) FROM blog_post_likes l WHERE l.post_id = p.id) AS table_likes_count`,
        [id]
      );
      if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(formatRow(res.rows[0]));
    }

    // Default: view increment
    const res = await pool.query(
      `UPDATE blog_posts p
       SET views_count = COALESCE(p.views_count, 0) + 1
       WHERE p.id = $1
       RETURNING p.*,
         (SELECT COUNT(*) FROM blog_post_likes l WHERE l.post_id = p.id) AS table_likes_count`,
      [id]
    );
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(formatRow(res.rows[0]));
  } catch (error) {
    console.error('Error updating blog post metrics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
