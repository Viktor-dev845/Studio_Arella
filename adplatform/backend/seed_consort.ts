import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const article = {
  title: "High Chief Pastra Etie Joins Abia North Stakeholders to Back Good Governance",
  category: "POLITICS",
  excerpt: "In a powerful show of unity, High Chief Pastra Etie joined prominent Abia North stakeholders at a special reception to endorse good governance initiatives in the region.",
  content: `In a powerful show of unity, High Chief Pastra Etie joined prominent Abia North stakeholders at a special reception to endorse good governance initiatives in the region.

The event, which was heavily attended by political stalwarts, traditional rulers, and community leaders, was marked by a unified call for progress, accountability, and accelerated development across Abia North.

## A Unified Front for Progress

Speaking at the gathering, stakeholders emphasized the importance of setting aside partisan differences to focus on the collective development of the senatorial zone. The presence of High Chief Pastra Etie, a respected voice in the region, was seen as a major boost to the ongoing governance advocacy.

"We are here to make a statement that Abia North is united in its demand for good governance. Our people deserve infrastructure, security, and economic empowerment," one of the key speakers noted during the reception.

## Recognizing Contributions

The event also served as an opportunity to welcome and honor Sir and Lady Johnson Chukwu for their continuous contributions to the socio-economic upliftment of the area. A massive banner welcoming the couple was proudly displayed at the venue, underscoring their importance to the community's progress.

The stakeholders resolved to maintain regular consultations and work closely with the government to ensure that the dividends of democracy reach the grassroots in Abia North.`,
  author_name: "Consort News",
  image_url: "https://images.unsplash.com/photo-1575494294024-5d51cb592231?q=80&w=1200&auto=format&fit=crop", // Placeholder event image
  status: "published",
  published_at: new Date().toISOString(),
  reading_time_minutes: 3
};

async function seedConsort() {
  try {
    console.log('Inserting ConsortNews article...');
    await pool.query(
      `INSERT INTO blog_posts (title, category, excerpt, content, author_name, image_url, status, published_at, reading_time_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [article.title, article.category, article.excerpt, article.content, article.author_name, article.image_url, article.status, article.published_at, article.reading_time_minutes]
    );
    console.log('Successfully published the ConsortNews article!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    pool.end();
  }
}

seedConsort();
