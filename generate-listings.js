/**
 * generate-listings.js
 * Pre-renders a static HTML page for every business in data.js.
 * Output: public/listing/{id}.html
 *
 * Run: node generate-listings.js
 */

const fs   = require('fs');
const path = require('path');

// ── Load business data ─────────────────────────────────────────
const dataJs  = fs.readFileSync(path.join(__dirname, 'public/js/data.js'), 'utf8');
const arrStart = dataJs.indexOf('const BUSINESSES');
const arrEnd   = dataJs.indexOf('];', arrStart) + 2;
eval(dataJs.slice(arrStart, arrEnd).replace('const ', 'var '));

// ── Output directory ───────────────────────────────────────────
const outDir = path.join(__dirname, 'public/listing');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// ── Helpers ────────────────────────────────────────────────────
function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\.0+$/, '').replace(/\D/g, '');
  const local = digits.length === 11 && digits[0] === '1' ? digits.slice(1) : digits;
  if (local.length === 10) return `(${local.slice(0,3)}) ${local.slice(3,6)}-${local.slice(6)}`;
  return digits || '';
}

function stateAbbr(fullName) {
  const MAP = {
    'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA',
    'Colorado':'CO','Connecticut':'CT','Delaware':'DE','Florida':'FL','Georgia':'GA',
    'Hawaii':'HI','Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA',
    'Kansas':'KS','Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD',
    'Massachusetts':'MA','Michigan':'MI','Minnesota':'MN','Mississippi':'MS',
    'Missouri':'MO','Montana':'MT','Nebraska':'NE','Nevada':'NV','New Hampshire':'NH',
    'New Jersey':'NJ','New Mexico':'NM','New York':'NY','North Carolina':'NC',
    'North Dakota':'ND','Ohio':'OH','Oklahoma':'OK','Oregon':'OR','Pennsylvania':'PA',
    'Rhode Island':'RI','South Carolina':'SC','South Dakota':'SD','Tennessee':'TN',
    'Texas':'TX','Utah':'UT','Vermont':'VT','Virginia':'VA','Washington':'WA',
    'West Virginia':'WV','Wisconsin':'WI','Wyoming':'WY','District of Columbia':'DC'
  };
  return MAP[fullName] || fullName;
}

function tags(arr) {
  if (!arr || !arr.length) return '<span class="tag-pill">Not specified</span>';
  return arr.map(t => `<span class="tag-pill">${esc(t)}</span>`).join('');
}

