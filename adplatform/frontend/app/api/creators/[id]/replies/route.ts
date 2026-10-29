import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ replies: [] }, { status: 400 });

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = `
      SELECT 
        comm.id,
        comm.comment_text,
        comm.created_at,
        c.id AS post_id,
        c.title AS post_title,
        c.media_url AS post_media_url,
        c.cover_url AS post_cover_url,
        u.id AS author_id,
        u.name AS author_name,
        COALESCE(u.avatar, '/audience/adam-udochi.png') AS author_avatar
      FROM creator_content_comments comm
      JOIN creator_content c ON comm.content_id = c.id
      JOIN users u ON comm.user_id = u.id
      WHERE 
    `;

    if (isUuid) {
      query += `comm.user_id = $1 OR c.creator_id = $1`;
    } else {
      query += `LOWER(u.name) = LOWER($1) OR LOWER(u.handle) = LOWER($1)`;
    }

    query += ` ORDER BY comm.created_at DESC LIMIT 20`;

    const { rows } = await pool.query(query, [id]);

    const replies = rows.map((r: any) => ({
      id: r.id,
      text: r.comment_text,
      createdAt: r.created_at,
      postId: r.post_id,
      postTitle: r.post_title,
      postMediaUrl: r.post_cover_url || r.post_media_url || '',
      author: {
        id: r.author_id,
        name: r.author_name,
        avatar: r.author_avatar,
      }
    }));

    return NextResponse.json({ replies });
  } catch (error: any) {
    console.error('Error fetching creator replies:', error);
    return NextResponse.json({ replies: [] });
  }
}
