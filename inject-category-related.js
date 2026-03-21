#!/usr/bin/env node
// Adds a "Browse by City" + "Related Technologies" section to the 4
// technology category pages (fdm-printing, sla-resin, sls-nylon, metal-printing).
// Run: node inject-category-related.js

const fs   = require('fs');
const path = require('path');

const pub = path.join(__dirname, 'public');

// All 19 city pages we have static pages for
const CITIES = [
  { name: 'New York',        slug: '3d-printing-new-york' },
  { name: 'Los Angeles',     slug: '3d-printing-los-angeles' },
  { name: 'Chicago',         slug: '3d-printing-chicago' },
  { name: 'Houston',         slug: null },   // no dedicated city page — link to directory
  { name: 'Phoenix',         slug: null },
  { name: 'Dallas',          slug: null },
  { name: 'San Francisco',   slug: null },
  { name: 'Seattle',         slug: '3d-printing-seattle' },
  { name: 'Atlanta',         slug: null },
  { name: 'Miami',           slug: null },
  { name: 'Austin',          slug: null },
  { name: 'Denver',          slug: null },
  { name: 'San Diego',       slug: null },
  { name: 'Boston',          slug: '3d-printing-boston' },
  { name: 'Portland',        slug: '3d-printing-portland' },
  { name: 'Indianapolis',    slug: '3d-printing-indianapolis' },
  { name: 'Baltimore',       slug: '3d-printing-baltimore' },
  { name: 'Salt Lake City',  slug: '3d-printing-salt-lake-city' },
  { name: 'Milwaukee',       slug: '3d-printing-milwaukee' },
  { name: 'Albuquerque',     slug: '3d-printing-albuquerque' },
  { name: 'Boise',           slug: '3d-printing-boise' },
  { name: 'Kansas City',     slug: '3d-printing-kansas-city' },
  { name: 'New Orleans',     slug: '3d-printing-new-orleans' },
  { name: 'Honolulu',        slug: '3d-printing-honolulu' },
  { name: 'Sioux Falls',     slug: '3d-printing-sioux-falls' },
  { name: 'Virginia Beach',  slug: '3d-printing-virginia-beach' },
  { name: 'Wichita',         slug: '3d-printing-wichita' },
  { name: 'Anchorage',       slug: '3d-printing-anchorage' },
];

const PAGES = [
  {
    file:   'fdm-printing.html',
    typeKey:'fdm',
    typeLabel: 'FDM',
    otherTech: [
      { href: '/sla-resin',     label: 'SLA Resin 3D Printing' },
      { href: '/sls-nylon',     label: 'SLS Nylon 3D Printing' },
      { href: '/metal-printing',label: 'Metal 3D Printing' },
    ],
  },
  {
    file:   'sla-resin.html',
    typeKey:'sla',
    typeLabel: 'SLA',
    otherTech: [
      { href: '/fdm-printing',  label: 'FDM 3D Printing' },
      { href: '/sls-nylon',     label: 'SLS Nylon 3D Printing' },
      { href: '/metal-printing',label: 'Metal 3D Printing' },
    ],
  },
  {
    file:   'sls-nylon.html',
    typeKey:'sls',
    typeLabel: 'SLS',
    otherTech: [
      { href: '/fdm-printing',  label: 'FDM 3D Printing' },
      { href: '/sla-resin',     label: 'SLA Resin 3D Printing' },
      { href: '/metal-printing',label: 'Metal 3D Printing' },
    ],
  },
  {
    file:   'metal-printing.html',
    typeKey:'metal',
    typeLabel: 'Metal',
    otherTech: [
      { href: '/fdm-printing',  label: 'FDM 3D Printing' },
      { href: '/sla-resin',     label: 'SLA Resin 3D Printing' },
      { href: '/sls-nylon',     label: 'SLS Nylon 3D Printing' },
    ],
  },
];

function buildCityLinks(typeKey, typeLabel) {
  return CITIES.map(c => {
    // Prefer city-specific page; fall back to directory filter
    const href = c.slug
      ? `/${c.slug}`
      : `/directory?type=${typeKey}&city=${encodeURIComponent(c.name)}`;
    return `      <a href="${href}">${typeLabel} 3D Printing in ${c.name}</a>`;
  }).join('\n');
}

function buildOtherTech(links) {
  return links.map(l =>
    `      <a href="${l.href}">${l.label}</a>`
  ).join('\n');
}

function buildSection(page) {
  return `
<section class="related-services-section" aria-label="Browse ${page.typeLabel} 3D printing by city">
  <div class="wrap">
    <div class="related-block">
      <h2 class="related-section-title">Browse ${page.typeLabel} 3D Printing by City</h2>
      <div class="city-links-grid">
${buildCityLinks(page.typeKey, page.typeLabel)}
      </div>
      <a href="/directory?type=${page.typeKey}" class="related-view-all">Browse all ${page.typeLabel} 3D printing services &#8594;</a>
    </div>
    <div class="related-block" style="margin-top:2rem;">
      <h2 class="related-section-title">Other 3D Printing Technologies</h2>
      <div class="city-links-grid">
${buildOtherTech(page.otherTech)}
        <a href="/technologies">3D Printing Technology Guide</a>
        <a href="/directory">Browse All 3D Printing Services</a>
      </div>
    </div>
  </div>
</section>`;
}

let count = 0;
PAGES.forEach(page => {
  const fp  = path.join(pub, page.file);
  let html  = fs.readFileSync(fp, 'utf-8');

  if (html.includes('related-services-section')) {
    console.log(`⚠  ${page.file} already has related section — skipping`);
    return;
  }

  const section = buildSection(page);
  html = html.replace('<footer class="site-footer">', section + '\n\n<footer class="site-footer">');
  fs.writeFileSync(fp, html, 'utf-8');
  count++;
  console.log(`✅ ${page.file}`);
});

console.log(`\nDone — updated ${count} category pages`);
