import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const fixes = [
  {
    title: 'Global Supply Chains Restructure As Nearshoring Surges',
    image_url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1200&auto=format&fit=crop'
  },
  {
    title: 'The Financialization of Modern Sports Franchises',
    image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop'
  },
];

async function fix() {
  for (const f of fixes) {
    const r = await pool.query(`UPDATE blog_posts SET image_url = $1 WHERE title = $2`, [f.image_url, f.title]);
    console.log(`${f.title.substring(0,45)}... → ${r.rowCount} updated`);
  }
  console.log('Done!');
  pool.end();
}
fix();
