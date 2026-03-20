#!/usr/bin/env node
// Fix canonical URL mismatch: strip .html from canonical tags
// cleanUrls: true in vercel.json serves pages without .html, so canonicals must match

const fs = require('fs');
const path = require('path');

function getHtmlFiles(dir, excludeDirs = []) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name)) {
        results.push(...getHtmlFiles(full, excludeDirs));
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

// Skip listing/ — those are already correct (no .html in canonical)
const files = getHtmlFiles('./public', ['listing']);
let fixedCount = 0;
const filesFixed = [];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  const before = content;
  // Strip .html from canonical href values only
  content = content.replace(
    /(<link rel="canonical" href="https:\/\/www\.3dprintmap\.com\/[^"]*?)\.html(")/g,
    '$1$2'
  );
  if (content !== before) {
    fs.writeFileSync(file, content, 'utf-8');
    filesFixed.push(path.relative('./public', file));
    fixedCount++;
  }
}

console.log('Fixed', fixedCount, 'files:');
filesFixed.forEach(f => console.log(' ', f));
console.log('\nDone. Canonical tags now match cleanUrls behavior.');
