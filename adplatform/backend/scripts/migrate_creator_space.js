const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const MIGRATION_SQL = `
-- ── 1. EXTEND USERS TABLE FOR CREATORS ──────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_creator BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS creator_tier VARCHAR(20) DEFAULT 'free'; -- 'free' | 'pro'
ALTER TABLE users ADD COLUMN IF NOT EXISTS creator_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS creator_niche VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pro_subscription_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pro_auto_renew BOOLEAN DEFAULT true;

-- ── 2. CREATOR CONTENT (POSTS, PODCASTS, VIDEOS, SERIES) ────────────────────
CREATE TABLE IF NOT EXISTS creator_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) DEFAULT 'audio', -- 'audio' | 'video' | 'post' | 'series' | 'episode'
  media_url TEXT,
  cover_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  duration_text VARCHAR(50) DEFAULT '00:00:00',
  category VARCHAR(100) DEFAULT 'General',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_premium BOOLEAN DEFAULT false,
  price DECIMAL(10,2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'published', -- 'draft' | 'scheduled' | 'published' | 'archived'
  scheduled_at TIMESTAMPTZ,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  badge_theme VARCHAR(20) DEFAULT 'gold', -- 'gold' | 'green'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_content_creator ON creator_content(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_content_status ON creator_content(status);
CREATE INDEX IF NOT EXISTS idx_creator_content_category ON creator_content(category);
CREATE INDEX IF NOT EXISTS idx_creator_content_created ON creator_content(created_at DESC);

-- ── 3. CONTENT LIKES ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creator_content_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES creator_content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_content_likes_content ON creator_content_likes(content_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_user ON creator_content_likes(user_id);

-- ── 4. CONTENT COMMENTS (WITH NESTED REPLIES) ───────────────────────────────
CREATE TABLE IF NOT EXISTS creator_content_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES creator_content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES creator_content_comments(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_comments_content ON creator_content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_parent ON creator_content_comments(parent_id);

-- ── 5. USER BOOKMARKS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES creator_content(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user ON user_bookmarks(user_id);

-- ── 6. CREATOR MEMBERSHIP PLANS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creator_membership_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL DEFAULT 'Monthly Community Membership',
  description TEXT DEFAULT 'Access all exclusive creator podcasts, live rooms, and private community discussions',
  price DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
  interval VARCHAR(20) DEFAULT 'monthly',
  benefits JSONB DEFAULT '["Exclusive audio broadcasts", "Private live sessions", "Direct messaging priority", "Members badge"]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_membership_plans_creator ON creator_membership_plans(creator_id);

-- ── 7. FAN SUBSCRIPTIONS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fan_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fan_id UUID REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES creator_membership_plans(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
  creator_share DECIMAL(10,2) NOT NULL DEFAULT 850.00, -- 85% creator, 15% Studio Arella platform fee
  platform_fee DECIMAL(10,2) NOT NULL DEFAULT 150.00,
  status VARCHAR(50) DEFAULT 'active', -- 'active' | 'cancelled' | 'expired'
  payment_reference VARCHAR(255),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  renews_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fan_subscriptions_fan ON fan_subscriptions(fan_id);
CREATE INDEX IF NOT EXISTS idx_fan_subscriptions_creator ON fan_subscriptions(creator_id);
CREATE INDEX IF NOT EXISTS idx_fan_subscriptions_status ON fan_subscriptions(status);

-- ── 8. CREATOR TIPS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creator_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fan_id UUID REFERENCES users(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES creator_content(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  creator_share DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  message TEXT,
  payment_reference VARCHAR(255),
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_tips_creator ON creator_tips(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_tips_fan ON creator_tips(fan_id);

-- ── 9. PREMIUM CONTENT PURCHASES (PAY-PER-VIEW) ─────────────────────────────
CREATE TABLE IF NOT EXISTS premium_content_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES creator_content(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  creator_share DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  payment_reference VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_premium_purchases_user ON premium_content_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_purchases_content ON premium_content_purchases(content_id);

-- ── 10. LIVE EXPERIENCES / STREAM ROOMS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  stream_url TEXT,
  cover_url TEXT,
  category VARCHAR(100) DEFAULT 'General',
  participants_count INTEGER DEFAULT 0,
  moderators_count INTEGER DEFAULT 2,
  prize_banner_text TEXT DEFAULT 'Free community membership for non-members attendees',
  ticket_price DECIMAL(10,2) DEFAULT 0.00,
  is_members_only BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'live', -- 'upcoming' | 'live' | 'ended'
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_exp_creator ON live_experiences(creator_id);
CREATE INDEX IF NOT EXISTS idx_live_exp_status ON live_experiences(status);

-- ── 11. LIVE EXPERIENCE ATTENDEES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_experience_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES live_experiences(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_live_att_event ON live_experience_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_live_att_user ON live_experience_attendees(user_id);

-- ── 12. LIVE EXPERIENCE CHAT MESSAGES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_experience_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES live_experiences(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES live_experience_messages(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_msg_event ON live_experience_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_live_msg_parent ON live_experience_messages(parent_id);

-- ── 13. CREATOR WALLETS & EARNINGS LEDGER ──────────────────────────────────
CREATE TABLE IF NOT EXISTS creator_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  available_balance DECIMAL(12,2) DEFAULT 0.00,
  pending_balance DECIMAL(12,2) DEFAULT 0.00,
  total_earned DECIMAL(12,2) DEFAULT 0.00,
  total_withdrawn DECIMAL(12,2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'NGN',
  bank_name VARCHAR(100),
  bank_code VARCHAR(50),
  account_number VARCHAR(50),
  account_name VARCHAR(255),
  recipient_code VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS creator_earnings_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source_type VARCHAR(50) NOT NULL, -- 'membership' | 'tip' | 'premium_content' | 'live_event'
  source_id UUID,
  gross_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'available', -- 'pending' | 'available'
  description VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_earnings_creator ON creator_earnings_ledger(creator_id);

-- ── 14. PAYOUT REQUESTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  transfer_code VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'processing' | 'success' | 'failed' | 'rejected'
  failure_reason TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payout_creator ON payout_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_payout_status ON payout_requests(status);

-- ── 15. CONVERSATIONS & DIRECT MESSAGES (1-ON-1 CHAT) ──────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_one_id UUID REFERENCES users(id) ON DELETE CASCADE,
  participant_two_id UUID REFERENCES users(id) ON DELETE CASCADE,
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_one_id, participant_two_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_part_one ON conversations(participant_one_id);
CREATE INDEX IF NOT EXISTS idx_conv_part_two ON conversations(participant_two_id);

CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  media_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dm_conversation ON direct_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_dm_recipient ON direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_dm_created ON direct_messages(created_at ASC);
`;

async function runMigration() {
  console.log('🚀 Starting Studio Arella Creator Space Migration...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(MIGRATION_SQL);
    await client.query('COMMIT');
    console.log('✅ Creator Space Database Schema applied successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
