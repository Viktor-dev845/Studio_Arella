const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres'
});

const SEEDED_ITEMS = [
  // ─── WEALTH ───
  {
    creator_email: 'nermmen@studioarella.com',
    title: 'Tricks to Modern Wealth Creation',
    description: 'Proven investment frameworks, modern capital allocation, and digital cashflow models for new age wealth builders.',
    category: 'Wealth',
    tags: ['#wealth', '#finance', '#investing'],
    cover_url: '/audience/covers/wealth.jpg',
    media_url: '/audience/covers/wealth.jpg',
    duration_seconds: 6120,
    duration_text: '01:42:00',
    likes_count: 85,
    comments_count: 14,
    views_count: 1240,
    is_premium: true,
    price: 1500,
    badge_theme: 'gold',
  },
  {
    creator_email: 'adam@studioarella.com',
    title: 'Private Equity & Angel Investing in Africa',
    description: 'How high-conviction syndicates and venture angels back founders creating continent-wide financial breakthroughs.',
    category: 'Wealth',
    tags: ['#wealth', '#business', '#investing', '#equity'],
    cover_url: '/audience/covers/wealth.jpg',
    media_url: '/audience/covers/wealth.jpg',
    duration_seconds: 9319,
    duration_text: '02:35:19',
    likes_count: 148,
    comments_count: 12,
    views_count: 2310,
    is_premium: false,
    price: 0,
    badge_theme: 'gold',
  },

  // ─── HEALTH ───
  {
    creator_email: 'darlene@studioarella.com',
    title: 'Holistic Health & Vitality Tracking',
    description: 'Integrating bio-markers, functional sleep hygiene, and daily nutritional protocols for peak mental clarity.',
    category: 'Health',
    tags: ['#health', '#wellness', '#vitality', '#nutrition'],
    cover_url: '/audience/covers/health.jpg',
    media_url: '/audience/covers/health.jpg',
    duration_seconds: 5719,
    duration_text: '01:35:19',
    likes_count: 99,
    comments_count: 8,
    views_count: 1105,
    is_premium: false,
    price: 0,
    badge_theme: 'gold',
  },
  {
    creator_email: 'theresa@studioarella.com',
    title: 'Mind-Body Longevity & Cellular Reset',
    description: 'Evidence-based longevity routines, stress mitigation techniques, and daily habits to maximize lifespan and healthspan.',
    category: 'Health',
    tags: ['#health', '#longevity', '#wellness'],
    cover_url: '/audience/covers/health.jpg',
    media_url: '/audience/covers/health.jpg',
    duration_seconds: 4500,
    duration_text: '01:15:00',
    likes_count: 76,
    comments_count: 11,
    views_count: 940,
    is_premium: false,
    price: 0,
    badge_theme: 'gold',
  },

  // ─── POLITICS ───
  {
    creator_email: 'audrey@studioarella.com',
    title: 'Global Diplomacy & African Geopolitics',
    description: 'An in-depth analysis of African economic diplomacy, foreign policy shifts, and strategic multilateral trade alliances.',
    category: 'Politics',
    tags: ['#politics', '#diplomacy', '#geopolitics', '#governance'],
    cover_url: '/audience/covers/politics.jpg',
    media_url: '/audience/covers/politics.jpg',
    duration_seconds: 6420,
    duration_text: '01:47:00',
    likes_count: 112,
    comments_count: 23,
    views_count: 1850,
    is_premium: false,
    price: 0,
    badge_theme: 'gold',
  },
  {
    creator_email: 'adam@studioarella.com',
    title: 'Policy Innovation & Democratic Reform in Emerging Markets',
    description: 'Civic tech founders and legal scholars debate modern governance frameworks, constitutional design, and policy execution.',
    category: 'Politics',
    tags: ['#politics', '#policy', '#reform', '#civic'],
    cover_url: '/audience/covers/politics.jpg',
    media_url: '/audience/covers/politics.jpg',
    duration_seconds: 5280,
    duration_text: '01:28:00',
    likes_count: 64,
    comments_count: 9,
    views_count: 820,
    is_premium: false,
    price: 0,
    badge_theme: 'gold',
  },

  // ─── ENTERTAINMENT ───
  {
    creator_email: 'brandon@studioarella.com',
    title: 'The Voices of Umuahia: Heritage & Culture',
    description: 'Celebrated highlife musicians, oral historians, and cultural curators explore folklore, rhythms, and modern African music.',
    category: 'Entertainment',
    tags: ['#entertainment', '#culture', '#music', '#umuahia'],
    cover_url: '/audience/covers/culture.jpg',
    media_url: '/audience/covers/culture.jpg',
    duration_seconds: 4500,
    duration_text: '01:15:00',
    likes_count: 36,
    comments_count: 1,
    views_count: 420,
    is_premium: false,
    price: 0,
    badge_theme: 'gold',
  },
  {
    creator_email: 'nermmen@studioarella.com',
    title: 'The Art of Visual Storytelling & Cinema',
    description: 'Behind the lens with award-winning directors and cinematographers breaking conventions in indie African film.',
    category: 'Entertainment',
    tags: ['#entertainment', '#cinema', '#photography', '#art'],
    cover_url: '/audience/covers/creative.jpg',
    media_url: '/audience/covers/creative.jpg',
    duration_seconds: 6120,
    duration_text: '01:42:00',
    likes_count: 73,
    comments_count: 5,
    views_count: 890,
    is_premium: false,
    price: 0,
    badge_theme: 'gold',
  },

  // ─── BUSINESS ───
  {
    creator_email: 'theresa@studioarella.com',
    title: 'Scaling Emerging Media & Digital Billboards',
    description: 'Strategic playbook for modern media partners on monetizing outdoor DOOH networks, programmatic displays, and studio brands.',
    category: 'Business',
    tags: ['#business', '#billboards', '#marketing', '#media'],
    cover_url: '/audience/covers/media.jpg',
    media_url: '/audience/covers/media.jpg',
    duration_seconds: 4500,
    duration_text: '01:15:00',
    likes_count: 42,
    comments_count: 7,
    views_count: 670,
    is_premium: false,
    price: 0,
    badge_theme: 'gold',
  },

  // ─── FAMILY ───
  {
    creator_email: 'kyle@studioarella.com',
    title: 'Building Generational Family Legacies',
    description: 'Navigating inter-generational conversations, parenting values, family wealth, and creating lasting household resilience.',
    category: 'Family',
    tags: ['#family', '#parenting', '#legacy', '#home'],
    cover_url: '/audience/covers/relationship.jpg',
    media_url: '/audience/covers/relationship.jpg',
    duration_seconds: 4980,
    duration_text: '01:23:00',
    likes_count: 58,
    comments_count: 8,
    views_count: 780,
    is_premium: false,
    price: 0,
    badge_theme: 'gold',
  },

  // ─── RELATIONSHIP & MARRIAGE ───
  {
    creator_email: 'darlene@studioarella.com',
    title: 'Modern Marriage & Relationship Wisdom',
    description: 'Honest, vulnerable conversations on emotional intimacy, resolving partnership conflicts, and flourishing together in love.',
    category: 'Relationship',
    tags: ['#relationship', '#marriage', '#family', '#communication'],
    cover_url: '/audience/covers/relationship.jpg',
    media_url: '/audience/covers/relationship.jpg',
    duration_seconds: 5520,
    duration_text: '01:32:00',
    likes_count: 91,
    comments_count: 17,
    views_count: 1320,
    is_premium: false,
    price: 0,
    badge_theme: 'gold',
  },
  {
    creator_email: 'audrey@studioarella.com',
    title: 'Candid Conversations on Marriage & Trust',
    description: 'Deep dives into lifelong commitment, marital finances, boundary-setting, and mutual growth over decades.',
    category: 'Marriage',
    tags: ['#marriage', '#relationship', '#trust', '#family'],
    cover_url: '/audience/covers/relationship.jpg',
    media_url: '/audience/covers/relationship.jpg',
    duration_seconds: 4680,
    duration_text: '01:18:00',
    likes_count: 83,
    comments_count: 12,
    views_count: 1050,
    is_premium: false,
    price: 0,
    badge_theme: 'gold',
  }
];

