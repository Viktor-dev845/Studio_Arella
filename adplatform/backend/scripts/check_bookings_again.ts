import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  const b = await pool.query('SELECT id, status, booking_number, start_time FROM bookings');
  console.log("Bookings:", b.rows);
  const s = await pool.query('SELECT id, status, start_time FROM booking_slots');
  console.log("Slots:", s.rows);
  process.exit();
}
check();
