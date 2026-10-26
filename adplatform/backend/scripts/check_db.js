const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres' });

async function check() {
  await client.connect();
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Tables:', tables.rows.map(r => r.table_name));

  const contentCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'creator_content'");
  console.log('creator_content cols:', contentCols.rows);

  const posts = await client.query("SELECT id, title, cover_url, media_url, likes_count, comments_count FROM creator_content LIMIT 10");
  console.log('Sample posts:', posts.rows);

  for (const t of ['creator_content_likes', 'creator_content_comments', 'user_bookmarks']) {
    const cols = await client.query(`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '${t}'`);
    console.log(`Columns of ${t}:`, cols.rows);
  }

  await client.end();
}

check().catch(console.error);