async function seedGenrePodcasts() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL pooler...');

  // 1. Get creator IDs by email
  const usersRes = await client.query('SELECT id, email, name FROM users');
  const userMap = {};
  for (const u of usersRes.rows) {
    userMap[u.email] = u.id;
  }

  // Fallback creator id if specific email not found
  const fallbackCreatorId = usersRes.rows.find(u => u.id !== 'fc612a8c-4cf2-4dee-a5b5-34fc6a66b0ec')?.id || usersRes.rows[0].id;

  for (const item of SEEDED_ITEMS) {
    const creatorId = userMap[item.creator_email] || fallbackCreatorId;

    // Check if post with same title exists
    const existing = await client.query('SELECT id FROM creator_content WHERE LOWER(title) = LOWER($1)', [item.title]);

    if (existing.rows.length > 0) {
      await client.query(
        `UPDATE creator_content 
         SET description = $1, category = $2, tags = $3, cover_url = $4, media_url = $5,
             duration_seconds = $6, duration_text = $7, badge_theme = $8, status = 'published'
         WHERE id = $9`,
        [
          item.description,
          item.category,
          item.tags,
          item.cover_url,
          item.media_url,
          item.duration_seconds,
          item.duration_text,
          item.badge_theme,
          existing.rows[0].id
        ]
      );
      console.log(`Updated existing post: "${item.title}" [${item.category}]`);
    } else {
      await client.query(
        `INSERT INTO creator_content 
         (creator_id, title, description, content_type, media_url, cover_url, duration_seconds, duration_text, category, tags, is_premium, price, status, likes_count, comments_count, views_count, badge_theme, created_at, updated_at)
         VALUES ($1, $2, $3, 'podcast', $4, $5, $6, $7, $8, $9, $10, $11, 'published', $12, $13, $14, $15, NOW(), NOW())`,
        [
          creatorId,
          item.title,
          item.description,
          item.media_url,
          item.cover_url,
          item.duration_seconds,
          item.duration_text,
          item.category,
          item.tags,
          item.is_premium,
          item.price,
          item.likes_count,
          item.comments_count,
          item.views_count,
          item.badge_theme
        ]
      );
      console.log(`Inserted new post: "${item.title}" [${item.category}]`);
    }
  }

  // Log breakdown of categories in database
  const countRes = await client.query(`
    SELECT category, COUNT(*) as count 
    FROM creator_content 
    WHERE status = 'published' 
    GROUP BY category 
    ORDER BY count DESC
  `);
  console.log('\n--- Content Categories in DB ---');
  console.table(countRes.rows);

  await client.end();
}

seedGenrePodcasts().catch(console.error);
