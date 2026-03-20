#!/usr/bin/env node
// Fix og:url values: strip .html to match cleanUrls behavior
// Also fix blog/index canonical: /blog/index → /blog (Vercel serves index.html as directory root)

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

const files = getHtmlFiles('./public', ['listing']);
let fixedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  const before = content;

  // Strip .html from og:url values
  content = content.replace(
    /(<meta property="og:url" content="https:\/\/www\.3dprintmap\.com\/[^"]*?)\.html(")/g,
    '$1$2'
  );

  // Fix blog/index canonical → /blog
  content = content.replace(
    /<link rel="canonical" href="https:\/\/www\.3dprintmap\.com\/blog\/index">/g,
    '<link rel="canonical" href="https://www.3dprintmap.com/blog">'
  );

  // Fix blog/index og:url if it has .html variant (redundant guard)
  content = content.replace(
    /<meta property="og:url" content="https:\/\/www\.3dprintmap\.com\/blog\/index">/g,
    '<meta property="og:url" content="https://www.3dprintmap.com/blog">'
  );

  if (content !== before) {
    fs.writeFileSync(file, content, 'utf-8');
    fixedCount++;
    console.log('Fixed:', path.relative('./public', file));
  }
}

console.log('\nTotal files fixed:', fixedCount);
