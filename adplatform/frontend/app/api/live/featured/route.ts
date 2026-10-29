import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Check for live experiences in database
    const liveRes = await pool.query(`
      SELECT 
        l.id,
        l.name,
        l.description,
        l.category,
        COALESCE(l.participants_count, 0) AS participants_count,
        l.status,
        u.id AS creator_id,
        u.name AS creator_name,
        COALESCE(u.avatar, '/audience/covers/politics.jpg') AS creator_avatar,
        COALESCE(u.creator_verified, true) AS creator_verified
      FROM live_experiences l
      JOIN users u ON l.creator_id = u.id
      ORDER BY (l.status = 'live') DESC, l.participants_count DESC
      LIMIT 1
    `).catch(() => ({ rows: [] }));

    if (liveRes.rows.length > 0) {
      const row = liveRes.rows[0];
      return NextResponse.json({
        live: {
          id: row.id,
          title: row.name,
          hostName: row.creator_name,
          hostAvatar: row.creator_avatar,
          verified: Boolean(row.creator_verified),
          status: row.status || 'live',
          participantsCount: Math.max(1, parseInt(row.participants_count, 10) || 1),
          category: row.category || 'Live Room',
        }
      });
    }

    return NextResponse.json({ live: null });
  } catch (error: any) {
    console.error('Error fetching featured live broadcast:', error);
    return NextResponse.json({ live: null });
  }
}
