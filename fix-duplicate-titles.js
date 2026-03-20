#!/usr/bin/env node
// Fix duplicate listing titles by adding street address to differentiate
// Target: 50-60 chars, format: "Business Name - Address, City, ST | 3DPrintMap"

const fs = require('fs');
const path = require('path');

// Unique titles crafted per-ID using abbreviated address components
// Rules applied: strip suite/unit suffixes, abbreviate long street names where needed,
//   drop state if necessary to stay under 60 chars, drop suffix last resort only
const TITLES = {
  // Staples — New York, NY
  624: 'Staples - 500 8th Ave, New York, NY | 3DPrintMap',         // 49 chars
  633: 'Staples - 5 Union Square W, New York, NY | 3DPrintMap',     // 53 chars
  650: 'Staples - 800 3rd Ave, New York, NY | 3DPrintMap',          // 49 chars
  665: 'Staples - 2248 Broadway, New York, NY | 3DPrintMap',        // 51 chars
  736: 'Staples - 767 Broadway, New York, NY | 3DPrintMap',         // 50 chars

  // The UPS Store — San Diego, CA
  474: 'The UPS Store - 2020 Columbia St, San Diego, CA | 3DPrintMap', // 60 chars
  498: 'The UPS Store - 4075 Park Blvd, San Diego, CA | 3DPrintMap',   // 58 chars
  513: 'The UPS Store - 5821 University Ave, San Diego | 3DPrintMap',  // 59 chars (CA omitted to fit)
  549: 'The UPS Store - 1804 Garnet Ave, San Diego, CA | 3DPrintMap',  // 59 chars
  550: 'The UPS Store - 9187 Clairemont Mesa, San Diego | 3DPrintMap', // 60 chars (Blvd+CA omitted)

  // The UPS Store — New York, NY
  649: 'The UPS Store - 33 Park Pl, New York, NY | 3DPrintMap',  // 53 chars
  655: 'The UPS Store - 541 3rd Ave, New York, NY | 3DPrintMap', // 54 chars
  667: 'The UPS Store - 82 Nassau St, New York, NY | 3DPrintMap', // 55 chars

  // Staples — Los Angeles, CA
  224: 'Staples - 1701 S Figueroa St, Los Angeles, CA | 3DPrintMap', // 58 chars
  252: 'Staples - 3223 W 6th St, Los Angeles, CA | 3DPrintMap',      // 53 chars
  296: 'Staples - 3701 Santa Rosalia, Los Angeles, CA | 3DPrintMap',  // 58 chars (Dr omitted to fit)

  // FedEx Office — New York, NY (full name too long; using recognizable brand shorthand)
  642: 'FedEx Office - 200 Varick St, New York, NY | 3DPrintMap', // 55 chars
  666: 'FedEx Office - 1602 2nd Ave, New York, NY | 3DPrintMap',   // 54 chars

  // ARC Document Solutions — San Diego, CA
  469: 'ARC Document Solutions - 555 W Beech, San Diego | 3DPrintMap', // 60 chars (CA omitted to fit)
  555: 'ARC Document Solutions - Mira Mesa, San Diego | 3DPrintMap',   // 58 chars (street# omitted to fit)
};

// Verify all lengths
console.log('Title length check:');
for (const [id, title] of Object.entries(TITLES)) {
  const len = title.length;
  const flag = len < 50 ? '⚠ SHORT' : len > 60 ? '❌ LONG ' : '✅';
  console.log(`  ${flag} (${len}) [${id}] ${title}`);
}
console.log('');

let updatedCount = 0;

for (const [idStr, newTitle] of Object.entries(TITLES)) {
  const filePath = path.join('./public/listing', idStr + '.html');
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠ File not found: ${filePath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace <title>
  content = content.replace(/<title>[^<]*<\/title>/, `<title>${newTitle}</title>`);

  // Replace og:title
  content = content.replace(
    /(<meta property="og:title" content=")[^"]*(")/,
    `$1${newTitle}$2`
  );

  // Replace twitter:title
  content = content.replace(
    /(<meta name="twitter:title" content=")[^"]*(")/,
    `$1${newTitle}$2`
  );

  fs.writeFileSync(filePath, content, 'utf-8');
  updatedCount++;
  console.log(`Updated listing/${idStr}.html`);
}

console.log(`\nDone. ${updatedCount} files updated.`);
