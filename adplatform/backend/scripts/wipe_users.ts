import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    const res = await pool.query(`SELECT id, email, role, credits, reserved_account_number FROM users`);
    console.log('--- ALL USERS ---');
    console.table(res.rows);

    // Delete all users except admin
    const deleteRes = await pool.query(`DELETE FROM users WHERE role != 'admin' RETURNING email, credits`);
    console.log(`\nDeleted ${deleteRes.rowCount} non-admin users.`);
    console.table(deleteRes.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

run();
