import type { Metadata } from 'next';
import BlogPostClient, { BlogPost } from './BlogPostClient';
import pool from '@/lib/db';

type Props = {
  params: Promise<{ id: string }>;
};

interface PostRow {
  id: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  authorName?: string | null;
  publishedAt?: string | null;
  readingTimeMinutes?: number;
  likesCount?: number;
  viewsCount?: number;
  commentsCount?: number;
}

function toAbsoluteUrl(url?: string | null): string {
  if (!url) return 'https://studioarella.com/billboard.jpg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `https://studioarella.com${cleanPath}`;
}

function getImageMime(url: string): string {
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

function cleanExcerpt(excerpt?: string | null, content?: string | null): string {
  if (excerpt && excerpt.trim()) {
    return excerpt.trim();
  }
  if (!content) return 'Read the latest updates and stories on Studio Arella.';
  const text = content
    .replace(/^##\s+.*$/gm, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[#*`_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 200 ? `${text.slice(0, 197)}...` : text;
}

async function fetchPostData(id: string): Promise<PostRow | null> {
  // 1. Direct query to Supabase DB
  try {
    const res = await pool.query(
      `SELECT p.*,
        (SELECT COUNT(*) FROM blog_post_likes l WHERE l.post_id = p.id) AS table_likes_count
       FROM blog_posts p
       WHERE p.id = $1
       LIMIT 1`,
      [id]
    );
    if (res.rows && res.rows.length > 0) {
      const row = res.rows[0];
      const tableLikes = Number(row.table_likes_count || 0);
      const colLikes = Number(row.likes_count || 0);
      return {
        id: row.id,
        title: row.title,
        excerpt: row.excerpt,
        content: row.content,
        imageUrl: row.image_url,
        category: row.category,
        authorName: row.author_name,
        publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
        readingTimeMinutes: row.reading_time_minutes || 4,
        likesCount: Math.max(colLikes, tableLikes),
        viewsCount: Number(row.views_count || 0),
        commentsCount: Number(row.comments_count || 0),
      };
    }
  } catch (err) {
    console.warn('[blog-page] DB query error, falling back to API:', (err as Error).message);
  }

  // 2. Fallback to Render API
  try {
    const apiRes = await fetch(`https://api.studioarella.com/api/blog/posts/${id}`, {
      next: { revalidate: 60 },
    });
    if (apiRes.ok) {
      const data = await apiRes.json();
      const p = data.post || data;
      if (p && p.title) {
        return {
          id: p.id || id,
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          imageUrl: p.imageUrl || p.image_url,
          category: p.category,
          authorName: p.authorName || p.author_name,
          publishedAt: p.publishedAt || p.published_at,
          readingTimeMinutes: p.readingTimeMinutes || 4,
          likesCount: p.likesCount || 0,
          viewsCount: p.viewsCount || 0,
          commentsCount: p.commentsCount || 0,
        };
      }
    }
  } catch (err) {
    console.warn('[blog-page] API fetch error:', (err as Error).message);
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchPostData(id);

  if (!post) {
    return {
      title: 'Studio Arella Blog',
      description: 'Discover stories, market updates, and digital billboard advertising insights across Nigeria on Studio Arella.',
    };
  }

  const title = post.title;
  const description = cleanExcerpt(post.excerpt, post.content);
  const imageUrl = toAbsoluteUrl(post.imageUrl);
  const postUrl = `https://studioarella.com/blog/${id}`;
  const imageMime = getImageMime(imageUrl);

  return {
    title,
    description,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      type: 'article',
      url: postUrl,
      title,
      description,
      siteName: 'Studio Arella',
      publishedTime: post.publishedAt || undefined,
      authors: post.authorName ? [post.authorName] : ['Studio Arella'],
      section: post.category || 'News',
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: imageMime,
        },
      ],
      locale: 'en_NG',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      site: '@studioarella',
      creator: '@studioarella',
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await fetchPostData(id);

  const initialPost: BlogPost | null = post
    ? {
        id: post.id,
        title: post.title,
        content: post.content || '',
        category: post.category || null,
        authorName: post.authorName || null,
        imageUrl: post.imageUrl || null,
        publishedAt: post.publishedAt || new Date().toISOString(),
        readingTimeMinutes: post.readingTimeMinutes || 4,
        likesCount: post.likesCount || 0,
        viewsCount: post.viewsCount || 0,
        commentsCount: post.commentsCount || 0,
      }
    : null;

  return <BlogPostClient initialId={id} initialPost={initialPost} />;
}
