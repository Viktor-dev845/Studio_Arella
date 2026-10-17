import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const article = {
  title: "ABIA RANKS SECOND NATIONALLY IN REVISED 2026 STATE PERFORMANCE INDEX",
  category: "POLITICS",
  author_name: "Studio Arella",
  image_url: "/uploads/news/otti-pspi.jpg",
  status: "published",
  published_at: new Date().toISOString(),
  reading_time_minutes: 4,
  excerpt: "Abia State has been ranked second nationally in the revised 2026 pSPI State Performance Index, recording the largest improvement in ranking across the 2024, 2025 and 2026 assessments.",
  content: `Abia State has been ranked second nationally in the revised 2026 pSPI State Performance Index, recording the largest improvement in ranking across the 2024, 2025 and 2026 assessments — a remarkable rise that governance analysts say is without precedent in the history of the index.

The revised report, released by Phillips Consulting (pcl.) in late September 2026, places Abia second in the 2026 assessment, following its movement from 36th position in 2024 to 10th in 2025 and now 2nd in 2026. That represents a net gain of 34 places — the largest overall momentum swing recorded among the 33 states assessed.

According to the report, the revised index separates a state's current performance from its overall performance trajectory, providing a clearer picture of changes in performance over time. Under the revised methodology, Abia achieved a composite score of 0.55, placing it just behind Jigawa State, which topped the rankings.

## Citizen Satisfaction the Standout Metric

Phillips Consulting said Abia's strongest performance pillar was citizen satisfaction, where the state recorded a standardised score of +1.78 — one of the highest recorded in any pillar across all states assessed. This reflects growing public approval of governance improvements in infrastructure, healthcare delivery, security, and fiscal management under the Otti administration.

The revised report was released following a methodological review and the inclusion of newer audited financial data. Phillips Consulting said the adjustments were made to strengthen the accuracy and comparability of the assessment across the different years.

## A Trajectory Unmatched in the Index's History

The consulting firm said the 2026 report was revised after the initial July 2026 publication identified methodology gaps. That earlier edition had ranked Abia as the third fastest-improving state in the nation. The revised September 2026 edition, however, presents a more definitive picture — placing Abia not just among the most improved, but among the best-performing states overall.

Governor Alex Otti, who assumed office in May 2023, has consistently pointed to fiscal discipline, infrastructure investment and human capital development as the pillars of his administration's strategy. Independent assessments of road reconstruction, primary healthcare revitalisation, and education reform in Abia have broadly corroborated the improving picture that the pSPI data captures.

## What the pSPI Measures

The Phillips Consulting State Performance Index (pSPI) is an independent annual assessment of Nigerian state governments across multiple governance dimensions including fiscal management, infrastructure, social services, ease of doing business, and citizen welfare. It is widely regarded as one of the most rigorous sub-national governance benchmarks in Nigeria.

The 2026 revised results confirm that Abia's transformation under the current administration is not merely rhetorical — it is measurable, verifiable and nationally recognised.`
};

async function insertArticle() {
  try {
    await pool.query(
      `INSERT INTO blog_posts (title, category, excerpt, content, author_name, image_url, status, published_at, reading_time_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [article.title, article.category, article.excerpt, article.content, article.author_name, article.image_url, article.status, article.published_at, article.reading_time_minutes]
    );
    console.log('✅ Abia pSPI article published successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

insertArticle();
