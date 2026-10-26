import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres';

declare global {
  // allow global pool across hot reloads in development
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

const pool =
  global.__pgPool ||
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== 'production') {
  global.__pgPool = pool;
}

export default pool;
