import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const res = await pool.query(`SELECT title, image_url FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC`);
  for (const row of res.rows) {
    console.log(`${row.title.substring(0, 50).padEnd(52)} | ${row.image_url}`);
  }
  pool.end();
}
check();