// ── Template ───────────────────────────────────────────────────
function renderPage(b) {
  const abbr     = stateAbbr(b.state);
  const phone    = formatPhone(b.phone);
  const techList = (b.types || []).join(', ') || '3D Printing';
  const indList  = (b.industries || []).slice(0, 2).join(' & ') || 'various industries';
  const addrParts = [b.address, b.city, abbr, b.zip].filter(Boolean);
  const fullAddr  = addrParts.join(', ');
  const mapsQuery = encodeURIComponent(`${b.name} ${b.address} ${b.city} ${b.state}`);
  const canonical = `https://www.3dprintmap.com/listing/${b.id}`;

  const metaTitle = `${esc(b.name)} — 3D Printing in ${esc(b.city)}, ${abbr} | 3DPrintMap`;
  const metaDesc  = `Looking for 3D printing in ${esc(b.city)}? ${esc(b.name)} offers ${esc(techList)} services for ${esc(indList)}. View address, hours, and contact info on 3DPrintMap.`;

  const ratingBlock = b.reviews > 0
    ? `<span>&#11088; ${b.rating} (${b.reviews} reviews)</span>`
    : `<span>No reviews yet</span>`;

  const websiteRow = b.website
    ? `<div class="biz-contact-item">
        <span class="biz-contact-icon"><i class="fa-solid fa-globe"></i></span>
        <a href="${esc(b.website)}" target="_blank" rel="noopener">${esc(b.website.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>
       </div>`
    : '';

  const phoneRow = phone
    ? `<div class="biz-contact-item">
        <span class="biz-contact-icon"><i class="fa-solid fa-phone"></i></span>
        <a href="tel:${esc(b.phone)}">${esc(phone)}</a>
       </div>`
    : '';

  const websiteBtn = b.website
    ? `<a href="${esc(b.website)}" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:16px;" target="_blank" rel="noopener">Visit Website &rarr;</a>`
    : '';

  const socialLinks = [
    b.facebook  ? `<a href="${esc(b.facebook)}"  class="social-btn" target="_blank" rel="noopener"><i class="fa-brands fa-facebook"></i> Facebook</a>`  : '',
    b.instagram ? `<a href="${esc(b.instagram)}" class="social-btn" target="_blank" rel="noopener"><i class="fa-brands fa-instagram"></i> Instagram</a>` : '',
    b.twitter   ? `<a href="${esc(b.twitter)}"   class="social-btn" target="_blank" rel="noopener"><i class="fa-brands fa-x-twitter"></i> Twitter/X</a>` : '',
  ].filter(Boolean).join('\n');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': b.name,
    'description': b.description,
    'url': b.website || canonical,
    'telephone': phone || undefined,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': b.address,
      'addressLocality': b.city,
      'addressRegion': abbr,
      'postalCode': b.zip || undefined,
      'addressCountry': 'US'
    },
    'priceRange': b.priceRange || '$$',
    'hasMap': `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
    'aggregateRating': b.reviews > 0 ? {
      '@type': 'AggregateRating',
      'ratingValue': b.rating,
      'bestRating': '5',
      'worstRating': '1',
      'reviewCount': b.reviews
    } : undefined
  };
  // strip undefined
  Object.keys(jsonLd).forEach(k => { if (jsonLd[k] === undefined) delete jsonLd[k]; });
  if (!jsonLd.address.postalCode) delete jsonLd.address.postalCode;
  if (!jsonLd.telephone) delete jsonLd.telephone;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home',      'item': 'https://www.3dprintmap.com/' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Directory', 'item': 'https://www.3dprintmap.com/directory.html' },
      { '@type': 'ListItem', 'position': 3, 'name': b.city,      'item': `https://www.3dprintmap.com/directory.html?city=${encodeURIComponent(b.city)}` },
      { '@type': 'ListItem', 'position': 4, 'name': b.name }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metaTitle}</title>
  <meta name="description" content="${metaDesc}">
  <meta name="robots" content="${b.name && b.address && b.address !== b.city ? 'index, follow' : 'noindex, nofollow'}">
  <link rel="canonical" href="${canonical}">

  <meta property="og:type" content="business.business">
  <meta property="og:site_name" content="3DPrintMap">
  <meta property="og:title" content="${metaTitle}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://www.3dprintmap.com/og-default.png">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${metaTitle}">
  <meta name="twitter:description" content="${metaDesc}">

  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="sitemap" type="application/xml" href="/sitemap.xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/main.css">

  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
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
  <a href="/about.html">About</a>
  <a href="/faq.html">FAQ</a>
  <a href="/recommended-gear.html">Gear Guide</a>
  <a href="/add-listing.html" class="mob-cta">+ Add Business (FREE)</a>
</div>

