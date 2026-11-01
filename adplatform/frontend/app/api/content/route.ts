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
      badge_theme = 'gold',
      quotedPostId,
      quote_parent_id = null,
      quoteParentId,
      quotedPost,
      quote_post = null,
      quotePost
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const targetQuotedId = quotedPostId || quote_parent_id || quoteParentId || null;
    const isQuoteUuid = targetQuotedId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetQuotedId);

    let finalContentType = content_type;
    let quotePostData = quotedPost || quote_post || quotePost || null;

    if (isQuoteUuid) {
      if (!content_type || content_type === 'post') {
        finalContentType = 'quote';
      }

      // If snapshot is missing or incomplete, fetch the quoted post from the database
      if (!quotePostData || !quotePostData.author) {
        try {
          const originalRes = await pool.query(
            `SELECT 
              c.id, c.title, c.description, c.category, c.cover_url, c.media_url, c.duration_text,
              u.id AS author_id, u.name AS author_name,
              COALESCE(NULLIF(u.creator_niche, ''), CASE WHEN u.role = 'creator' THEN 'Creator' WHEN u.role = 'screen_owner' THEN 'Media Partner' WHEN u.role = 'admin' THEN 'Administrator' ELSE 'Creator' END) AS author_role,
              COALESCE(u.avatar, '/audience/adam-udochi.png') AS author_avatar
            FROM creator_content c
            JOIN users u ON c.creator_id = u.id
            WHERE c.id = $1`,
            [targetQuotedId]
          );

          if (originalRes.rows.length > 0) {
            const orig = originalRes.rows[0];
            quotePostData = {
              id: orig.id,
              author: {
                id: orig.author_id,
                name: orig.author_name || 'Studio Arella Creator',
                role: orig.author_role || 'Creator',
                avatar: orig.author_avatar || '/audience/adam-udochi.png'
              },
              title: String(orig.title || '').replace(/^[-–—\s]+/, ''),
              description: orig.description || '',
              category: orig.category || 'General',
              mediaUrl: orig.cover_url || orig.media_url || '',
              coverUrl: orig.cover_url || orig.media_url || '',
              duration: orig.duration_text || '00:00:00'
            };
          }
        } catch (origErr) {
          console.warn('Failed to fetch quoted post details for snapshot:', origErr);
        }
      }

      // Increment reposts_count on original post
      try {
        await pool.query(
          'UPDATE creator_content SET reposts_count = COALESCE(reposts_count, 0) + 1 WHERE id = $1',
          [targetQuotedId]
        );
      } catch (repErr) {
        console.warn('Failed to increment reposts_count:', repErr);
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO creator_content (
        creator_id, title, description, content_type, media_url, cover_url, 
        duration_text, category, tags, is_premium, price, badge_theme, status,
        quote_parent_id, quote_post
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'published', $13, $14)
      RETURNING *`,
      [
        userId,
        title.trim(),
        description || '',
        finalContentType,
        media_url || '',
        cover_url || '',
        duration_text,
        category,
        Array.isArray(tags) ? tags : [],
        Boolean(is_premium),
        parseFloat(String(price)) || 0,
        badge_theme,
        isQuoteUuid ? targetQuotedId : null,
        quotePostData ? JSON.stringify(quotePostData) : null
      ]
    );

    const created = rows[0];

    const formattedCreatedPost = {
      ...created,
      quotedPost: quotePostData,
      quotePost: quotePostData,
      quotedPostId: created.quote_parent_id,
      quoteParentId: created.quote_parent_id
    };

    return NextResponse.json(
      { message: 'Content published successfully', post: formattedCreatedPost, ...formattedCreatedPost },
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
