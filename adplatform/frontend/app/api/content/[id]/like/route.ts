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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contentId } = await params;
    let userId = getUserIdFromRequest(request);

    // If client sent a user id in the body or query
    if (!userId) {
      try {
        const body = await request.json().catch(() => ({}));
        if (body.userId) userId = body.userId;
      } catch {
        // no body
      }
    }

    if (userId) {
      // Check existing like
      const existing = await pool.query(
        'SELECT id FROM creator_content_likes WHERE content_id = $1 AND user_id = $2',
        [contentId, userId]
      );

      if (existing.rows.length > 0) {
        // Unlike
        await pool.query(
          'DELETE FROM creator_content_likes WHERE content_id = $1 AND user_id = $2',
          [contentId, userId]
        );
        const updateRes = await pool.query(
          'UPDATE creator_content SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1 RETURNING likes_count',
          [contentId]
        );
        const newCount = updateRes.rows[0]?.likes_count ?? 0;
        return NextResponse.json({ liked: false, likesCount: newCount });
      } else {
        // Like
        await pool.query(
          'INSERT INTO creator_content_likes (content_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [contentId, userId]
        );
        const updateRes = await pool.query(
          'UPDATE creator_content SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count',
          [contentId]
        );
        const newCount = updateRes.rows[0]?.likes_count ?? 1;
        return NextResponse.json({ liked: true, likesCount: newCount });
      }
    } else {
      // Guest like: increment count directly
      const updateRes = await pool.query(
        'UPDATE creator_content SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count',
        [contentId]
      );
      const newCount = updateRes.rows[0]?.likes_count ?? 1;
      return NextResponse.json({ liked: true, likesCount: newCount });
    }
  } catch (error: any) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: error.message || 'Failed to toggle like' }, { status: 500 });
  }
}