<div class="biz-layout">
  <div class="container">

    <nav class="biz-breadcrumb" aria-label="Breadcrumb">
      <ol class="breadcrumb-list">
        <li><a href="/">Home</a></li>
        <li aria-hidden="true" class="breadcrumb-sep">&rsaquo;</li>
        <li><a href="/directory.html?state=${esc(b.state)}">${esc(b.state)}</a></li>
        <li aria-hidden="true" class="breadcrumb-sep">&rsaquo;</li>
        <li><a href="/directory.html?city=${encodeURIComponent(b.city)}">${esc(b.city)}</a></li>
        <li aria-hidden="true" class="breadcrumb-sep">&rsaquo;</li>
        <li><span aria-current="page">${esc(b.name)}</span></li>
      </ol>
    </nav>

    <div class="biz-inner">

      <main class="biz-main">
        <div class="biz-hero" role="img" aria-label="${esc(b.name)} — ${esc(techList)} 3D printing service in ${esc(b.city)}">
          <span class="biz-hero-icon-wrap" aria-hidden="true">
            <i class="fa-solid fa-cube" style="font-size:56px;color:var(--orange);"></i>
          </span>
        </div>

        <div class="biz-header-info">
          <div class="biz-title-row">
            <h1>${esc(b.name)}</h1>
            <span class="listing-badge ${b.isOpen ? 'badge-open' : 'badge-closed'}">${b.isOpen ? 'Now Open' : 'Now Closed'}</span>
          </div>
          <div class="biz-meta">
            <span>&#128205; ${esc(b.city)}, ${abbr}</span>
            <span class="biz-meta-sep">&middot;</span>
            ${ratingBlock}
            <span class="biz-meta-sep">&middot;</span>
            <span>Price: <strong>${esc(b.priceRange || '$$')}</strong></span>
          </div>
          <p class="biz-desc">${esc(b.description)}</p>
          <div class="listing-tags">${tags(b.types)}</div>
        </div>

        <div class="biz-sections">
          <div class="biz-section">
            <h3>Technologies Offered</h3>
            <div class="tag-list">${tags(b.types)}</div>
          </div>
          <div class="biz-section">
            <h3>Materials Available</h3>
            <div class="tag-list">${tags(b.materials)}</div>
          </div>
          <div class="biz-section">
            <h3>Services</h3>
            <div class="tag-list">${tags(b.services)}</div>
          </div>
          <div class="biz-section">
            <h3>Industries Served</h3>
            <div class="tag-list">${tags(b.industries)}</div>
          </div>
          ${socialLinks ? `<div class="biz-section"><h3>Social Media</h3><div class="tag-list">${socialLinks}</div></div>` : ''}
        </div>
      </main>

      <aside class="biz-sidebar" aria-label="Contact information">
        <div class="biz-contact-card">
          <h2 class="biz-contact-heading">Contact &amp; Info</h2>
          ${phoneRow}
          ${websiteRow}
          <div class="biz-contact-item">
            <span class="biz-contact-icon"><i class="fa-solid fa-location-dot"></i></span>
            <a href="https://www.google.com/maps/search/?api=1&query=${mapsQuery}" target="_blank" rel="noopener">${esc(fullAddr)}</a>
          </div>
          <div class="biz-contact-item">
            <span class="biz-contact-icon"><i class="fa-solid fa-clock"></i></span>
            <span>${esc(b.hours || 'Hours not available')}</span>
          </div>
          ${websiteBtn}
        </div>

        <div class="amz-widget">
          <h3>Recommended for Makers</h3>
          <div class="amz-widget-item">
            <strong>Bambu Lab A1</strong>
            <span>Multi-color, fully automatic calibration, blazing fast FDM printing.</span>
            <a href="https://amzn.to/4lBrY3C" class="cta-amazon" target="_blank" rel="nofollow sponsored">Check Price</a>
          </div>
          <div class="amz-widget-item">
            <strong>SUNLU Filament Dryer S1 Plus</strong>
            <span>Keep your filament moisture-free for better print quality.</span>
            <a href="https://amzn.to/4uBLXTS" class="cta-amazon" target="_blank" rel="nofollow sponsored">Check Price</a>
          </div>
          <p class="amz-widget-disclosure">As an Amazon Associate we earn from qualifying purchases.</p>
        </div>

        <a href="/directory.html" class="btn btn-ghost" style="width:100%;justify-content:center;">
          &larr; Back to Directory
        </a>
      </aside>

    </div>
  </div>
</div>

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
}

// ── Generate all pages ─────────────────────────────────────────
let count = 0;
for (const b of BUSINESSES) {
  const html = renderPage(b);
  fs.writeFileSync(path.join(outDir, `${b.id}.html`), html, 'utf8');
  count++;
}

console.log(`✅ Generated ${count} pre-rendered listing pages → public/listing/`);
console.log(`   Example: public/listing/4.html`);
console.log(`   Next: update sitemap.xml and commit`);
