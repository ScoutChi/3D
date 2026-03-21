#!/usr/bin/env node
// Adds a "Browse 3D Printing in Other Cities" + technology section
// to all 19 city landing pages (public/3d-printing-*.html)
// Run: node inject-city-related.js

const fs   = require('fs');
const path = require('path');

const pub = path.join(__dirname, 'public');

// Map slug → display name (for link labels)
const CITY_PAGES = [
  { slug: '3d-printing-albuquerque',  name: 'Albuquerque' },
  { slug: '3d-printing-anchorage',    name: 'Anchorage' },
  { slug: '3d-printing-baltimore',    name: 'Baltimore' },
  { slug: '3d-printing-boise',        name: 'Boise' },
  { slug: '3d-printing-boston',       name: 'Boston' },
  { slug: '3d-printing-chicago',      name: 'Chicago' },
  { slug: '3d-printing-honolulu',     name: 'Honolulu' },
  { slug: '3d-printing-indianapolis', name: 'Indianapolis' },
  { slug: '3d-printing-kansas-city',  name: 'Kansas City' },
  { slug: '3d-printing-los-angeles',  name: 'Los Angeles' },
  { slug: '3d-printing-milwaukee',    name: 'Milwaukee' },
  { slug: '3d-printing-new-orleans',  name: 'New Orleans' },
  { slug: '3d-printing-new-york',     name: 'New York' },
  { slug: '3d-printing-portland',     name: 'Portland' },
  { slug: '3d-printing-salt-lake-city', name: 'Salt Lake City' },
  { slug: '3d-printing-seattle',      name: 'Seattle' },
  { slug: '3d-printing-sioux-falls',  name: 'Sioux Falls' },
  { slug: '3d-printing-virginia-beach', name: 'Virginia Beach' },
  { slug: '3d-printing-wichita',      name: 'Wichita' },
];

const TECH_LINKS = [
  { href: '/fdm-printing',   label: 'FDM 3D Printing Services' },
  { href: '/sla-resin',      label: 'SLA Resin Printing Services' },
  { href: '/sls-nylon',      label: 'SLS Nylon Printing Services' },
  { href: '/metal-printing', label: 'Metal 3D Printing Services' },
  { href: '/technologies',   label: '3D Printing Technology Guide' },
  { href: '/directory',      label: 'Browse All Services' },
];

function buildSection(currentSlug, currentName) {
  const otherCities = CITY_PAGES.filter(c => c.slug !== currentSlug);

  const cityLinks = otherCities
    .map(c => `      <a href="/${c.slug}">3D Printing in ${c.name}</a>`)
    .join('\n');

  const techLinks = TECH_LINKS
    .map(l => `      <a href="${l.href}">${l.label}</a>`)
    .join('\n');

  return `
<section class="related-services-section" aria-label="Browse 3D printing in other cities">
  <div class="wrap">
    <div class="related-block">
      <h2 class="related-section-title">Browse 3D Printing in Other Cities</h2>
      <div class="city-links-grid">
${cityLinks}
      </div>
      <a href="/directory" class="related-view-all">Browse all 3D printing services &#8594;</a>
    </div>
    <div class="related-block" style="margin-top:2rem;">
      <h2 class="related-section-title">Browse by Technology</h2>
      <div class="city-links-grid">
${techLinks}
      </div>
    </div>
  </div>
</section>`;
}

let count = 0;
CITY_PAGES.forEach(page => {
  const fp  = path.join(pub, page.slug + '.html');
  if (!fs.existsSync(fp)) {
    console.warn(`⚠  File not found: ${page.slug}.html`);
    return;
  }
  let html = fs.readFileSync(fp, 'utf-8');

  if (html.includes('related-services-section')) {
    console.log(`⚠  ${page.slug}.html already has related section — skipping`);
    return;
  }

  const section = buildSection(page.slug, page.name);
  html = html.replace('<footer class="site-footer">', section + '\n\n<footer class="site-footer">');
  fs.writeFileSync(fp, html, 'utf-8');
  count++;
  console.log(`✅ ${page.slug}.html`);
});

console.log(`\nDone — updated ${count} city pages`);
