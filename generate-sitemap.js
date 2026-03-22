#!/usr/bin/env node
// ================================================================
// 3DPrintMap - Sitemap & Robots.txt Generator
// Run this every time you update your business data:
//   node generate-sitemap.js
// ================================================================

const fs = require('fs');

const BASE_URL = 'https://www.3dprintmap.com';
const today = new Date().toISOString().split('T')[0];

// Parse BUSINESSES from js/data.js
const dataJs = fs.readFileSync('./public/js/data.js', 'utf-8');
const bizMatch = dataJs.match(/const BUSINESSES = (\[[\s\S]*?\n\]);/);
const cityMatch = dataJs.match(/const CITIES = (\[[\s\S]*?\n\]);/);

if (!bizMatch) {
  console.error('❌ Could not parse BUSINESSES from js/data.js');
  process.exit(1);
}

const businesses = JSON.parse(bizMatch[1]);
const cities = cityMatch ? JSON.parse(cityMatch[1]) : [];

// ── Build URL list ─────────────────────────────────────────────
const urls = [
  // Core pages
  { loc: `${BASE_URL}/`,              priority: '1.0', changefreq: 'daily' },
  { loc: `${BASE_URL}/directory`,     priority: '0.9', changefreq: 'daily' },
  { loc: `${BASE_URL}/browse`,        priority: '0.8', changefreq: 'weekly' },
  { loc: `${BASE_URL}/technologies`,  priority: '0.8', changefreq: 'monthly' },
  { loc: `${BASE_URL}/trends`,        priority: '0.8', changefreq: 'monthly' },
  { loc: `${BASE_URL}/faq`,           priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/privacy`,       priority: '0.4', changefreq: 'yearly' },
  { loc: `${BASE_URL}/terms`,         priority: '0.4', changefreq: 'yearly' },

  // Blog — static content pages
  { loc: `${BASE_URL}/blog`,                                         priority: '0.8', changefreq: 'weekly' },
  { loc: `${BASE_URL}/blog/how-to-choose-3d-printing-material`,     priority: '0.8', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/3d-printing-for-prototyping`,            priority: '0.8', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/how-to-choose-3d-printing-service`,      priority: '0.8', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/3d-printing-tolerances-accuracy`,        priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/3d-printing-post-processing`,            priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/3d-printed-parts-design-guidelines`,     priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/sla-resin-printing-guide`,               priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/buy-vs-outsource-3d-printing`,           priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/3d-printing-for-small-business`,         priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/industrial-3d-printer-maintenance`,      priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/fdm-vs-sla-3d-printing`,                 priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/how-to-prepare-3d-print-file`,           priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/metal-3d-printing-near-me`,              priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/sls-vs-mjf-3d-printing`,                 priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/3d-printing-rental-near-me`,             priority: '0.6', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/best-3d-printing-new-york-city`,         priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/best-3d-printing-los-angeles`,           priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/best-3d-printing-chicago`,               priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/best-3d-printing-houston`,               priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/best-3d-printing-seattle`,               priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/best-3d-printing-denver`,                priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/best-3d-printing-phoenix`,               priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/best-3d-printing-dallas`,                priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/best-3d-printing-miami`,                 priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/best-3d-printing-austin-tx`,             priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/best-3d-printing-san-diego`,             priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/best-3d-printing-san-francisco`,         priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/blog/best-3d-printing-atlanta`,               priority: '0.7', changefreq: 'monthly' },

  // Technology filter pages (high-value keyword pages)
  { loc: `${BASE_URL}/directory?type=fdm`,        priority: '0.8', changefreq: 'weekly' },
  { loc: `${BASE_URL}/directory?type=sla`,        priority: '0.8', changefreq: 'weekly' },
  { loc: `${BASE_URL}/directory?type=sls`,        priority: '0.8', changefreq: 'weekly' },
  { loc: `${BASE_URL}/directory?type=metal`,      priority: '0.8', changefreq: 'weekly' },
  { loc: `${BASE_URL}/directory?type=multicolor`, priority: '0.7', changefreq: 'weekly' },

  // Service filter pages
  { loc: `${BASE_URL}/directory?service=prototyping`, priority: '0.8', changefreq: 'weekly' },
  { loc: `${BASE_URL}/directory?service=production`,  priority: '0.7', changefreq: 'weekly' },
  { loc: `${BASE_URL}/directory?service=design`,      priority: '0.7', changefreq: 'weekly' },

  // City pages
  ...cities.map(c => ({
    loc: `${BASE_URL}/directory?city=${encodeURIComponent(c.name)}`,
    priority: '0.7',
    changefreq: 'weekly'
  })),

  // Individual business pages
  ...businesses.map(b => ({
    loc: `${BASE_URL}/listing/${b.id}`,
    priority: '0.7',
    changefreq: 'weekly'
  }))
];

// ── Generate sitemap.xml ───────────────────────────────────────
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.mkdirSync('./public/sitemaps', { recursive: true });
fs.writeFileSync('./public/sitemaps/sitemap.xml', sitemap, 'utf-8');

// ── Generate robots.txt ────────────────────────────────────────
const robots = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemaps/sitemap.xml
`;

fs.writeFileSync('./public/robots.txt', robots, 'utf-8');

console.log(`✅ public/sitemaps/sitemap.xml generated with ${urls.length} URLs`);
console.log(`   - ${businesses.length} business pages`);
console.log(`   - ${cities.length} city pages`);
console.log(`✅ robots.txt generated`);
console.log(`\nNext: git add sitemap.xml robots.txt && git push`);
