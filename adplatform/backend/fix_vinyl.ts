import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function fixVinylImage() {
  try {
    const res = await pool.query(
      `UPDATE blog_posts SET image_url = $1 WHERE title = $2`,
      ['https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=1200&auto=format&fit=crop', 'The Rebirth of Analog: Why Gen Z is Ditching Spotify for Vinyl']
    );
    console.log('Updated rows:', res.rowCount);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

fixVinylImage();
