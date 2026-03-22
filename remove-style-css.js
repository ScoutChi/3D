#!/usr/bin/env node
// Removes the legacy style.css link from all listing pages.
// Run: node remove-style-css.js

const fs = require('fs');
const path = require('path');

const LISTING_DIR = path.join(__dirname, 'public', 'listing');
const PATTERN = /[ \t]*<link rel="stylesheet" href="\/css\/style\.css">\r?\n?/g;

const files = fs.readdirSync(LISTING_DIR).filter(f => f.endsWith('.html'));
let updated = 0, unchanged = 0;

for (const f of files) {
  const p = path.join(LISTING_DIR, f);
  const content = fs.readFileSync(p, 'utf-8');
  const newContent = content.replace(PATTERN, '');
  if (newContent === content) { unchanged++; continue; }
  fs.writeFileSync(p, newContent, 'utf-8');
  updated++;
}

console.log(`Done. Updated: ${updated}, Unchanged: ${unchanged}`);
