import 'dotenv/config'; // MUST be at the top before other imports that use process.env
import express from 'express'; // nodemon restart trigger 2
import cors from 'cors';
import path from 'path';
import router from './routes';
import { startBookingLifecycleCron } from './cron/bookingLifecycle';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://studio-arella.vercel.app',
  'https://studioarella.com',
  'https://www.studioarella.com',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, webhooks)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Allow all Vercel preview deployments
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Raw body ONLY for Paystack webhook (Paystack HMAC is computed on the raw buffer)
app.use('/api/payments/webhook/paystack', express.raw({ type: 'application/json' }));

// JSON body parser for everything else — including the Monnify webhook
// (Monnify HMAC is verified against JSON.stringify(req.body) of the parsed object)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Serve uploaded files ──────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', router);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({
  status: 'ok',
  platform: 'Studio Arella — Bems Screens',
  timestamp: new Date().toISOString(),
}));

import pool from './db/pool';

app.listen(PORT, async () => {
  console.log(`\n🟠 Studio Arella Backend running on port ${PORT}`);
  console.log(`   Platform: Bems Screens — Bems Junction, Umuahia`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  
  // HOTFIX: Ensure booking_slots table exists in production database
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS booking_slots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
        screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        status VARCHAR(50) DEFAULT 'locked',
        locked_until TIMESTAMPTZ,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ booking_slots table verified');

    // Migration: Add reserved account columns to users table
    await pool.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS reserved_account_reference VARCHAR(255),
        ADD COLUMN IF NOT EXISTS reserved_account_number VARCHAR(50),
        ADD COLUMN IF NOT EXISTS reserved_account_bank VARCHAR(100);
    `);
    console.log('✅ users table reserved account columns verified');

    // HOTFIX: Ensure podcast content + review tables exist in production database
    await pool.query(`
      CREATE TABLE IF NOT EXISTS podcasts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        cover_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS podcast_episodes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        episode_number INTEGER,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        cover_url TEXT,
        audio_url TEXT NOT NULL,
        duration_seconds INTEGER,
        content_rating VARCHAR(20) DEFAULT 'everyone',
        scheduled_at TIMESTAMPTZ,
        status VARCHAR(20) DEFAULT 'published',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_podcasts_user_id ON podcasts(user_id);
      CREATE INDEX IF NOT EXISTS idx_podcast_episodes_podcast_id ON podcast_episodes(podcast_id);
      CREATE TABLE IF NOT EXISTS booking_reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        booking_type VARCHAR(20) NOT NULL,
        booking_id UUID NOT NULL,
        title VARCHAR(255),
        body TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_reviews_one_per_booking ON booking_reviews(booking_type, booking_id);
      ALTER TABLE podcast_bookings ADD COLUMN IF NOT EXISTS notes TEXT;
      ALTER TABLE podcast_bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
      ALTER TABLE podcast_bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
      ALTER TABLE podcast_bookings ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2);
      ALTER TABLE podcast_bookings ADD COLUMN IF NOT EXISTS series_id UUID;
      CREATE INDEX IF NOT EXISTS idx_podcast_bookings_series_id ON podcast_bookings(series_id);
    `);
    console.log('✅ podcast content + review tables verified');

    // HOTFIX: podcast_bookings.start_time/end_time were originally created as
    // TIMESTAMP (no time zone), which silently discards the 'Z'/offset on any
    // ISO string sent from the client — causing stored times to drift by the
    // server's local UTC offset. Convert to TIMESTAMPTZ once, interpreting the
    // existing naive value as UTC (matching how it was already being read),
    // so no existing booking's actual time shifts during the migration.
    const podcastTimeColType = await pool.query(
      `SELECT data_type FROM information_schema.columns WHERE table_name = 'podcast_bookings' AND column_name = 'start_time'`
    );
    if (podcastTimeColType.rows[0]?.data_type === 'timestamp without time zone') {
      await pool.query(`
        ALTER TABLE podcast_bookings
          ALTER COLUMN start_time TYPE TIMESTAMPTZ USING start_time AT TIME ZONE 'UTC',
          ALTER COLUMN end_time TYPE TIMESTAMPTZ USING end_time AT TIME ZONE 'UTC';
      `);
      console.log('✅ podcast_bookings start_time/end_time migrated to TIMESTAMPTZ');
    }
  } catch (err) {
    console.error('❌ Failed to run database migrations:', err);
  }

  startBookingLifecycleCron();
});

export default app;
