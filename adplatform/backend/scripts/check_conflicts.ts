import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  const b = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5');
  console.log("Recent Bookings:", b.rows);
  const s = await pool.query('SELECT * FROM booking_slots ORDER BY created_at DESC LIMIT 5');
  console.log("Recent Slots:", s.rows);
  process.exit();
}
check();
