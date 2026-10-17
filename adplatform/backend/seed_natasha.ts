import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const title = "SENATOR NATASHA SEEKS BETTER PAY, WELFARE FOR HEALTH WORKERS";
const excerpt = "Senator Natasha Akpoti-Uduaghan has called for improved salaries, welfare packages and better working conditions for doctors and other health workers across Nigeria to reduce maternal mortality.";
const category = "POLITICS";
const author_name = "Studio Arella";
const image_url = "/uploads/news/natasha.jpg";
const content = `Senator Natasha Akpoti-Uduaghan, representing Kogi Central, has called for improved salaries, welfare packages and better working conditions for doctors and other health workers across Nigeria. She said the move is essential to reducing maternal mortality and retaining skilled medical professionals, especially in rural communities.

The senator made the appeal on Monday in Abuja during the ongoing “Unfinished” event organised by Ward-C in collaboration with the National Human Rights Commission, NHRC.

Akpoti-Uduaghan stressed that addressing maternal deaths goes beyond constructing hospitals and primary healthcare centres. According to her, healthcare facilities can only deliver quality services when they are staffed with qualified personnel and supported with the right equipment and resources.

She urged government and stakeholders to ensure that health workers serving underserved communities have access to adequate remuneration, functional medical equipment, essential medicines, reliable electricity, a conducive work environment and opportunities for continuous professional development.

The lawmaker maintained that healthcare infrastructure cannot function effectively without the human resources needed to operate and sustain it, describing investment in health workers as a critical step toward improving maternal and child healthcare outcomes.`;

const status = "published";
const published_at = new Date().toISOString();
const reading_time_minutes = 3;

async function insertArticle() {
  try {
    console.log('Inserting Senator Natasha article...');
    await pool.query(
      `INSERT INTO blog_posts (title, category, excerpt, content, author_name, image_url, status, published_at, reading_time_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [title, category, excerpt, content, author_name, image_url, status, published_at, reading_time_minutes]
    );
    console.log('Successfully inserted article!');
  } catch (err) {
    console.error('Error inserting article:', err);
  } finally {
    pool.end();
  }
}

insertArticle();
