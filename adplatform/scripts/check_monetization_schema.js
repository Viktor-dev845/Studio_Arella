const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const userCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
    console.log('USERS COLUMNS:', userCols.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));

    const tables = ['creator_wallets', 'creator_earnings_ledger', 'creator_tips', 'payout_requests', 'creator_membership_plans', 'fan_subscriptions', 'premium_content_purchases', 'creator_content'];
    for (const t of tables) {
      const cols = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t}' ORDER BY ordinal_position`);
      console.log(`\nTABLE ${t}:`, cols.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await pool.end();
  }
}

run();
