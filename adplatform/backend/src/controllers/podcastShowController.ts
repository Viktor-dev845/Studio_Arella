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

function uploadToCloudinary(file: Express.Multer.File, folder: string, resourceType: 'image' | 'video'): Promise<any> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    const readable = new Readable();
    readable.push(file.buffer);
    readable.push(null);
    readable.pipe(stream);
  });
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
      const uploaded = await uploadToCloudinary(coverFile, `studio-arella/podcasts/${authReq.user?.id}`, 'image');
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

    const showRes = await pool.query('SELECT user_id FROM podcasts WHERE id = $1', [req.params.id]);
    if (!showRes.rows[0]) { res.status(404).json({ message: 'Podcast not found' }); return; }
    if (showRes.rows[0].user_id !== authReq.user?.id) {
      res.status(403).json({ message: 'You can only add episodes to your own podcast' });
      return;
    }

    const files = (req as any).files as UploadedFiles;
    const audioFile = files?.audio?.[0];
    if (!audioFile) { res.status(400).json({ message: 'An audio file is required' }); return; }

    const audioUpload = await uploadToCloudinary(audioFile, `studio-arella/podcasts/${authReq.user?.id}/episodes`, 'video');
    const audio_url = audioUpload.secure_url;
    const duration_seconds = audioUpload.duration ? Math.round(audioUpload.duration) : null;

    let cover_url: string | null = null;
    const coverFile = files?.cover?.[0];
    if (coverFile) {
      const coverUpload = await uploadToCloudinary(coverFile, `studio-arella/podcasts/${authReq.user?.id}/episodes`, 'image');
      cover_url = coverUpload.secure_url;
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

    res.status(201).json({ episode: result.rows[0] });
  } catch (err: any) {
    console.error('Create episode error:', err);
    res.status(500).json({ message: 'Could not publish episode' });
  }
};
