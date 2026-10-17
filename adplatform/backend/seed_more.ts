import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: 'postgresql://postgres.hobmhiaouplaoxzzcrgv:Krav20%23pool@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const articles = [
  {
    title: "AI Regulation Act Passes European Parliament With Overwhelming Majority",
    category: "POLITICS",
    excerpt: "The much-debated EU AI Act has officially passed, introducing strict transparency requirements for foundation models and banning emotion-recognition systems in the workplace.",
    content: "The much-debated EU AI Act has officially passed, introducing strict transparency requirements for foundation models and banning emotion-recognition systems in the workplace.\n\n## The New Compliance Era\nTech giants will now face fines of up to 7% of global revenue for non-compliance. Companies are scrambling to audit their datasets to ensure they meet the stringent copyright and transparency standards.\n\n## What This Means for Startups\nWhile major players have the resources to adapt, critics argue the legislation might stifle European startups, potentially leading to a massive tech brain-drain toward more permissive regulatory environments in North America and Asia.",
    author_name: "Tech Policy Desk",
    image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
    status: "published",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    reading_time_minutes: 4
  },
  {
    title: "The Rebirth of Analog: Why Gen Z is Ditching Spotify for Vinyl",
    category: "CULTURE",
    excerpt: "Physical media sales have surpassed digital downloads for the first time in a decade, driven almost entirely by consumers under the age of 25 seeking tangible experiences.",
    content: "Physical media sales have surpassed digital downloads for the first time in a decade, driven almost entirely by consumers under the age of 25 seeking tangible experiences.\n\n## Digital Fatigue\nAfter spending their formative years entirely online, younger demographics are experiencing intense digital fatigue. The ritual of carefully placing a needle on a record has become an antidote to the algorithmically generated endless scroll.\n\n## The Industry Pivot\nMajor labels are finally taking notice. Pressing plants, which were operating at a fraction of their capacity just five years ago, are now booked out 12 to 18 months in advance as artists rush to secure physical releases.",
    author_name: "Culture Weekly",
    image_url: "https://images.unsplash.com/photo-1530263595561-689d0426b68a?q=80&w=1200&auto=format&fit=crop",
    status: "published",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    reading_time_minutes: 5
  },
  {
    title: "Global Supply Chains Restructure As Nearshoring Surges",
    category: "BUSINESS",
    excerpt: "The pandemic-era vulnerabilities are prompting massive manufacturing shifts, with companies abandoning long-haul shipping in favor of localized production hubs.",
    content: "The pandemic-era vulnerabilities are prompting massive manufacturing shifts, with companies abandoning long-haul shipping in favor of localized production hubs.\n\n## The End of Just-In-Time\nFor thirty years, 'just-in-time' manufacturing was the undisputed king of efficiency. Now, resilience is the priority. Corporations are willing to absorb a 15% increase in production costs to ensure their supply chains aren't broken by a single geopolitical event or canal blockage.\n\n## New Manufacturing Capitals\nCountries like Mexico, Vietnam, and Poland are seeing record levels of foreign direct investment as factories physically relocate closer to end consumers.",
    author_name: "Global Markets",
    image_url: "https://images.unsplash.com/photo-1586528116311-ad8ed7c663c0?q=80&w=1200&auto=format&fit=crop",
    status: "published",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    reading_time_minutes: 6
  },
  {
    title: "Breakthrough Gene Therapy Cures Rare Immunodeficiency",
    category: "HEALTH",
    excerpt: "A pioneering CRISPR-based treatment has successfully restored immune function in a clinical trial of 15 infants born with SCID, marking a historic milestone in genetic medicine.",
    content: "A pioneering CRISPR-based treatment has successfully restored immune function in a clinical trial of 15 infants born with SCID, marking a historic milestone in genetic medicine.\n\n## Rewriting the Code\nSevere Combined Immunodeficiency (SCID) previously required high-risk bone marrow transplants. This new therapy extracts the patient's own stem cells, corrects the genetic mutation in a lab, and reinfuses them.\n\n## The Path to Commercialization\nThe FDA has granted fast-track designation for the therapy. However, with an estimated price tag exceeding $2.5 million per patient, health economists are raising urgent questions regarding insurance coverage and global accessibility.",
    author_name: "Medical Review",
    image_url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop",
    status: "published",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 55).toISOString(),
    reading_time_minutes: 4
  },
  {
    title: "Electric Aviation: The First Commercial Battery-Powered Flight",
    category: "TECHNOLOGY",
    excerpt: "A retrofitted 19-seat commuter plane quietly made history this morning, completing a 150-mile commercial route entirely on battery power.",
    content: "A retrofitted 19-seat commuter plane quietly made history this morning, completing a 150-mile commercial route entirely on battery power.\n\n## A Silent Revolution\nUnlike traditional jet engines, the electric propulsion system is incredibly quiet and produces zero emissions. The flight between Seattle and Vancouver represents a massive leap forward for regional transit.\n\n## Overcoming Weight Constraints\nThe key to this success was a next-generation lightweight battery array developed specifically for aerospace applications. Engineers believe that within five years, electric aircraft will dominate the market for flights under 250 miles.",
    author_name: "AeroTech Insider",
    image_url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop",
    status: "published",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 80).toISOString(),
    reading_time_minutes: 3
  },
  {
    title: "The Financialization of Modern Sports Franchises",
    category: "SPORTS",
    excerpt: "As private equity firms pour billions into global sports leagues, fans are beginning to question whether profit maximization is ruining the spirit of the game.",
    content: "As private equity firms pour billions into global sports leagues, fans are beginning to question whether profit maximization is ruining the spirit of the game.\n\n## The Billion Dollar Valuation\nHistorically, sports teams were vanity assets for local billionaires. Today, they are sophisticated corporate entities optimized for institutional investment. Multi-club ownership models are centralizing power among a handful of sovereign wealth funds and Wall Street firms.\n\n## Fan Backlash\nFrom dynamic ticket pricing algorithms to the aggressive commercialization of stadium naming rights, traditional supporters argue they are being priced out of their own community institutions.",
    author_name: "Sports Business",
    image_url: "https://images.unsplash.com/photo-1518605368461-898fc66f4d25?q=80&w=1200&auto=format&fit=crop",
    status: "published",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 100).toISOString(),
    reading_time_minutes: 5
  }
];

async function seedMore() {
  try {
    console.log('Inserting 6 more news articles...');
    for (const post of articles) {
      await pool.query(
        `INSERT INTO blog_posts (title, category, excerpt, content, author_name, image_url, status, published_at, reading_time_minutes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [post.title, post.category, post.excerpt, post.content, post.author_name, post.image_url, post.status, post.published_at, post.reading_time_minutes]
      );
    }
    console.log('Successfully seeded more articles!');
  } catch (err) {
    console.error('Error seeding:', err);
  } finally {
    pool.end();
  }
}

seedMore();
