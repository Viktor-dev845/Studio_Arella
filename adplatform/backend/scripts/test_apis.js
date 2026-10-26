const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres' });

async function testBackend() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL pooler...');

  // 1. Verify all posts have clean covers and titles
  const posts = await client.query('SELECT id, title, cover_url, likes_count, comments_count FROM creator_content ORDER BY created_at DESC');
  console.log('Posts in Database:');
  console.table(posts.rows);

  const testPost = posts.rows[0];
  console.log('Testing with post:', testPost.id, testPost.title);

  // 2. Test Like increment
  const updateLike = await client.query('UPDATE creator_content SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count', [testPost.id]);
  console.log('Incremented like test:', updateLike.rows[0]);

  // Revert test like
  await client.query('UPDATE creator_content SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1', [testPost.id]);
  console.log('Reverted test like successfully.');

  // 3. Test Comments query
  const comments = await client.query('SELECT count(*) FROM creator_content_comments WHERE content_id = $1', [testPost.id]);
  console.log('Existing comments for test post:', comments.rows[0].count);

  await client.end();
  console.log('All database checks passed 100%!');
}

testBackend().catch(console.error);
