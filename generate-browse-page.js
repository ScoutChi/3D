#!/usr/bin/env node
// ================================================================
// 3DPrintMap - Browse Page Generator
// Generates a static, crawlable HTML page linking to all listings.
// Run: node generate-browse-page.js
// ================================================================

const fs = require('fs');

const BASE_URL = 'https://www.3dprintmap.com';

// Parse BUSINESSES from data.js
const dataJs = fs.readFileSync('./public/js/data.js', 'utf-8');
const bizMatch = dataJs.match(/const BUSINESSES = (\[[\s\S]*?\n\]);/);
if (!bizMatch) {
  console.error('Could not parse BUSINESSES from js/data.js');
  process.exit(1);
}
const businesses = JSON.parse(bizMatch[1]);

// Group by state, then city
const byState = {};
for (const b of businesses) {
  const state = b.state || 'Unknown';
  const city  = b.city  || 'Unknown';
  if (!byState[state])        byState[state] = {};
  if (!byState[state][city])  byState[state][city] = [];
  byState[state][city].push(b);
}

const sortedStates = Object.keys(byState).sort();

// Build directory sections HTML
let sectionsHtml = '';
for (const state of sortedStates) {
  const slug = state.toLowerCase().replace(/\s+/g, '-');
  sectionsHtml += `\n  <div class="browse-state" id="state-${slug}">\n    <h2>${state}</h2>\n`;
  for (const city of Object.keys(byState[state]).sort()) {
    sectionsHtml += `    <div class="browse-city">\n      <h3>${city}</h3>\n      <ul>\n`;
    for (const b of byState[state][city]) {
      sectionsHtml += `        <li><a href="/listing/${b.id}">${b.name}</a></li>\n`;
    }
    sectionsHtml += `      </ul>\n    </div>\n`;
  }
  sectionsHtml += `  </div>\n`;
}

const total = businesses.length;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Browse All 3D Printing Services | 3DPrintMap</title>
  <meta name="description" content="Browse all ${total} 3D printing services listed on 3DPrintMap, organized by state and city across the United States.">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="Browse All 3D Printing Services | 3DPrintMap">
  <meta property="og:description" content="Browse all ${total} 3D printing services listed on 3DPrintMap, organized by state and city.">
  <meta property="og:url" content="${BASE_URL}/browse">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${BASE_URL}/og-default.png">
  <link rel="canonical" href="${BASE_URL}/browse">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="sitemap" type="application/xml" href="/sitemap.xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="/css/main.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "${BASE_URL}/browse",
    "name": "Browse All 3D Printing Services",
    "description": "A complete directory of all ${total} 3D printing services listed on 3DPrintMap, organized by state and city.",
    "url": "${BASE_URL}/browse",
    "isPartOf": { "@id": "${BASE_URL}/#website" }
  }
  </script>
  <style>
    .browse-hero { background: var(--navy); color: var(--white); padding: 3rem 0 2.5rem; text-align: center; }
    .browse-hero h1 { color: var(--white); margin-bottom: .5rem; }
    .browse-hero p { color: var(--slate-lt); font-size: 1.05rem; }
    .browse-wrap { max-width: 1100px; margin: 0 auto; padding: 0 1.25rem; }
    .browse-toc { background: var(--white); border: 1px solid var(--border); border-radius: var(--r-md); padding: 1.5rem 2rem; margin: 2rem 0; }
    .browse-toc h2 { font-size: 1.1rem; margin-bottom: 1rem; }
    .browse-toc ul { display: flex; flex-wrap: wrap; gap: .4rem .75rem; list-style: none; padding: 0; }
    .browse-toc a { color: var(--orange); font-size: .9rem; }
    .browse-toc a:hover { text-decoration: underline; }
    .browse-state { margin-bottom: 2.5rem; }
    .browse-state h2 { font-size: 1.5rem; color: var(--navy); border-bottom: 2px solid var(--orange); padding-bottom: .35rem; margin-bottom: 1.25rem; }
    .browse-city { margin-bottom: 1.5rem; }
    .browse-city h3 { font-size: 1rem; color: var(--slate); margin-bottom: .5rem; font-weight: 600; }
    .browse-city ul { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: .3rem .75rem; }
    .browse-city li a { color: var(--navy); font-size: .875rem; }
    .browse-city li a:hover { color: var(--orange); text-decoration: underline; }
  </style>
</head>
<body>

<div class="topbar">
  Are you a 3D printing service? <a href="/add-listing.html">Add Your Business FREE &rarr;</a>
</div>

