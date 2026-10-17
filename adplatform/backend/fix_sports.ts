import { Pool } from 'pg';
const pool = new Pool({
  connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});
pool.query(
  `UPDATE blog_posts SET image_url = $1 WHERE title = $2`,
  ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop', 'The Financialization of Modern Sports Franchises']
).then(r => { console.log('Updated:', r.rowCount); pool.end(); });
