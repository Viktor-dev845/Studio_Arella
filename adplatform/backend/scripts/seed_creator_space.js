const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  console.log('🌱 Seeding Studio Arella Creator Space data...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // 1. Create or upsert Creators
    const creators = [
      {
        email: 'adam@studioarella.com',
        name: 'Adam Udochi',
        bio: 'UI/UX Designer & Audio Producer exploring health, tech, and digital wealth creation.',
        avatar: '/audience/adam-udochi.png',
        niche: 'Design & Tech',
        tier: 'pro'
      },
      {
        email: 'nermmen@studioarella.com',
        name: 'Nermmen Saif',
        bio: 'Designer creator passionate about photography, creative lifestyle, and wealth building.',
        avatar: '/audience/nermmen-saif.png',
        niche: 'Photography & Creative',
        tier: 'pro'
      },
      {
        email: 'kyle@studioarella.com',
        name: 'Kyle Fisher',
        bio: 'Product Designer building modern consumer interfaces.',
        avatar: '/audience/kyle-fisher.png',
        niche: 'Product Design',
        tier: 'free'
      },
      {
        email: 'theresa@studioarella.com',
        name: 'Theresa Steward',
        bio: 'Executive Producer & Talent Recruiter.',
        avatar: '/audience/theresa-steward.png',
        niche: 'Business',
        tier: 'pro'
      },
      {
        email: 'darlene@studioarella.com',
        name: 'Darlene Black',
        bio: 'Podcast Host & Storyteller.',
        avatar: '/audience/darlene-black.png',
        niche: 'Podcasts',
        tier: 'pro'
      },
      {
        email: 'brandon@studioarella.com',
        name: 'Brandon Wilson',
        bio: 'Linguist and Tech Creator.',
        avatar: '/audience/brandon-wilson.png',
        niche: 'Education',
        tier: 'free'
      },
      {
        email: 'audrey@studioarella.com',
        name: 'Audrey Alexander',
        bio: 'Community Manager & Event Host.',
        avatar: '/audience/audrey-alexander.png',
        niche: 'Culture',
        tier: 'free'
      }
    ];

    const creatorIds = {};

    for (const c of creators) {
      const userRes = await client.query(
        `INSERT INTO users (name, email, password, avatar, bio, is_creator, creator_tier, creator_verified, creator_niche, role)
         VALUES ($1, $2, $3, $4, $5, true, $6, true, $7, 'creator')
         ON CONFLICT (email) DO UPDATE SET 
           name = EXCLUDED.name,
           avatar = EXCLUDED.avatar,
           bio = EXCLUDED.bio,
           is_creator = true,
           creator_tier = EXCLUDED.creator_tier,
           creator_niche = EXCLUDED.creator_niche
         RETURNING id`,
        [c.name, c.email, hashedPassword, c.avatar, c.bio, c.tier, c.niche]
      );
      creatorIds[c.email] = userRes.rows[0].id;

      // Seed Creator Wallet
      await client.query(
        `INSERT INTO creator_wallets (creator_id, available_balance, pending_balance, total_earned, currency)
         VALUES ($1, 24500.00, 5000.00, 48500.00, 'NGN')
         ON CONFLICT (creator_id) DO NOTHING`,
        [creatorIds[c.email]]
      );

      // Seed Membership Plan for Adam and Nermmen
      if (c.email === 'adam@studioarella.com' || c.email === 'nermmen@studioarella.com') {
        await client.query(
          `INSERT INTO creator_membership_plans (creator_id, name, description, price, interval)
           VALUES ($1, 'Monthly VIP Community', 'Access all exclusive audio broadcasts, private live sessions, and community rewards.', 1000.00, 'monthly')
           ON CONFLICT DO NOTHING`,
          [creatorIds[c.email]]
        );
      }
    }

    const adamId = creatorIds['adam@studioarella.com'];
    const nermmenId = creatorIds['nermmen@studioarella.com'];
    const kyleId = creatorIds['kyle@studioarella.com'];

    // 2. Seed Creator Content (Podcasts & Feed Posts)
    const contentItems = [
      {
        creator_id: adamId,
        title: 'Wealth servicing podcast',
        description: 'Actionable financial intelligence and wealth management frameworks for creative professionals.',
        content_type: 'audio',
        media_url: '/audience/podcast-scthon.png',
        cover_url: '/audience/podcast-scthon.png',
        duration_seconds: 9319,
        duration_text: '02:35:19',
        category: 'Wealth',
        tags: ['#business', '#freelance'],
        is_premium: false,
        price: 0.00,
        likes_count: 148,
        comments_count: 12,
        badge_theme: 'gold'
      },
      {
        creator_id: adamId,
        title: 'Healthy Tracking podcast',
        description: 'Explore the daily routines, tracking mechanisms, and habits of high performers.',
        content_type: 'audio',
        media_url: '/audience/podcast-drozd.png',
        cover_url: '/audience/podcast-drozd.png',
        duration_seconds: 9319,
        duration_text: '02:35:19',
        category: 'Health',
        tags: ['#work', '#business', '#hr'],
        is_premium: false,
        price: 0.00,
        likes_count: 99,
        comments_count: 8,
        badge_theme: 'gold'
      },
      {
        creator_id: nermmenId,
        title: 'Trick to wealth creation podcast',
        description: 'Tactics and tools for scaling creator revenue in emerging markets.',
        content_type: 'audio',
        media_url: '/audience/podcast-zara.png',
        cover_url: '/audience/podcast-zara.png',
        duration_seconds: 6120,
        duration_text: '01:42:00',
        category: 'Wealth',
        tags: ['#digital', '#freelance'],
        is_premium: true,
        price: 1500.00,
        likes_count: 85,
        comments_count: 14,
        badge_theme: 'green'
      },
      {
        creator_id: nermmenId,
        title: 'Photo is perfect podcast',
        description: 'A deep dive into visual composition, lighting, and how creators monetize imagery.',
        content_type: 'audio',
        media_url: '/audience/plant-podcast.png',
        cover_url: '/audience/plant-podcast.png',
        duration_seconds: 6120,
        duration_text: '01:42:00',
        category: 'Design',
        tags: ['#userinterface', '#digital'],
        is_premium: false,
        price: 0.00,
        likes_count: 73,
        comments_count: 5,
        badge_theme: 'green'
      }
    ];

    for (const item of contentItems) {
      await client.query(
        `INSERT INTO creator_content (
           creator_id, title, description, content_type, media_url, cover_url, 
           duration_seconds, duration_text, category, tags, is_premium, price, 
           likes_count, comments_count, badge_theme, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'published')
         ON CONFLICT DO NOTHING`,
        [
          item.creator_id, item.title, item.description, item.content_type,
          item.media_url, item.cover_url, item.duration_seconds, item.duration_text,
          item.category, item.tags, item.is_premium, item.price,
          item.likes_count, item.comments_count, item.badge_theme
        ]
      );
    }

    // 3. Seed Live Experiences matching Figma
    const liveItems = [
      {
        name: '1 View fan event',
        description: 'A place where fun things are discussed......',
        participants_count: 115,
        moderators_count: 2,
        prize_banner_text: 'Free community membership for non-members attendees',
        status: 'live'
      },
      {
        name: '1 View fan event',
        description: 'A place where fun things are discussed......',
        participants_count: 115,
        moderators_count: 2,
        prize_banner_text: 'Free community membership for non-members attendees',
        status: 'live'
      },
      {
        name: '1 View fan event',
        description: 'A place where fun things are discussed......',
        participants_count: 115,
        moderators_count: 2,
        prize_banner_text: 'Free community membership for non-members attendees',
        status: 'live'
      }
    ];

    for (const live of liveItems) {
      const liveRes = await client.query(
        `INSERT INTO live_experiences (
           creator_id, name, description, participants_count, moderators_count, 
           prize_banner_text, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [adamId, live.name, live.description, live.participants_count, live.moderators_count, live.prize_banner_text, live.status]
      );

      const eventId = liveRes.rows[0].id;

      // Seed comments for event
      const c1Res = await client.query(
        `INSERT INTO live_experience_messages (event_id, user_id, message, likes_count)
         VALUES ($1, $2, 'Nice event. Leaning more about the autonft ultra project is an eye opener for community members looking forward to massive reward like this', 8)
         RETURNING id`,
        [eventId, adamId]
      );

      await client.query(
        `INSERT INTO live_experience_messages (event_id, user_id, parent_id, message, likes_count)
         VALUES ($1, $2, $3, 'Nice event. Leaning more about the autonft ultra project is an eye opener for community members looking forward to massive reward like this', 8)`,
        [eventId, kyleId, c1Res.rows[0].id]
      );
    }

    // 4. Seed Direct Messages between Adam and Kyle
    const convRes = await client.query(
      `INSERT INTO conversations (participant_one_id, participant_two_id, last_message_text)
       VALUES ($1, $2, 'So, it’s up to you!')
       ON CONFLICT (participant_one_id, participant_two_id) DO UPDATE SET last_message_text = EXCLUDED.last_message_text
       RETURNING id`,
      [adamId, kyleId]
    );

    const convId = convRes.rows[0].id;

    const dms = [
      { sender_id: kyleId, recipient_id: adamId, text: 'Oh, sh#t! This junior designers!!!!!!!!!!!!!!!!' },
      { sender_id: adamId, recipient_id: kyleId, text: 'Hi, Kyle. How are you doing? Did you get that job yesterday?' },
      { sender_id: kyleId, recipient_id: adamId, text: 'Nope, they kicked me out of the office!' },
      { sender_id: adamId, recipient_id: kyleId, text: 'Wow! I can invite you in my new project. We need a product designer right now!' },
      { sender_id: kyleId, recipient_id: adamId, text: 'It’ll be great! I need this job, but...' },
      { sender_id: kyleId, recipient_id: adamId, text: 'So, it’s up to you!' }
    ];

    for (const dm of dms) {
      await client.query(
        `INSERT INTO direct_messages (conversation_id, sender_id, recipient_id, message_text, is_read)
         VALUES ($1, $2, $3, $4, true)`,
        [convId, dm.sender_id, dm.recipient_id, dm.text]
      );
    }

    // 5. Seed Notifications
    const notifs = [
      { user_id: adamId, type: 'comment_reply', title: 'New Reply', body: 'Create king replied your comment', read: false },
      { user_id: adamId, type: 'comment_reply', title: 'New Reply', body: 'Create king replied your comment', read: false },
      { user_id: adamId, type: 'comment_reply', title: 'New Reply', body: 'Create king replied your comment', read: false },
      { user_id: adamId, type: 'comment_reply', title: 'New Reply', body: 'Create king replied your comment', read: true }
    ];

    for (const n of notifs) {
      await client.query(
        `INSERT INTO notifications (user_id, type, title, body, read)
         VALUES ($1, $2, $3, $4, $5)`,
        [n.user_id, n.type, n.title, n.body, n.read]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Studio Arella Creator Space seed data successfully inserted!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
