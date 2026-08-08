import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  const startDt = new Date("2026-08-09T06:00:00.000Z");
  const endDt = new Date("2026-08-09T06:02:00.000Z");
  const conflict = await pool.query(`
    SELECT id FROM booking_slots
    WHERE screen_id = $1
    AND (
      status = 'active'
      OR (status = 'locked' AND locked_until > NOW())
    )
    AND tstzrange(start_time, end_time) && tstzrange($2::timestamptz, $3::timestamptz)
  `, ['00000000-0000-0000-0000-000000000001', startDt.toISOString(), endDt.toISOString()]);
  console.log("Conflict rows:", conflict.rows);
  process.exit();
}
check();
