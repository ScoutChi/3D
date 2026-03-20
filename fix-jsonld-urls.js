#!/usr/bin/env node
// Fix remaining .html references in JSON-LD blocks across all non-listing pages

const fs = require('fs');
const path = require('path');

function getHtmlFiles(dir, excludeDirs = []) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name)) results.push(...getHtmlFiles(full, excludeDirs));
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

  // Fix blog/index.html → blog (directory index)
  content = content.replace(/https:\/\/www\.3dprintmap\.com\/blog\/index\.html/g,
    'https://www.3dprintmap.com/blog');

  // Fix all other absolute 3dprintmap.com URLs ending in .html
  content = content.replace(
    /https:\/\/www\.3dprintmap\.com\/((?!blog\/index\.html)[^"'\s]*)\.html/g,
    'https://www.3dprintmap.com/$1'
  );

  if (content !== before) {
    fs.writeFileSync(file, content, 'utf-8');
    fixedCount++;
    console.log('Fixed:', path.relative('./public', file));
  }
}

console.log('\nTotal files fixed:', fixedCount);
