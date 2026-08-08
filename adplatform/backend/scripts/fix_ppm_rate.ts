import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Adding ppm_rate to ads table...');
    await pool.query('ALTER TABLE ads ADD COLUMN IF NOT EXISTS ppm_rate DECIMAL(10,2) DEFAULT 1000;');
    console.log('✅ Added ppm_rate to ads successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err);
    process.exit(1);
  }
}

run();
