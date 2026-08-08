import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  const s = await pool.query('SELECT count(*) FROM booking_slots');
  console.log("Total Slots:", s.rows[0].count);
  const slots = await pool.query('SELECT id, start_time, end_time, status, locked_until FROM booking_slots');
  console.log("All Slots:", slots.rows);
  process.exit();
}
check();
