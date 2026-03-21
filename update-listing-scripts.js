#!/usr/bin/env node
// ================================================================
// Swap data.js → data-slim.js (with defer) on all listing pages.
// Only touches files in public/listing/*.html
// Run: node update-listing-scripts.js
// ================================================================

const fs   = require('fs');
const path = require('path');

const listingDir = path.join(__dirname, 'public', 'listing');
const files = fs.readdirSync(listingDir).filter(f => f.endsWith('.html'));

let updated = 0;
let skipped = 0;

files.forEach(file => {
  const fp  = path.join(listingDir, file);
  let html = fs.readFileSync(fp, 'utf-8');

  // Already updated
  if (html.includes('data-slim.js')) { skipped++; return; }

  const before = html;

  // Replace data.js + related.js with slim deferred versions
  html = html.replace(
    '<script src="/js/data.js"></script>\n<script src="/js/related.js"></script>',
    '<script src="/js/data-slim.js" defer></script>\n<script src="/js/related.js" defer></script>'
  );

  if (html === before) {
    // Try alternate spacing
    html = html.replace(
      '<script src="/js/data.js"></script><script src="/js/related.js"></script>',
      '<script src="/js/data-slim.js" defer></script><script src="/js/related.js" defer></script>'
    );
  }

  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf-8');
    updated++;
  } else {
    console.warn('⚠️  Pattern not found in: ' + file);
    skipped++;
  }
});

console.log('✅ Updated ' + updated + ' listing pages');
console.log('   Skipped: ' + skipped + ' (already updated or pattern mismatch)');
