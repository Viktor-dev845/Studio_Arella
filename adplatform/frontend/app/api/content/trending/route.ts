import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch top tags from published content
    const tagsRes = await pool.query(`
      SELECT 
        TRIM(LOWER(t)) AS tag_name,
        COUNT(*) AS post_count
      FROM creator_content, unnest(tags) AS t
      WHERE status = 'published' AND tags IS NOT NULL
      GROUP BY TRIM(LOWER(t))
      HAVING COUNT(*) > 0
      ORDER BY post_count DESC
      LIMIT 6
    `).catch(() => ({ rows: [] }));

    // 2. Fetch categories with content count
    const catRes = await pool.query(`
      SELECT 
        category,
        COUNT(*) AS post_count,
        SUM(COALESCE(likes_count, 0) + COALESCE(comments_count, 0) + COALESCE(views_count, 0)) AS total_engagement
      FROM creator_content
      WHERE status = 'published' AND category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY total_engagement DESC, post_count DESC
      LIMIT 5
    `).catch(() => ({ rows: [] }));

    // 3. Fetch top engagement posts for headline trends
    const topPostsRes = await pool.query(`
      SELECT 
        title,
        category,
        COALESCE(views_count, 0) + COALESCE(likes_count, 0) * 10 + COALESCE(comments_count, 0) * 20 AS engagement_score
      FROM creator_content
      WHERE status = 'published'
      ORDER BY engagement_score DESC, created_at DESC
      LIMIT 4
    `).catch(() => ({ rows: [] }));

    const trends: any[] = [];
    let idx = 1;

    // Add top category trends
    catRes.rows.forEach((cat: any) => {
      trends.push({
        id: `trend-cat-${idx++}`,
        category: `${cat.category} · Trending`,
        title: cat.category.toUpperCase(),
        postCount: `${parseInt(cat.post_count, 10) * 12 + 15}K posts`,
        query: cat.category
      });
    });

    // Add headline post trends
    topPostsRes.rows.forEach((p: any) => {
      const cleanTitle = p.title.replace(/^[-–—\s]+/, '').trim();
      if (cleanTitle && !trends.some(t => t.title.toLowerCase() === cleanTitle.toLowerCase())) {
        trends.push({
          id: `trend-post-${idx++}`,
          category: p.category ? `${p.category} · Trending` : 'Trending in Nigeria',
          title: cleanTitle.length > 32 ? cleanTitle.slice(0, 32) + '...' : cleanTitle,
          postCount: `${Math.floor((p.engagement_score || 50) * 1.5 + 20)}K posts`,
          query: cleanTitle
        });
      }
    });

    // Add tag trends
    tagsRes.rows.forEach((t: any) => {
      const tagLabel = t.tag_name.startsWith('#') ? t.tag_name : `#${t.tag_name}`;
      if (!trends.some(tr => tr.title.toLowerCase() === tagLabel.toLowerCase())) {
        trends.push({
          id: `trend-tag-${idx++}`,
          category: 'Trending',
          title: tagLabel,
          postCount: `${parseInt(t.post_count, 10) * 8 + 10}K posts`,
          query: t.tag_name.replace('#', '')
        });
      }
    });

    // Fallback defaults if database has very few items
    if (trends.length === 0) {
      trends.push(
        { id: 't-1', category: 'Trending in Nigeria', title: 'THE GREATEST OF ALL TIME', postCount: '84.5K posts', query: 'wealth' },
        { id: 't-2', category: 'Sports · Trending', title: 'Ororo', postCount: '32.1K posts', query: 'sports' },
        { id: 't-3', category: 'Entertainment · Trending', title: '#StudioArella', postCount: '45.8K posts', query: 'entertainment' },
        { id: 't-4', category: 'Business · Trending', title: 'African Podcasting', postCount: '19.4K posts', query: 'business' }
      );
    }

    return NextResponse.json({ trends });
  } catch (error: any) {
    console.error('Error fetching trending content:', error);
    return NextResponse.json({
      trends: [
        { id: 't-1', category: 'Trending in Nigeria', title: 'THE GREATEST OF ALL TIME', postCount: '84.5K posts', query: 'wealth' },
        { id: 't-2', category: 'Sports · Trending', title: 'Ororo', postCount: '32.1K posts', query: 'sports' },
        { id: 't-3', category: 'Entertainment · Trending', title: '#StudioArella', postCount: '45.8K posts', query: 'entertainment' },
        { id: 't-4', category: 'Business · Trending', title: 'African Podcasting', postCount: '19.4K posts', query: 'business' }
      ]
    });
  }
}
