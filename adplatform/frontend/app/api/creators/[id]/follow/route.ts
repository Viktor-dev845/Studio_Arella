import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: followedId } = await params;
    const body = await request.json().catch(() => ({}));
    const followerId = body.followerId;

    if (!followerId) {
      return NextResponse.json({ error: 'Please sign in to follow creators' }, { status: 401 });
    }

    if (followerId === followedId) {
      return NextResponse.json({ error: 'You cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    const existing = await pool.query(
      'SELECT id FROM follows WHERE follower_id = $1 AND followed_id = $2',
      [followerId, followedId]
    );

    let isFollowing = false;

    if (existing.rows.length > 0) {
      // Unfollow
      await pool.query('DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2', [
        followerId,
        followedId,
      ]);
      isFollowing = false;
    } else {
      // Follow
      await pool.query(
        'INSERT INTO follows (follower_id, followed_id, created_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING',
        [followerId, followedId]
      );
      isFollowing = true;
    }

    // Get updated followers count
    const countRes = await pool.query(
      'SELECT COUNT(*) AS count FROM follows WHERE followed_id = $1',
      [followedId]
    );
    const followersCount = parseInt(countRes.rows[0]?.count || '0', 10);

    return NextResponse.json({
      success: true,
      isFollowing,
      followersCount,
    });
  } catch (error: any) {
    console.error('Toggle follow error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update follow' }, { status: 500 });
  }
}
