#!/usr/bin/env node
// Injects the #related-services placeholder + data.js + related.js
// into every file in public/listing/
// Run: node inject-related.js

const fs   = require('fs');
const path = require('path');

const listingDir = path.join(__dirname, 'public', 'listing');
const files = fs.readdirSync(listingDir).filter(f => f.endsWith('.html'));

const PLACEHOLDER = '<div id="related-services"></div>';
const SCRIPTS     = '<script src="/js/data.js"></script>\n<script src="/js/related.js"></script>';

let injected = 0;
let skipped  = 0;

files.forEach(file => {
  const fp  = path.join(listingDir, file);
  let html  = fs.readFileSync(fp, 'utf-8');
  let dirty = false;

  // 1. Insert placeholder before <footer class="site-footer">
  if (!html.includes('id="related-services"')) {
    html = html.replace(
      '<footer class="site-footer">',
      PLACEHOLDER + '\n\n<footer class="site-footer">'
    );
    dirty = true;
  }

  // 2. Insert data.js + related.js before </body>
  if (!html.includes('/js/related.js')) {
    html = html.replace('</body>', SCRIPTS + '\n</body>');
    dirty = true;
  }

  if (dirty) {
    fs.writeFileSync(fp, html, 'utf-8');
    injected++;
  } else {
    skipped++;
  }
});

console.log(`✅ Injected into ${injected} listing pages  (${skipped} already up to date)`);
