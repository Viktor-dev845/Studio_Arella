const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const cards = await pool.query('SELECT * FROM saved_cards');
    console.log('--- Saved Cards in Database ---');
    console.log(`Count: ${cards.rows.length}`);
    console.log(cards.rows);

    const txns = await pool.query(`
      SELECT id, user_id, type, source, amount, description, reference, created_at 
      FROM transactions 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    console.log('\n--- Recent Card Transactions ---');
    console.log(txns.rows);

    const users = await pool.query(`
      SELECT id, name, email, credits 
      FROM users 
      WHERE email = 'kaluvictor130@gmail.com'
    `);
    console.log('\n--- Kalu Victor User Info ---');
    console.log(users.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
