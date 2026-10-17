import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const article = {
  title: "RMD URGES NIGERIANS TO STOP CONDEMNING NIGERIA, OFFER SOLUTIONS",
  category: "CULTURE",
  author_name: "Studio Arella",
  image_url: "/uploads/news/rmd.jpg",
  status: "published",
  published_at: new Date().toISOString(),
  reading_time_minutes: 3,
  excerpt: "Veteran actor and filmmaker Richard Mofe-Damijo has called on Nigerians to move away from constant criticism of the country and actively contribute towards national development and positive reputation building.",
  content: `Veteran actor and filmmaker, Richard Mofe-Damijo, popularly known as RMD, has urged Nigerians to stop condemning the country and instead contribute solutions to its challenges.

RMD made the call on Tuesday at the maiden edition of Pivot Nigeria, a thought-leadership conference themed, “The Reputation Dividend: Who Pays for Nigeria’s Perception?”

The veteran actor said Nigerians are often quick to criticise the country without taking steps to address the problems, stressing the need for citizens to contribute positively to national development.

He noted that while Nigerians should continue to demand better governance, they must also recognise that their individual conduct contributes to how Nigeria is perceived internationally.

RMD pointed to the global success of Nollywood and Afrobeats, as well as the achievements of Nigerian entrepreneurs such as Aliko Dangote, as examples of Nigerians helping to build the country’s reputation.

He, however, cautioned that changing Nigeria’s global image would not happen overnight, urging citizens to focus on constructive action and collective efforts towards building a better reputation for the country.`
};

async function insertArticle() {
  try {
    await pool.query(
      `INSERT INTO blog_posts (title, category, excerpt, content, author_name, image_url, status, published_at, reading_time_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [article.title, article.category, article.excerpt, article.content, article.author_name, article.image_url, article.status, article.published_at, article.reading_time_minutes]
    );
    console.log('✅ RMD article published successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

insertArticle();
