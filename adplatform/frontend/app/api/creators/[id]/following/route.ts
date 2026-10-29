import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const viewerId = searchParams.get('viewerId');

    if (!id) return NextResponse.json({ following: [] }, { status: 400 });

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let targetId = id;
    if (!isUuid) {
      const uRes = await pool.query('SELECT id FROM users WHERE LOWER(name) = LOWER($1) OR LOWER(handle) = LOWER($1) LIMIT 1', [id]);
      if (uRes.rows.length === 0) return NextResponse.json({ following: [] });
      targetId = uRes.rows[0].id;
    }

    const query = `
      SELECT 
        u.id,
        u.name,
        COALESCE(u.handle, LOWER(REGEXP_REPLACE(u.name, '[^a-zA-Z0-9]', '', 'g'))) AS handle,
        COALESCE(u.avatar, '/audience/adam-udochi.png') AS avatar,
        COALESCE(NULLIF(u.creator_niche, ''), CASE WHEN u.role = 'creator' THEN 'Creator' ELSE 'Member' END) AS role,
        u.bio,
        f.created_at AS followed_at,
        ${viewerId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(viewerId)
          ? `EXISTS (SELECT 1 FROM follows vf WHERE vf.follower_id = '${viewerId}' AND vf.followed_id = u.id) AS is_following`
          : 'true AS is_following'
        }
      FROM follows f
      JOIN users u ON f.followed_id = u.id
      WHERE f.follower_id = $1
      ORDER BY f.created_at DESC
      LIMIT 50
    `;

    const { rows } = await pool.query(query, [targetId]);

    const following = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      handle: r.handle,
      avatar: r.avatar,
      role: r.role,
      bio: r.bio,
      isFollowing: Boolean(r.is_following),
    }));

    return NextResponse.json({ following });
  } catch (error: any) {
    console.error('Error fetching creator following:', error);
    return NextResponse.json({ following: [] });
  }
}
