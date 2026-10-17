import pool from './src/db/pool';

async function promoteAdmin() {
  try {
    await pool.query("UPDATE users SET role = 'admin' WHERE email = 'kaluvictor130@gmail.com'");
    console.log('Successfully promoted kaluvictor to admin.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
promoteAdmin();
