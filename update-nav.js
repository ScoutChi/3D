#!/usr/bin/env node
// ================================================================
// 3DPrintMap - Canonical Nav Updater
// Rewrites the <nav> + .mob-menu block in all HTML pages
// (public/*.html and public/blog/*.html) to the canonical version.
//
// Run: node update-nav.js
// Re-run whenever you add or remove a nav link.
// ================================================================

const fs = require('fs');
const path = require('path');

// ── Canonical nav HTML ────────────────────────────────────────────
const CANONICAL_NAV = `<nav class="navbar">
  <div class="nav-inner">
    <a href="/" class="logo">
      <span class="logo-sym">◈</span>
      <span class="logo-tx"><span class="c-navy">3D</span><span class="c-orange">Print</span><span class="c-navy">Map</span></span>
    </a>
    <ul class="nav-links">
      <li class="nav-has-drop">
        <button class="nav-link">Browse ▾</button>
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
      <button class="ham" id="ham" aria-label="Open menu">☰</button>
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
</div>`;

// Matches from <nav class="navbar"> through the closing </div> of .mob-menu
// The mob-menu always ends with the mob-cta link then </div>
const NAV_PATTERN = /<nav class="navbar">[\s\S]*?class="mob-cta"[^<]*<\/a>\s*\n?<\/div>/;

// ── Collect HTML files ────────────────────────────────────────────
const PUBLIC = path.join(__dirname, 'public');

function getHtmlFiles() {
  const files = [];
  // Top-level public/*.html
  for (const f of fs.readdirSync(PUBLIC)) {
    if (f.endsWith('.html')) {
      files.push(path.join(PUBLIC, f));
    }
  }
  // public/blog/*.html
  const blogDir = path.join(PUBLIC, 'blog');
  if (fs.existsSync(blogDir)) {
    for (const f of fs.readdirSync(blogDir)) {
      if (f.endsWith('.html')) {
        files.push(path.join(blogDir, f));
      }
    }
  }
  return files;
}

// ── Main ─────────────────────────────────────────────────────────
const files = getHtmlFiles();
let updated = 0;
let notFound = 0;
let unchanged = 0;

for (const filePath of files) {
  const rel = path.relative(__dirname, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf-8');

  if (!NAV_PATTERN.test(content)) {
    console.log(`  [NOT FOUND] ${rel}`);
    notFound++;
    continue;
  }

  const newContent = content.replace(NAV_PATTERN, CANONICAL_NAV);
  if (newContent === content) {
    unchanged++;
    continue;
  }

  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`  [updated]   ${rel}`);
  updated++;
}

console.log(`\nDone.`);
console.log(`  Updated:   ${updated}`);
console.log(`  Unchanged: ${unchanged}`);
console.log(`  Not found: ${notFound}`);
if (notFound > 0) {
  console.log('\n  ⚠ Files marked [NOT FOUND] need their nav updated manually.');
}
