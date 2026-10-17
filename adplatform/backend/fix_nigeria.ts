import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function fixNigImage() {
  try {
    const res = await pool.query(
      `UPDATE blog_posts SET image_url = $1 WHERE title = $2`,
      ['/uploads/news/nigeria.svg', 'NIGERIA CLOCKS 66 YEARS TODAY AFTER GAINING INDEPENDENCE IN 1960']
    );
    console.log('Updated rows:', res.rowCount);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

fixNigImage();
