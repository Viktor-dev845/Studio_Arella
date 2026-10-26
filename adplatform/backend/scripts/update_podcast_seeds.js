const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateCovers() {
  // Update existing content covers to distinct podcast artwork and clean titles
  await pool.query(`
    UPDATE creator_content 
    SET cover_url = '/audience/podcast-scthon.png', media_url = '/audience/podcast-scthon.png', title = 'Wealth servicing podcast'
    WHERE title ILIKE '%Wealth servicing%'
  `);
  await pool.query(`
    UPDATE creator_content 
    SET cover_url = '/audience/podcast-drozd.png', media_url = '/audience/podcast-drozd.png', title = 'Healthy Tracking podcast'
    WHERE title ILIKE '%Healthy Tracking%'
  `);
  await pool.query(`
    UPDATE creator_content 
    SET cover_url = '/audience/podcast-zara.png', media_url = '/audience/podcast-zara.png', title = 'Trick to wealth creation podcast'
    WHERE title ILIKE '%Trick to wealth%'
  `);
  await pool.query(`
    UPDATE creator_content 
    SET cover_url = '/audience/plant-podcast.png', media_url = '/audience/plant-podcast.png', title = 'Photo is perfect podcast'
    WHERE title ILIKE '%Photo is perfect%'
  `);

  // Add 2 more distinct episodes for Theresa and Darlene
  const theresa = await pool.query("SELECT id FROM users WHERE email = 'theresa@studioarella.com'");
  if (theresa.rows.length > 0) {
    await pool.query(`
      INSERT INTO creator_content (
        creator_id, title, description, content_type, media_url, cover_url, 
        duration_seconds, duration_text, category, tags, is_premium, price, 
        likes_count, comments_count, badge_theme, status
      ) VALUES (
        $1, 'Scaling Emerging Media & Billboards', 'How digital billboard networks and creator audio fuse together for maximum reach in Abia State.',
        'audio', '/audience/podcast-video-thumb.png', '/audience/podcast-video-thumb.png',
        4500, '01:15:00', 'Business', ARRAY['#billboards', '#umuahia', '#creators'],
        false, 0.00, 142, 19, 'gold', 'published'
      ) ON CONFLICT DO NOTHING
    `, [theresa.rows[0].id]);
  }

  const darlene = await pool.query("SELECT id FROM users WHERE email = 'darlene@studioarella.com'");
  if (darlene.rows.length > 0) {
    await pool.query(`
      INSERT INTO creator_content (
        creator_id, title, description, content_type, media_url, cover_url, 
        duration_seconds, duration_text, category, tags, is_premium, price, 
        likes_count, comments_count, badge_theme, status
      ) VALUES (
        $1, 'The Voices of Umuahia Podcast', 'Conversations with local artists, music producers, and cultural innovators at Bems Junction.',
        'audio', '/audience/design-conference.png', '/audience/design-conference.png',
        5280, '01:28:00', 'Entertainment', ARRAY['#music', '#umuahia', '#events'],
        false, 0.00, 218, 34, 'green', 'published'
      ) ON CONFLICT DO NOTHING
    `, [darlene.rows[0].id]);
  }

  const list = await pool.query(`
    SELECT c.title, c.cover_url, u.name, u.avatar 
    FROM creator_content c 
    JOIN users u ON c.creator_id = u.id
    WHERE c.status = 'published'
    ORDER BY c.created_at DESC
  `);
  console.log('Updated database creator content:');
  console.log(list.rows);
  await pool.end();
}

updateCovers();
