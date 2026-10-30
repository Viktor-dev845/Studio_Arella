const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function creditUser() {
  const email = 'kaluviktor200@gmail.com';
  const amount = 100000.00;

  try {
    const userRes = await pool.query('SELECT id, name, email, credits FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      console.error(`User with email ${email} not found!`);
      return;
    }
    const user = userRes.rows[0];
    console.log(`Found user: ${user.name} (${user.id}), Current credits: ₦${user.credits || 0}`);

    const updateRes = await pool.query(
      'UPDATE users SET credits = credits + $1 WHERE id = $2 RETURNING credits',
      [amount, user.id]
    );
    const newCredits = updateRes.rows[0].credits;

    await pool.query(
      `INSERT INTO transactions (user_id, type, source, amount, description, reference)
       VALUES ($1, 'credit', 'top_up', $2, 'Wallet funding (E2E Test Credits)', $3)`,
      [user.id, amount, `TOPUP-TEST-${Date.now()}`]
    );

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES ($1, 'payment_received', 'Credits added!', $2, '/finances')`,
      [user.id, `₦${amount.toLocaleString()} has been added to your Studio Arella balance.`]
    );

    console.log(`✅ Successfully credited ₦${amount.toLocaleString()} to ${email}!`);
    console.log(`New balance: ₦${newCredits}`);
  } catch (err) {
    console.error('Error crediting user:', err);
  } finally {
    await pool.end();
  }
}

creditUser();
