import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = 'https://dunkrow.pages.dev';
const SUPABASE_URL = 'https://ylnqunxfvyqyujuddngs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsbnF1bnhmdnlxeXVqdWRkbmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0Mzc5MTcsImV4cCI6MjA5NDAxMzkxN30.ur435n23lMMJ6i00eccoM-kou9UFGJkWk5JV_Mj2nDg';

// Static pages with their priorities and change frequencies
const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'hourly' },
  { path: '/whispers', priority: '0.8', changefreq: 'daily' },
  { path: '/jokes-trivia', priority: '0.7', changefreq: 'daily' },
  { path: '/category/politics', priority: '0.8', changefreq: 'daily' },
  { path: '/category/technology', priority: '0.8', changefreq: 'daily' },
  { path: '/category/business', priority: '0.8', changefreq: 'daily' },
  { path: '/category/sports', priority: '0.8', changefreq: 'daily' },
  { path: '/category/entertainment', priority: '0.8', changefreq: 'daily' },
  { path: '/category/health', priority: '0.8', changefreq: 'daily' },
  { path: '/login', priority: '0.3', changefreq: 'monthly' },
  { path: '/register', priority: '0.3', changefreq: 'monthly' },
];

async function fetchArticles() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?select=slug,updated_at,created_at,category&status=eq.published&order=created_at.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('⚠️  Could not fetch articles from Supabase, generating sitemap with static pages only.');
    console.warn('   Error:', err.message);
    return [];
  }
}

function toISODate(dateStr) {
  return new Date(dateStr).toISOString().split('T')[0];
}

function buildSitemapXml(staticPages, articles) {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`;

  // Static pages
  for (const page of staticPages) {
    xml += `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  }

  // Dynamic article pages
  for (const article of articles) {
    const lastmod = toISODate(article.updated_at || article.created_at);
    xml += `  <url>
    <loc>${SITE_URL}/article/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

async function main() {
  console.log('🗺️  Generating sitemap...');
  
  const articles = await fetchArticles();
  const sitemap = buildSitemapXml(staticPages, articles);
  
  const outputPath = resolve(__dirname, 'public', 'sitemap.xml');
  writeFileSync(outputPath, sitemap, 'utf-8');
  
  console.log(`✅ Sitemap generated with ${staticPages.length} static pages and ${articles.length} articles`);
  console.log(`   → ${outputPath}`);
}

main();
