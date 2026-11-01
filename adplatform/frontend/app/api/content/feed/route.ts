import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');

    let query = `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.content_type,
        c.media_url,
        c.cover_url,
        c.duration_seconds,
        c.duration_text,
        c.category,
        c.tags,
        c.is_premium,
        c.price,
        c.likes_count,
        c.comments_count,
        COALESCE(c.views_count, 0) AS views_count,
        COALESCE(c.reposts_count, 0) AS reposts_count,
        c.quote_parent_id,
        c.quote_post,
        c.badge_theme,
        c.created_at,
        u.id AS author_id,
        u.name AS author_name,
        COALESCE(u.avatar, '/audience/adam-udochi.png') AS author_avatar,
        COALESCE(NULLIF(u.creator_niche, ''), CASE WHEN u.role = 'creator' THEN 'Creator' WHEN u.role = 'screen_owner' THEN 'Media Partner' WHEN u.role = 'admin' THEN 'Administrator' ELSE 'Creator' END) AS author_role,
        u.creator_tier AS author_tier,
        qp.id AS quoted_post_id,
        qp.title AS quoted_post_title,
        qp.description AS quoted_post_description,
        qp.category AS quoted_post_category,
        qp.media_url AS quoted_post_media_url,
        qp.cover_url AS quoted_post_cover_url,
        qp.duration_text AS quoted_post_duration,
        qu.id AS quoted_author_id,
        qu.name AS quoted_author_name,
        COALESCE(NULLIF(qu.creator_niche, ''), CASE WHEN qu.role = 'creator' THEN 'Creator' WHEN qu.role = 'screen_owner' THEN 'Media Partner' WHEN qu.role = 'admin' THEN 'Administrator' ELSE 'Creator' END) AS quoted_author_role,
        COALESCE(qu.avatar, '/audience/adam-udochi.png') AS quoted_author_avatar
      FROM creator_content c
      JOIN users u ON c.creator_id = u.id
      LEFT JOIN creator_content qp ON c.quote_parent_id = qp.id
      LEFT JOIN users qu ON qp.creator_id = qu.id
      WHERE c.status = 'published'
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND LOWER(c.category) = LOWER($${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    if (tag) {
      query += ` AND $${paramIndex} = ANY(c.tags)`;
      params.push(tag);
      paramIndex++;
    }

    const q = searchParams.get('q') || searchParams.get('search');
    const searchQuery = (q || '').trim();
    if (searchQuery) {
      const cleanSearch = searchQuery.replace(/^#/, '').trim();
      const searchTerms = cleanSearch.split(/\s+/).filter((w) => w.length > 2);

      query += ` AND (
        c.title ILIKE $${paramIndex} OR
        c.description ILIKE $${paramIndex} OR
        c.category ILIKE $${paramIndex} OR
        u.name ILIKE $${paramIndex} OR
        $${paramIndex + 1} = ANY(c.tags) OR
        EXISTS (SELECT 1 FROM unnest(c.tags) t WHERE t ILIKE $${paramIndex}) OR
        (c.category IS NOT NULL AND c.category != '' AND $${paramIndex + 2} ILIKE '%' || c.category || '%') OR
        EXISTS (SELECT 1 FROM unnest(c.tags) t WHERE LENGTH(replace(t, '#', '')) >= 3 AND $${paramIndex + 2} ILIKE '%' || replace(t, '#', '') || '%')
      `;
      params.push(`%${cleanSearch}%`);
      params.push(cleanSearch.toLowerCase().startsWith('#') ? cleanSearch.toLowerCase() : `#${cleanSearch.toLowerCase()}`);
      params.push(cleanSearch);
      paramIndex += 3;

      for (const term of searchTerms) {
        query += ` OR c.category ILIKE $${paramIndex} OR EXISTS (SELECT 1 FROM unnest(c.tags) t WHERE t ILIKE $${paramIndex}) OR (c.category IS NOT NULL AND c.category != '' AND $${paramIndex + 1} ILIKE '%' || c.category || '%')`;
        params.push(`%${term}%`);
        params.push(term);
        paramIndex += 2;
      }

      query += `)`;
    }

    if (view === 'trending') {
      query += ` ORDER BY CASE WHEN c.created_at >= NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END DESC, (c.likes_count + c.comments_count + c.views_count) DESC, c.created_at DESC`;
    } else {
      query += ` ORDER BY c.created_at DESC`;
    }

    const { rows } = await pool.query(query, params);

    const formattedPosts = rows.map((r: any) => {
      let quotedPost: any = null;
      if (r.quoted_post_id) {
        quotedPost = {
          id: r.quoted_post_id,
          author: {
            id: r.quoted_author_id,
            name: r.quoted_author_name || 'Studio Arella Creator',
            role: r.quoted_author_role || 'Creator',
            avatar: r.quoted_author_avatar || '/audience/adam-udochi.png',
          },
          title: String(r.quoted_post_title || 'Studio Podcast').replace(/^[-–—\s]+/, ''),
          description: r.quoted_post_description || '',
          category: r.quoted_post_category || 'General',
          mediaUrl: r.quoted_post_cover_url || r.quoted_post_media_url || '',
          coverUrl: r.quoted_post_cover_url || r.quoted_post_media_url || '',
          duration: r.quoted_post_duration || '00:00:00',
        };
      } else if (r.quote_post) {
        try {
          const raw = typeof r.quote_post === 'string' ? JSON.parse(r.quote_post) : r.quote_post;
          if (raw && typeof raw === 'object') {
            quotedPost = {
              id: raw.id || r.quote_parent_id || undefined,
              author: {
                id: raw.author?.id || undefined,
                name: raw.author?.name || 'Studio Arella Creator',
                role: raw.author?.role || 'Creator',
                avatar: raw.author?.avatar || '/audience/adam-udochi.png',
              },
              title: String(raw.title || '').replace(/^[-–—\s]+/, ''),
              description: raw.description || '',
              category: raw.category || 'General',
              mediaUrl: raw.coverUrl || raw.cover_url || raw.mediaUrl || raw.media_url || '',
              coverUrl: raw.coverUrl || raw.cover_url || raw.mediaUrl || raw.media_url || '',
              duration: raw.duration || raw.duration_text || '00:00:00',
            };
          }
        } catch {
          // ignore parse error
        }
      }

      const quoteId = r.quote_parent_id || quotedPost?.id || null;

      return {
        id: r.id,
        author: {
          id: r.author_id,
          name: r.author_name || 'Studio Arella Creator',
          role: r.author_role || 'Creator',
          avatar: r.author_avatar || '/audience/adam-udochi.png',
          tier: r.author_tier || 'pro',
        },
        author_name: r.author_name || 'Studio Arella Creator',
        author_role: r.author_role || 'Creator',
        author_avatar: r.author_avatar || '/audience/adam-udochi.png',
        author_tier: r.author_tier || 'pro',
        title: String(r.title || 'Studio Podcast').replace(/^[-–—\s]+/, ''),
        description: r.description,
        mediaUrl: r.cover_url || r.media_url || '',
        cover_url: r.cover_url || r.media_url || '',
        coverUrl: r.cover_url || r.media_url || '',
        duration: r.duration_text || '01:15:00',
        currentTime: '00:04:15',
        progressPercent: 30,
        initialLikes: parseInt(r.likes_count, 10) || 0,
        initialComments: parseInt(r.comments_count, 10) || 0,
        likes_count: parseInt(r.likes_count, 10) || 0,
        comments_count: parseInt(r.comments_count, 10) || 0,
        viewsCount: parseInt(r.views_count, 10) || 0,
        repostsCount: parseInt(r.reposts_count, 10) || 0,
        quotedPost: quotedPost,
        quotePost: quotedPost,
        quotedPostId: quoteId,
        quoteParentId: quoteId,
        badgeTheme: r.badge_theme || 'gold',
        isBookmarked: false,
        hasLiked: false,
        isPremium: r.is_premium,
        isUnlocked: !r.is_premium,
        price: parseFloat(r.price) || 0,
        category: r.category,
        tags: r.tags || [],
      };
    });

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Content Feed API Route Error:', error);
    return NextResponse.json({ posts: [] }, { status: 500 });
  }
}