<nav class="navbar">
  <div class="nav-inner">
    <a href="/" class="logo">
      <span class="logo-sym">&#9672;</span>
      <span class="logo-tx"><span class="c-navy">3D</span><span class="c-orange">Print</span><span class="c-navy">Map</span></span>
    </a>
    <ul class="nav-links">
      <li class="nav-has-drop">
        <button class="nav-link">Browse &#9660;</button>
        <ul class="nav-drop">
          <li><a href="/fdm-printing.html">FDM Printing</a></li>
          <li><a href="/sla-resin.html">SLA / Resin</a></li>
          <li><a href="/sls-nylon.html">SLS / Nylon</a></li>
          <li><a href="/metal-printing.html">Metal Printing</a></li>
          <li><a href="/directory.html">All Services</a></li>
        </ul>
      </li>
      <li><a href="/blog/index.html" class="nav-link">Blog</a></li>
      <li><a href="/technologies.html" class="nav-link">Technologies</a></li>
      <li><a href="/trends.html" class="nav-link">Trends</a></li>
      <li><a href="/about.html" class="nav-link">About</a></li>
      <li><a href="/faq.html" class="nav-link">FAQ</a></li>
      <li><a href="/recommended-gear.html" class="nav-link">Gear Guide</a></li>
    </ul>
    <div class="nav-right">
      <a href="/add-listing.html" class="btn-cta">+ Add Business (FREE)</a>
      <button class="ham" id="ham" aria-label="Open menu">&#9776;</button>
    </div>
  </div>
</nav>

<div class="mob-menu" id="mobMenu">
  <div class="mob-label">Browse by Technology</div>
  <a href="/fdm-printing.html">FDM Printing</a>
  <a href="/sla-resin.html">SLA / Resin</a>
  <a href="/sls-nylon.html">SLS / Nylon</a>
  <a href="/metal-printing.html">Metal Printing</a>
  <a href="/directory.html">All Services</a>
  <div class="mob-label">Resources</div>
  <a href="/blog/index.html">Blog</a>
  <a href="/technologies.html">Technologies</a>
  <a href="/trends.html">Data &amp; Trends</a>
  <a href="/about.html">About</a>
  <a href="/faq.html">FAQ</a>
  <a href="/recommended-gear.html">Gear Guide</a>
  <a href="/add-listing.html" class="mob-cta">+ Add Business (FREE)</a>
</div>

<div class="browse-hero">
  <div class="browse-wrap">
    <h1>Browse All 3D Printing Services</h1>
    <p>All ${total} services listed on 3DPrintMap, organized by state and city.</p>
  </div>
</div>

<div class="browse-wrap" style="padding-top:2rem;padding-bottom:3rem;">

  <div class="browse-toc">
    <h2>Jump to a State</h2>
    <ul>
${sortedStates.map(s => `      <li><a href="#state-${s.toLowerCase().replace(/\s+/g, '-')}">${s}</a></li>`).join('\n')}
    </ul>
  </div>

${sectionsHtml}
</div>

<section class="cta-section">
  <div class="wrap">
    <div class="cta-box-inner">
      <h2>List Your 3D Printing Service &mdash; FREE</h2>
      <p>Join ${total} 3D printing services already on 3DPrintMap. Get discovered by customers actively searching for your services.</p>
      <a href="/add-listing.html" class="btn btn-primary btn-lg">Add Your Business For Free &rarr;</a>
    </div>
  </div>
</section>

<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-grid">
      <div class="footer-col footer-brand-col">
        <a href="/" class="logo"><span class="logo-sym">&#9672;</span><span class="logo-tx"><span class="c-white">3D</span><span class="c-orange">Print</span><span class="c-white">Map</span></span></a>
        <p>The most comprehensive directory of 3D printing services across the United States. Built for the maker community.</p>
      </div>
      <div class="footer-col"><h4>Browse</h4><a href="/directory.html">All Services</a><a href="/fdm-printing.html">FDM Printing</a><a href="/sla-resin.html">SLA / Resin</a><a href="/sls-nylon.html">SLS / Nylon</a><a href="/metal-printing.html">Metal Printing</a></div>
      <div class="footer-col"><h4>Resources</h4><a href="/blog/index.html">Blog</a><a href="/technologies.html">Technologies</a><a href="/faq.html">FAQ</a><a href="/about.html">About</a><a href="/recommended-gear.html">Recommended Gear</a></div>
      <div class="footer-col"><h4>Company</h4><a href="/add-listing.html">Add Your Business</a><a href="/featured-listing.html">Get Featured</a><a href="/browse.html">Browse All</a><a href="/privacy.html">Privacy Policy</a><a href="/terms.html">Terms of Service</a></div>
    </div>
    <div class="footer-bottom"><span>&copy; 2026 3DPrintMap. All rights reserved.</span><a href="/sitemap.xml">Sitemap</a></div>
    <p class="footer-amazon">As an Amazon Associate, I earn from qualifying purchases.</p>
  </div>
</footer>

<script>
(function(){
  var ham = document.getElementById('ham');
  var mob = document.getElementById('mobMenu');
  ham.addEventListener('click', function(){ mob.classList.toggle('open'); ham.textContent = mob.classList.contains('open') ? '\u2715' : '\u2630'; });
  document.addEventListener('click', function(e){ if(!ham.contains(e.target) && !mob.contains(e.target)){ mob.classList.remove('open'); ham.textContent = '\u2630'; } });
})();
</script>
<script src="/js/nav.js"></script>
</body>
</html>`;

fs.writeFileSync('./public/browse.html', html, 'utf-8');
const size = (Buffer.byteLength(html, 'utf-8') / 1024).toFixed(0);
console.log(`Generated public/browse.html — ${total} listings, ${sortedStates.length} states, ${size} KB`);
