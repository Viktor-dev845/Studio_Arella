import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

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

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let userId = getUserIdFromRequest(request) || body.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const {
      title,
      description = '',
      content_type = 'post',
      media_url = '',
      cover_url = '',
      duration_text = '00:45:00',
      category = 'General',
      tags = [],
      is_premium = false,
      price = 0,
      badge_theme = 'gold'
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO creator_content (
        creator_id, title, description, content_type, media_url, cover_url, 
        duration_text, category, tags, is_premium, price, badge_theme, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'published')
      RETURNING *`,
      [
        userId,
        title.trim(),
        description || '',
        content_type,
        media_url || '',
        cover_url || '',
        duration_text,
        category,
        Array.isArray(tags) ? tags : [],
        Boolean(is_premium),
        parseFloat(String(price)) || 0,
        badge_theme
      ]
    );

    return NextResponse.json(
      { message: 'Content published successfully', post: rows[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in /api/content POST:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create content' },
      { status: 500 }
    );
  }
}
