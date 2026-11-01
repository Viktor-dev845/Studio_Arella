const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('Ensuring columns exist in creator_content...');
    await pool.query(`
      ALTER TABLE creator_content ADD COLUMN IF NOT EXISTS reposts_count INTEGER DEFAULT 0;
      ALTER TABLE creator_content ADD COLUMN IF NOT EXISTS quote_parent_id UUID REFERENCES creator_content(id) ON DELETE SET NULL;
      ALTER TABLE creator_content ADD COLUMN IF NOT EXISTS quote_post JSONB;
      CREATE INDEX IF NOT EXISTS idx_creator_content_quote_parent ON creator_content(quote_parent_id);
    `);

    const kaluPostId = 'bb656c21-5133-491c-ba43-94e95240f810';
    const darlenePostId = '802a65a2-b592-4f36-b0bb-d2e62183b610';

    // Fetch Darlene Black's post
    const darleneRes = await pool.query(`
      SELECT c.*, u.id as author_id, u.name as author_name, u.avatar as author_avatar, 
             COALESCE(NULLIF(u.creator_niche, ''), 'Podcasts') as author_role
      FROM creator_content c
      JOIN users u ON c.creator_id = u.id
      WHERE c.id = $1
    `, [darlenePostId]);

    if (darleneRes.rows.length === 0) {
      throw new Error(`Darlene post ${darlenePostId} not found in database!`);
    }

    const darlene = darleneRes.rows[0];

    const quotedPostSnapshot = {
      id: darlene.id,
      author: {
        id: darlene.author_id,
        name: darlene.author_name || 'Darlene Black',
        role: darlene.author_role || 'Podcasts',
        avatar: darlene.author_avatar || '/audience/darlene-black.png'
      },
      title: 'Modern Marriage & Relationship Wisdom',
      description: darlene.description || 'Honest, vulnerable conversations on emotional intimacy, resolving partnership conflicts, and flourishing together in love.',
      category: 'Podcasts',
      mediaUrl: darlene.cover_url || darlene.media_url || '/audience/covers/relationship.jpg',
      coverUrl: darlene.cover_url || darlene.media_url || '/audience/covers/relationship.jpg',
      duration: darlene.duration_text || '01:32:00'
    };

    console.log('Linking Kalu Victor post to Darlene Black podcast...');
    const updateRes = await pool.query(`
      UPDATE creator_content
      SET 
        quote_parent_id = $1,
        quote_post = $2::jsonb,
        content_type = 'quote',
        updated_at = NOW()
      WHERE id = $3
      RETURNING id, title, quote_parent_id, quote_post
    `, [darlenePostId, JSON.stringify(quotedPostSnapshot), kaluPostId]);

    console.log('Update result:', JSON.stringify(updateRes.rows[0], null, 2));

    // Also verify Darlene's post has reposts_count >= 1
    await pool.query(`
      UPDATE creator_content
      SET reposts_count = GREATEST(COALESCE(reposts_count, 0), 1)
      WHERE id = $1
    `, [darlenePostId]);

    console.log('✅ Seed data successfully linked!');
  } catch (err) {
    console.error('Error updating DB:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
