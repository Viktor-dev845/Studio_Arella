import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, bio, location, creator_niche, social_links, avatar, banner_url } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const res = await pool.query(
      `UPDATE users 
       SET 
         name = COALESCE($1, name),
         bio = COALESCE($2, bio),
         location = COALESCE($3, location),
         creator_niche = COALESCE($4, creator_niche),
         social_links = COALESCE($5::jsonb, social_links),
         avatar = COALESCE($6, avatar),
         banner_url = COALESCE($7, banner_url),
         updated_at = NOW()
       WHERE id = $8
       RETURNING id, name, handle, role, creator_tier, creator_verified, creator_niche, bio, location, social_links, avatar, banner_url`,
      [
        name || null,
        bio || null,
        location || null,
        creator_niche || null,
        social_links ? JSON.stringify(social_links) : null,
        avatar || null,
        banner_url || null,
        userId
      ]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: res.rows[0] });
  } catch (error: any) {
    console.error('Error updating creator profile:', error);
    return NextResponse.json({ error: 'Failed to update profile', details: error.message }, { status: 500 });
  }
}
