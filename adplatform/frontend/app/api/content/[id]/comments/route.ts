import { NextResponse } from 'next/server';
import pool from '@/lib/db';

function getUserIdFromRequest(request: Request): string | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    return payload?.id || payload?.sub || null;
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contentId } = await params;

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
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.content_id = $1
      ORDER BY c.created_at ASC`,
      [contentId]
    );

    const topLevel: any[] = [];
    const replyMap = new Map<string, any[]>();

    rows.forEach((row: any) => {
      const item = {
        id: row.id,
        author: row.author_name || 'Audience Member',
        avatar: row.author_avatar || '/audience/adam-udochi.png',
        text: row.comment_text,
        likes: row.likes_count || 0,
        createdAt: row.created_at,
        replies: [] as any[]
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

    return NextResponse.json({ comments: topLevel, total: rows.length });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contentId } = await params;
    const body = await request.json().catch(() => ({}));
    const commentBody = body.text || body.comment;
    const parentId = body.parent_id || null;

    if (!commentBody || !commentBody.trim()) {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
    }

    let userId = getUserIdFromRequest(request) || body.userId;
    let authorName = body.authorName || 'Audience Member';
    let authorAvatar = body.authorAvatar || '/audience/adam-udochi.png';

    // If no userId, pick the fallback public user so FK holds, or check if guest user exists
    if (!userId) {
      const defaultUserRes = await pool.query("SELECT id, name, avatar FROM users LIMIT 1");
      if (defaultUserRes.rows.length > 0) {
        userId = defaultUserRes.rows[0].id;
        authorName = defaultUserRes.rows[0].name;
        authorAvatar = defaultUserRes.rows[0].avatar || authorAvatar;
      }
    }

    const insertRes = await pool.query(
      `INSERT INTO creator_content_comments (content_id, user_id, parent_id, comment_text)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [contentId, userId, parentId, commentBody.trim()]
    );

    const updateRes = await pool.query(
      'UPDATE creator_content SET comments_count = comments_count + 1 WHERE id = $1 RETURNING comments_count',
      [contentId]
    );

    const newComment = {
      id: insertRes.rows[0].id,
      author: authorName,
      avatar: authorAvatar,
      text: insertRes.rows[0].comment_text,
      likes: 0,
      createdAt: insertRes.rows[0].created_at,
      replies: []
    };

    return NextResponse.json({
      comment: newComment,
      commentsCount: updateRes.rows[0]?.comments_count || 1
    });
  } catch (error: any) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: error.message || 'Failed to post comment' }, { status: 500 });
  }
}
