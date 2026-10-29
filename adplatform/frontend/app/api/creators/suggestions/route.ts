import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('currentUserId');

    let query = `
      SELECT 
        u.id,
        u.name,
        COALESCE(u.handle, LOWER(REGEXP_REPLACE(u.name, '[^a-zA-Z0-9]', '', 'g'))) AS handle,
        COALESCE(u.avatar, '/audience/adam-udochi.png') AS avatar,
        COALESCE(NULLIF(u.creator_niche, ''), CASE WHEN u.role = 'creator' THEN 'Creator' WHEN u.role = 'screen_owner' THEN 'Media Partner' ELSE 'Community Member' END) AS role,
        COALESCE(u.creator_verified, false) AS creator_verified,
        COALESCE(u.bio, 'Audio creator & storyteller on Studio Arella') AS bio
      FROM users u
      WHERE u.id IS NOT NULL
    `;

    const params: any[] = [];
    if (currentUserId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUserId)) {
      query += ` AND u.id != $1`;
      params.push(currentUserId);
    }

    query += ` ORDER BY u.creator_verified DESC, u.created_at DESC LIMIT 6`;

    const { rows } = await pool.query(query, params);

    // If current user is logged in, check which creators they already follow
    let followedSet = new Set<string>();
    if (currentUserId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUserId) && rows.length > 0) {
      const creatorIds = rows.map((r: any) => r.id);
      const followRes = await pool.query(
        `SELECT followed_id FROM follows WHERE follower_id = $1 AND followed_id = ANY($2)`,
        [currentUserId, creatorIds]
      );
      followedSet = new Set(followRes.rows.map((r: any) => r.followed_id));
    }

    const creators = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      handle: r.handle || (r.name ? r.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'creator'),
      avatar: r.avatar,
      role: r.role,
      verified: Boolean(r.creator_verified),
      bio: r.bio,
      followed: followedSet.has(r.id),
    }));

    return NextResponse.json({ creators });
  } catch (error: any) {
    console.error('Error fetching creator suggestions:', error);
    return NextResponse.json({ creators: [] }, { status: 200 });
  }
}
