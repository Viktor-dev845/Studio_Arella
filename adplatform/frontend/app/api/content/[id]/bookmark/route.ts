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

    if (!userId) {
      try {
        const body = await request.json().catch(() => ({}));
        if (body.userId) userId = body.userId;
      } catch {
        // no body
      }
    }

    if (!userId) {
      // Return optimistic saved state for guest
      return NextResponse.json({ bookmarked: true, isGuest: true });
    }

    const existing = await pool.query(
      'SELECT id FROM user_bookmarks WHERE content_id = $1 AND user_id = $2',
      [contentId, userId]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM user_bookmarks WHERE content_id = $1 AND user_id = $2',
        [contentId, userId]
      );
      return NextResponse.json({ bookmarked: false });
    } else {
      await pool.query(
        'INSERT INTO user_bookmarks (content_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [contentId, userId]
      );
      return NextResponse.json({ bookmarked: true });
    }
  } catch (error: any) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json({ error: error.message || 'Failed to toggle bookmark' }, { status: 500 });
  }
}
