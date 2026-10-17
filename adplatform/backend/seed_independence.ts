import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const article = {
  title: "NIGERIA CLOCKS 66 YEARS TODAY AFTER GAINING INDEPENDENCE IN 1960",
  category: "POLITICS",
  author_name: "Studio Arella",
  image_url: "https://images.unsplash.com/photo-1598585472851-40ea90390a77?q=80&w=1200&auto=format&fit=crop",
  status: "published",
  published_at: new Date().toISOString(),
  reading_time_minutes: 3,
  excerpt: "Nigeria marks 66 years of independence today, October 1, 2026. As the nation reflects on its journey since 1960, citizens are calling for greater accountability, security, and economic reforms.",
  content: `Nigeria is marking 66 years of independence today, October 1, 2026, after gaining independence from Britain on October 1, 1960.

Nigeria, located in West Africa, was colonised by Britain during the 19th century, with the territory becoming part of the colonial arrangements that followed the Berlin Conference of 1884–1885, where European powers negotiated the division and control of territories in Africa.

As a British colony, Nigeria was administered by the British Empire for decades before attaining independence on October 1, 1960.

During the colonial period, the British established a Crown Colony system of government across much of the territory that later became Nigeria. The system was largely characterised by centralised administrative control and bureaucratic structures.

Nigeria has since gone through different political and constitutional phases, including civilian and military administrations, as the country continues its journey as an independent nation. 

As Nigeria marks its 66th Independence anniversary today, some Nigerians have reflected on the state of the nation, raising concerns over insecurity, the high cost of living, rising petrol prices and the need for greater accountability in governance.

Speaking on the occasion, Nwede Kingsley from Nsukka blamed insecurity on what he described as government’s dialogue with terrorists and called for stronger border laws, while civil servant Deaconess Nkechinyere Ekejiuba identified discrimination against the Igbo as a cause of disunity and called for the protection of lives and property and the release of Mazi Nnamdi Kanu.

Rev. Robert Uloh, who described Nigeria as being in a retrogressive state, also raised concerns over the absence of reliable population data, saying it has affected planning and contributed to criminality, while calling for accountability, democratic policies and measures to ease the hardship caused by rising living costs and fuel prices.`
};

async function insertArticle() {
  try {
    const res = await pool.query(
      `INSERT INTO blog_posts (title, category, excerpt, content, author_name, image_url, status, published_at, reading_time_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [article.title, article.category, article.excerpt, article.content, article.author_name, article.image_url, article.status, article.published_at, article.reading_time_minutes]
    );
    console.log('✅ Independence article published successfully!');
    console.log('Post ID:', res.rows[0].id);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

insertArticle();
