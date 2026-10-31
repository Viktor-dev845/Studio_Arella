import { RequestHandler } from 'express';
import pool from '../db/pool';
import { AuthRequest } from '../middleware/auth';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Podcast *content* (shows a creator publishes + their episodes) — distinct
// from podcast_bookings, which is studio rental time, not published content.

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  });
}

import fs from 'fs';
import path from 'path';

async function uploadFileResilient(
  file: Express.Multer.File,
  folder: string,
  resourceType: 'image' | 'video'
): Promise<{ secure_url: string; duration?: number }> {
  // Try Cloudinary if environment variables exist
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      const res: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: resourceType },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        const readable = new Readable();
        readable.push(file.buffer);
        readable.push(null);
        readable.pipe(stream);
      });
      return { secure_url: res.secure_url, duration: res.duration };
    } catch (cErr) {
      console.warn('Cloudinary upload failed, falling back to local storage:', cErr);
    }
  }

  // Resilient fallback to local server /uploads directory
  const uploadDir = path.join(__dirname, '../../public/uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const ext = file.originalname
    ? file.originalname.split('.').pop()?.toLowerCase() || (resourceType === 'image' ? 'jpg' : 'mp3')
    : (resourceType === 'image' ? 'jpg' : 'mp3');
  const safeName = `pod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filepath = path.join(uploadDir, safeName);
  fs.writeFileSync(filepath, file.buffer);

  return { secure_url: `/uploads/${safeName}`, duration: 180 };
}

type UploadedFiles = Record<string, Express.Multer.File[]> | undefined;

// ── Create a show ────────────────────────────────────────────────────────────
export const createShow: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { title, description } = req.body;
    if (!title?.trim()) { res.status(400).json({ message: 'Title is required' }); return; }

    let cover_url: string | null = null;
    const files = (req as any).files as UploadedFiles;
    const coverFile = files?.cover?.[0];
    if (coverFile) {
      const uploaded = await uploadFileResilient(coverFile, `studio-arella/podcasts/${authReq.user?.id}`, 'image');
      cover_url = uploaded.secure_url;
    }

    const result = await pool.query(
      `INSERT INTO podcasts (user_id, title, description, cover_url) VALUES ($1, $2, $3, $4) RETURNING *`,
      [authReq.user?.id, title.trim(), description || null, cover_url]
    );
    res.status(201).json({ podcast: result.rows[0] });
  } catch (err: any) {
    console.error('Create show error:', err);
    res.status(500).json({ message: 'Could not create podcast' });
  }
};

// ── List all published shows (real, public catalog — backs the audience
// ── preview mode: what a listener browsing Studio Arella would actually see) ──
export const getAllShows: RequestHandler = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.title, p.description, p.cover_url, p.created_at, u.name as creator_name,
         (SELECT COUNT(*) FROM podcast_episodes e WHERE e.podcast_id = p.id AND e.status = 'published') as episode_count
       FROM podcasts p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE EXISTS (SELECT 1 FROM podcast_episodes e WHERE e.podcast_id = p.id AND e.status = 'published')
       ORDER BY p.created_at DESC`
    );
    res.json({ shows: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── List the current user's own shows (all of them, regardless of episode
// ── publish status — unlike getAllShows, this backs the creator's own
// ── podcast management view, not the public/audience catalog) ────────────────
export const getMyShows: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const result = await pool.query(
      `SELECT p.id, p.title, p.description, p.cover_url, p.created_at,
         (SELECT COUNT(*) FROM podcast_episodes e WHERE e.podcast_id = p.id) as episode_count
       FROM podcasts p
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [authReq.user?.id]
    );
    res.json({ shows: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Get a show + its episodes ────────────────────────────────────────────────
export const getShow: RequestHandler = async (req, res) => {
  try {
    const showRes = await pool.query('SELECT * FROM podcasts WHERE id = $1', [req.params.id]);
    if (!showRes.rows[0]) { res.status(404).json({ message: 'Podcast not found' }); return; }

    const episodesRes = await pool.query(
      'SELECT * FROM podcast_episodes WHERE podcast_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json({ podcast: showRes.rows[0], episodes: episodesRes.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Publish an episode under a show ──────────────────────────────────────────
export const createEpisode: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { title, description, episode_number, content_rating, scheduled_at } = req.body;
    if (!title?.trim()) { res.status(400).json({ message: 'Episode title is required' }); return; }

    const showRes = await pool.query('SELECT title, description, cover_url, user_id FROM podcasts WHERE id = $1', [req.params.id]);
    if (!showRes.rows[0]) { res.status(404).json({ message: 'Podcast not found' }); return; }
    if (showRes.rows[0].user_id !== authReq.user?.id) {
      res.status(403).json({ message: 'You can only add episodes to your own podcast' });
      return;
    }

    const files = (req as any).files as UploadedFiles;
    const audioFile = files?.audio?.[0];
    if (!audioFile) { res.status(400).json({ message: 'An audio file is required' }); return; }

    const audioUpload = await uploadFileResilient(audioFile, `studio-arella/podcasts/${authReq.user?.id}/episodes`, 'video');
    const audio_url = audioUpload.secure_url;
    const duration_seconds = audioUpload.duration ? Math.round(audioUpload.duration) : 180;

    let cover_url: string | null = null;
    const coverFile = files?.cover?.[0];
    if (coverFile) {
      const coverUpload = await uploadFileResilient(coverFile, `studio-arella/podcasts/${authReq.user?.id}/episodes`, 'image');
      cover_url = coverUpload.secure_url;
    } else if (showRes.rows[0].cover_url) {
      cover_url = showRes.rows[0].cover_url;
    }

    const rating = content_rating === 'adult' ? 'adult' : 'everyone';
    const status = scheduled_at ? 'scheduled' : 'published';

    const result = await pool.query(
      `INSERT INTO podcast_episodes
       (podcast_id, user_id, episode_number, title, description, cover_url, audio_url, duration_seconds, content_rating, scheduled_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        req.params.id, authReq.user?.id, episode_number ? parseInt(episode_number, 10) : null,
        title.trim(), description || null, cover_url, audio_url, duration_seconds, rating,
        scheduled_at || null, status,
      ]
    );

    // If published, also syndicate to creator_content so it appears in the public Audience Feed!
    if (status === 'published') {
      try {
        const m = Math.floor(duration_seconds / 60);
        const s = duration_seconds % 60;
        const durText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        const isVideo = Boolean(
          audioFile.mimetype?.startsWith('video/') ||
          audioFile.originalname?.match(/\.(mp4|mov|webm)$/i)
        );
        const contentType = isVideo ? 'video' : 'audio';
        const tags = isVideo
          ? ['#podcast', '#vodcast', '#video', '#studioarella']
          : ['#podcast', '#audio', '#studioarella'];

        await pool.query(
          `INSERT INTO creator_content
           (creator_id, title, description, content_type, media_url, cover_url, duration_seconds, duration_text, category, tags, is_premium, status, badge_theme)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Podcast', $9, false, 'published', 'gold')`,
          [
            authReq.user?.id,
            `${showRes.rows[0].title}: ${title.trim()}`,
            description || `New episode from ${showRes.rows[0].title}`,
            contentType,
            audio_url,
            cover_url || showRes.rows[0].cover_url || '/audience/covers/wealth.jpg',
            duration_seconds,
            durText,
            tags
          ]
        );
      } catch (feedErr) {
        console.warn('Syndicate to creator_content skipped:', feedErr);
      }
    }

    res.status(201).json({ episode: result.rows[0] });
  } catch (err: any) {
    console.error('Create episode error:', err);
    res.status(500).json({ message: 'Could not publish episode' });
  }
};
