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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryCreatorId = searchParams.get('creatorId');
    const authUserId = getUserIdFromRequest(request);

    let creatorId = queryCreatorId || authUserId;

    if (!creatorId) {
      // Find top creator from users table as fallback
      const topUser = await pool.query("SELECT id FROM users WHERE role = 'creator' OR creator_niche IS NOT NULL LIMIT 1");
      if (topUser.rows.length > 0) {
        creatorId = topUser.rows[0].id;
      } else {
        return NextResponse.json({
          metrics: {
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            totalReposts: 0,
            totalFollowers: 0,
            totalFollowing: 0,
            totalEarned: 0,
            availableBalance: 0,
          },
          topContent: [],
          revenueBreakdown: { tips: 0, memberships: 0, premium: 0, live: 0 },
          recentTransactions: [],
        });
      }
    }

    if (!creatorId) {
      return NextResponse.json({ error: 'Creator ID could not be resolved' }, { status: 400 });
    }

    const resolvedCreatorId: string = creatorId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedCreatorId);
    let targetUuid = resolvedCreatorId;
    if (!isUuid) {
      const uRes = await pool.query('SELECT id FROM users WHERE LOWER(name) = LOWER($1) OR LOWER(handle) = LOWER($1) LIMIT 1', [resolvedCreatorId]);
      if (uRes.rows.length === 0) {
        return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
      }
      targetUuid = uRes.rows[0].id;
    }

    // 1. Content Performance Metrics
    const contentStatsRes = await pool.query(`
      SELECT 
        COUNT(*) AS total_posts,
        COALESCE(SUM(views_count), 0) AS total_views,
        COALESCE(SUM(likes_count), 0) AS total_likes,
        COALESCE(SUM(comments_count), 0) AS total_comments,
        COALESCE(SUM(reposts_count), 0) AS total_reposts
      FROM creator_content
      WHERE creator_id = $1 AND status = 'published'
    `, [targetUuid]);

    const contentStats = contentStatsRes.rows[0] || {};

    // 2. Top-Performing Content
    const topContentRes = await pool.query(`
      SELECT id, title, category, views_count, likes_count, comments_count, reposts_count, is_premium, price, created_at
      FROM creator_content
      WHERE creator_id = $1 AND status = 'published'
      ORDER BY views_count DESC, likes_count DESC
      LIMIT 6
    `, [targetUuid]);

    // 3. Audience Counts
    const [followersRes, followingRes] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM follows WHERE followed_id = $1', [targetUuid]),
      pool.query('SELECT COUNT(*) AS count FROM follows WHERE follower_id = $1', [targetUuid]),
    ]);

    // 4. Wallet & Revenue
    const walletRes = await pool.query(`
      SELECT available_balance, pending_balance, total_earned, total_withdrawn
      FROM creator_wallets
      WHERE creator_id = $1
    `, [targetUuid]);

    const wallet = walletRes.rows[0] || { available_balance: 0, pending_balance: 0, total_earned: 0, total_withdrawn: 0 };

    // 5. Revenue Breakdown by source
    const revenueRes = await pool.query(`
      SELECT source_type, COALESCE(SUM(net_amount), 0) AS total
      FROM creator_earnings_ledger
      WHERE creator_id = $1
      GROUP BY source_type
    `, [targetUuid]);

    const revenueBreakdown: Record<string, number> = { tips: 0, memberships: 0, premium: 0, live: 0 };
    for (const r of revenueRes.rows) {
      if (r.source_type === 'tip') revenueBreakdown.tips = parseFloat(r.total);
      else if (r.source_type === 'membership') revenueBreakdown.memberships = parseFloat(r.total);
      else if (r.source_type === 'premium_content') revenueBreakdown.premium = parseFloat(r.total);
      else if (r.source_type === 'live_experience') revenueBreakdown.live = parseFloat(r.total);
    }

    // 6. Recent Ledger Transactions
    const ledgerRes = await pool.query(`
      SELECT id, source_type, gross_amount, platform_fee, net_amount, description, created_at, status
      FROM creator_earnings_ledger
      WHERE creator_id = $1
      ORDER BY created_at DESC
      LIMIT 8
    `, [targetUuid]);

    return NextResponse.json({
      metrics: {
        totalPosts: parseInt(contentStats.total_posts || '0', 10),
        totalViews: parseInt(contentStats.total_views || '0', 10),
        totalLikes: parseInt(contentStats.total_likes || '0', 10),
        totalComments: parseInt(contentStats.total_comments || '0', 10),
        totalReposts: parseInt(contentStats.total_reposts || '0', 10),
        totalFollowers: parseInt(followersRes.rows[0]?.count || '0', 10),
        totalFollowing: parseInt(followingRes.rows[0]?.count || '0', 10),
        totalEarned: parseFloat(wallet.total_earned || '0'),
        availableBalance: parseFloat(wallet.available_balance || '0'),
      },
      topContent: topContentRes.rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        views: parseInt(r.views_count, 10) || 0,
        likes: parseInt(r.likes_count, 10) || 0,
        comments: parseInt(r.comments_count, 10) || 0,
        reposts: parseInt(r.reposts_count, 10) || 0,
        isPremium: Boolean(r.is_premium),
        price: parseFloat(r.price) || 0,
        createdAt: r.created_at,
      })),
      revenueBreakdown,
      recentTransactions: ledgerRes.rows,
    });
  } catch (error: any) {
    console.error('Error fetching creator analytics:', error);
    return NextResponse.json({ error: error.message || 'Failed to load creator analytics' }, { status: 500 });
  }
}
