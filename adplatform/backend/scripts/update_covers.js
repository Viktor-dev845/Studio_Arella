const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres' });

async function updateCovers() {
  await client.connect();
  console.log('Connected to Supabase pooler...');

  // Map of titles / content to the new high-res 16:9 covers
  const updates = [
    {
      titleLike: '%wealth%',
      cover: '/audience/covers/wealth.jpg',
      cleanTitle: 'Tricks to Modern Wealth Creation'
    },
    {
      titleLike: '%health%',
      cover: '/audience/covers/health.jpg',
      cleanTitle: 'Holistic Health & Vitality Tracking'
    },
    {
      titleLike: '%photo%',
      cover: '/audience/covers/creative.jpg',
      cleanTitle: 'The Art of Visual Storytelling & Photography'
    },
    {
      titleLike: '%umuahia%',
      cover: '/audience/covers/culture.jpg',
      cleanTitle: 'The Voices of Umuahia: Heritage & Culture'
    },
    {
      titleLike: '%media%',
      cover: '/audience/covers/media.jpg',
      cleanTitle: 'Scaling Emerging Media & Billboards'
    },
    {
      titleLike: '%servicing%',
      cover: '/audience/covers/wealth.jpg',
      cleanTitle: 'Private Equity & Wealth Management Secrets'
    }
  ];

  for (const item of updates) {
    const res = await client.query(
      `UPDATE creator_content 
       SET cover_url = $1, media_url = $1, title = $2
       WHERE LOWER(title) LIKE $3
       RETURNING id, title, cover_url`,
      [item.cover, item.cleanTitle, item.titleLike]
    );
    console.log(`Updated for ${item.titleLike}:`, res.rows);
  }

  await client.query(
    "UPDATE creator_content SET title = 'Private Equity & Angel Investing in Africa', cover_url = '/audience/covers/creative.jpg', media_url = '/audience/covers/creative.jpg' WHERE id = 'cc870741-d98e-4c68-9bc2-c9b1bfff5821'"
  );
  console.log('Post cc870741 updated.');

  const check = await client.query("SELECT id, title, cover_url, likes_count, comments_count FROM creator_content");
  console.log('All posts in DB now:');
  console.table(check.rows);

  await client.end();
}

updateCovers().catch(console.error);
