import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contentId } = await params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(contentId);
    if (!isUuid) {
      return NextResponse.json({ viewsCount: 1 });
    }

    const updateRes = await pool.query(
      'UPDATE creator_content SET views_count = COALESCE(views_count, 0) + 1 WHERE id = $1 RETURNING views_count',
      [contentId]
    );

    const viewsCount = updateRes.rows[0]?.views_count ?? 1;
    return NextResponse.json({ viewsCount });
  } catch (error: any) {
    console.error('Track view error:', error);
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}
