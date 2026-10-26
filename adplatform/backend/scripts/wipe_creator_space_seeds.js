const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function wipeSeeds() {
  console.log('🧹 Cleaning up seeded Creator Space data...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Seeded creator emails
    const seededEmails = [
      'adam@studioarella.com',
      'nermmen@studioarella.com',
      'kyle@studioarella.com',
      'theresa@studioarella.com',
      'darlene@studioarella.com',
      'brandon@studioarella.com',
      'audrey@studioarella.com'
    ];

    // Find seeded creator user IDs
    const userRes = await client.query(
      'SELECT id FROM users WHERE email = ANY($1)',
      [seededEmails]
    );
    const seededUserIds = userRes.rows.map(r => r.id);

    if (seededUserIds.length > 0) {
      // 1. Delete creator content created by seeded users
      await client.query(
        'DELETE FROM creator_content WHERE creator_id = ANY($1)',
        [seededUserIds]
      );

      // 2. Delete live experiences created by seeded users
      await client.query(
        'DELETE FROM live_experiences WHERE creator_id = ANY($1)',
        [seededUserIds]
      );

      // 3. Delete membership plans created by seeded users
      await client.query(
        'DELETE FROM creator_membership_plans WHERE creator_id = ANY($1)',
        [seededUserIds]
      );

      // 4. Delete wallets created for seeded users
      await client.query(
        'DELETE FROM creator_wallets WHERE creator_id = ANY($1)',
        [seededUserIds]
      );

      // 5. Delete direct messages and conversations involving seeded users
      await client.query(
        `DELETE FROM direct_messages 
         WHERE sender_id = ANY($1) OR recipient_id = ANY($1)`,
        [seededUserIds]
      );
      await client.query(
        `DELETE FROM conversations 
         WHERE participant_one_id = ANY($1) OR participant_two_id = ANY($1)`,
        [seededUserIds]
      );

      // 6. Delete notifications for seeded users
      await client.query(
        'DELETE FROM notifications WHERE user_id = ANY($1)',
        [seededUserIds]
      );

      // 7. Delete the seeded users themselves
      await client.query(
        'DELETE FROM users WHERE id = ANY($1)',
        [seededUserIds]
      );
    }

    await client.query('COMMIT');
    console.log(`✅ Successfully wiped seeded creator data (${seededUserIds.length} seeded users and associated content).`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Wipe failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

wipeSeeds();
