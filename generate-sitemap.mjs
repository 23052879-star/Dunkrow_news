import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = 'https://dunkrow.in';
const SUPABASE_URL = 'https://ylnqunxfvyqyujuddngs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsbnF1bnhmdnlxeXVqdWRkbmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0Mzc5MTcsImV4cCI6MjA5NDAxMzkxN30.ur435n23lMMJ6i00eccoM-kou9UFGJkWk5JV_Mj2nDg';

// Static pages — only indexable public content pages (no login/register/admin)
const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'hourly' },
  { path: '/whispers', priority: '0.8', changefreq: 'daily' },
  { path: '/jokes-trivia', priority: '0.7', changefreq: 'daily' },
  // All categories
  { path: '/category/politics', priority: '0.8', changefreq: 'daily' },
  { path: '/category/technology', priority: '0.8', changefreq: 'daily' },
  { path: '/category/business', priority: '0.8', changefreq: 'daily' },
  { path: '/category/sports', priority: '0.8', changefreq: 'daily' },
  { path: '/category/entertainment', priority: '0.8', changefreq: 'daily' },
  { path: '/category/health', priority: '0.8', changefreq: 'daily' },
  { path: '/category/science', priority: '0.8', changefreq: 'daily' },
];

async function fetchArticles() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?select=slug,updated_at,created_at,category,title,excerpt,featured_image&status=eq.published&order=created_at.desc`,
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

// Standard sitemap.xml
function buildSitemapXml(staticPages, articles) {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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

// Google News sitemap (articles from last 2 days only)
function buildNewsSitemapXml(articles) {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const recentArticles = articles.filter(a => new Date(a.created_at) >= twoDaysAgo);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`;

  for (const article of recentArticles) {
    const pubDate = new Date(article.created_at).toISOString();
    xml += `  <url>
    <loc>${SITE_URL}/article/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Dunkrow</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function main() {
  console.log('🗺️  Generating sitemaps for dunkrow.in...');
  
  const articles = await fetchArticles();
  
  // 1. Main sitemap
  const sitemap = buildSitemapXml(staticPages, articles);
  const sitemapPath = resolve(__dirname, 'public', 'sitemap.xml');
  writeFileSync(sitemapPath, sitemap, 'utf-8');
  console.log(`✅ sitemap.xml → ${staticPages.length} static + ${articles.length} articles`);
  
  // 2. News sitemap
  const newsSitemap = buildNewsSitemapXml(articles);
  const newsPath = resolve(__dirname, 'public', 'news-sitemap.xml');
  writeFileSync(newsPath, newsSitemap, 'utf-8');
  const twoDaysAgo = new Date(); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const recentCount = articles.filter(a => new Date(a.created_at) >= twoDaysAgo).length;
  console.log(`✅ news-sitemap.xml → ${recentCount} recent articles (last 48h)`);
}

main();
