import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ events: [] }, { status: 400 });

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let targetId = id;
    if (!isUuid) {
      const uRes = await pool.query('SELECT id FROM users WHERE LOWER(name) = LOWER($1) OR LOWER(handle) = LOWER($1) LIMIT 1', [id]);
      if (uRes.rows.length === 0) return NextResponse.json({ events: [] });
      targetId = uRes.rows[0].id;
    }

    const { rows } = await pool.query(
      `SELECT 
        l.id,
        l.name AS title,
        l.description,
        l.category,
        COALESCE(l.participants_count, 0) AS count,
        COALESCE(l.moderators_count, 0) AS badge_count,
        l.status,
        l.cover_url
      FROM live_experiences l
      WHERE l.creator_id = $1
      ORDER BY l.created_at DESC`,
      [targetId]
    );

    const events = rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      count: parseInt(r.count, 10) || 0,
      badgeCount: parseInt(r.badge_count, 10) || undefined,
      avatars: r.cover_url ? [r.cover_url] : ['/audience/adam-udochi.png'],
    }));

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('Error fetching creator events:', error);
    return NextResponse.json({ events: [] });
  }
}
