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

    const FALLBACK_CREATORS = [
      {
        id: '0e0d0c45-7c57-40eb-8910-f3d8cc573b99',
        name: 'Audrey Alexander',
        handle: 'audreyalexander',
        avatar: '/audience/audrey-alexander.png',
        role: 'Diplomacy & Political Analyst',
        verified: true,
        bio: 'African economic diplomacy and strategic multilateral trade alliances.',
        followed: false,
      },
      {
        id: '3a9555f6-fa47-47ef-aa88-f19d80a90e6e',
        name: 'Darlene Black',
        handle: 'darleneblack',
        avatar: '/audience/darlene-black.png',
        role: 'Relationship Host & Storyteller',
        verified: true,
        bio: 'Modern marriage, relationship wisdom, emotional intimacy, and family vitality.',
        followed: false,
      },
      {
        id: 'd167c089-35e2-4f25-a627-c7d55f7c713f',
        name: 'Adam Udochi',
        handle: 'adamudochi',
        avatar: '/audience/adam-udochi.png',
        role: 'UI/UX Designer & Producer',
        verified: true,
        bio: 'High-conviction angel investing and venture syndicates.',
        followed: false,
      },
      {
        id: 'e3101424-a3ac-4a9d-9ea9-3f0d957edf78',
        name: 'Nermmen Saif',
        handle: 'nermmensaif',
        avatar: '/audience/nermmen-saif.png',
        role: 'Design & Media Creator',
        verified: true,
        bio: 'Proven investment frameworks and modern wealth-building playbooks.',
        followed: false,
      },
      {
        id: '34debe18-75a3-49d3-9404-d82df7b5cd62',
        name: 'Theresa Steward',
        handle: 'theresasteward',
        avatar: '/audience/theresa-steward.png',
        role: 'Executive Producer',
        verified: true,
        bio: 'Scaling emerging media and digital billboard networks.',
        followed: false,
      },
      {
        id: 'f4f4d1be-9134-48e4-9789-fc92fc4cb8f4',
        name: 'Kyle Fisher',
        handle: 'kylefisher',
        avatar: '/audience/kyle-fisher.png',
        role: 'Family Counselor',
        verified: true,
        bio: 'Navigating generational conversations and household resilience.',
        followed: false,
      },
    ];

    let creators = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      handle: r.handle || (r.name ? r.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'creator'),
      avatar: r.avatar,
      role: r.role,
      verified: Boolean(r.creator_verified),
      bio: r.bio,
      followed: followedSet.has(r.id),
    }));

    if (creators.length === 0) {
      creators = FALLBACK_CREATORS.filter(c => c.id !== currentUserId);
    }

    return NextResponse.json({ creators });
  } catch (error: any) {
    console.error('Error fetching creator suggestions:', error);
    return NextResponse.json({ 
      creators: [
        {
          id: '0e0d0c45-7c57-40eb-8910-f3d8cc573b99',
          name: 'Audrey Alexander',
          handle: 'audreyalexander',
          avatar: '/audience/audrey-alexander.png',
          role: 'Diplomacy & Political Analyst',
          verified: true,
          bio: 'African economic diplomacy and strategic multilateral trade alliances.',
          followed: false,
        },
        {
          id: '3a9555f6-fa47-47ef-aa88-f19d80a90e6e',
          name: 'Darlene Black',
          handle: 'darleneblack',
          avatar: '/audience/darlene-black.png',
          role: 'Relationship Host & Storyteller',
          verified: true,
          bio: 'Modern marriage, relationship wisdom, emotional intimacy, and family vitality.',
          followed: false,
        },
      ] 
    }, { status: 200 });
  }
}
