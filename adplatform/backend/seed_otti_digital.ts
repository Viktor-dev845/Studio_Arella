import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const article = {
  title: "ABIA GOVERNOR OTTI SHIFTS STATE'S FOCUS TO DIGITAL COMMERCE AND MANUFACTURING",
  category: "BUSINESS",
  author_name: "Studio Arella",
  image_url: "/uploads/news/otti-digital.jpg",
  status: "published",
  published_at: new Date().toISOString(),
  reading_time_minutes: 3,
  excerpt: "Governor Alex Otti says his administration is repositioning Abia State from conventional trading to digital commerce and manufacturing, stressing that the future of global business lies in technology.",
  content: `Abia State Governor, Dr. Alex Otti, OFR, says his administration is repositioning the state from conventional trading to digital commerce, stressing that the future of global business lies in technology and digital delivery.

Governor Otti stated this at the Michael Okpara Auditorium in Umuahia, during the Igbo Day Lecture and Dinner organised by Ohanaeze Ndigbo Worldwide, with the theme, “The Igbo Charter and Development of Ala Igbo.”

The Governor said Abia and Ndigbo, historically known for trading, are now deliberately shifting their focus towards manufacturing and technology-driven commerce.

Responding to concerns over the growing presence of Chinese traders competing with Igbo entrepreneurs in retail businesses in Lagos, Governor Otti said Abia is moving beyond conventional physical markets and embracing manufacturing and digital delivery.

He explained that digital commerce would enable Abia entrepreneurs to reach customers and compete in the global market without depending solely on physical stores. He added that the state’s future lies in combining manufacturing with technology-driven trading, urging businesses to embrace the changing global economic landscape.

Governor Otti further disclosed that his administration is investing heavily in digital skills for young people, noting that some Abians trained through the TechRise initiative are already working for global technology companies from Aba.`
};

async function insertArticle() {
  try {
    await pool.query(
      `INSERT INTO blog_posts (title, category, excerpt, content, author_name, image_url, status, published_at, reading_time_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [article.title, article.category, article.excerpt, article.content, article.author_name, article.image_url, article.status, article.published_at, article.reading_time_minutes]
    );
    console.log('✅ Otti Digital Commerce article published successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

insertArticle();
