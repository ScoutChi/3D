#!/usr/bin/env node
// ================================================================
// 3DPrintMap - CSV Merge & Audit Tool
// Merges two CSV source files, deduplicates by name+city, and
// writes a combined merged_businesses.csv ready for convert-csv.js
//
// Run: node merge-csvs.js
// Output: merged_businesses.csv
// ================================================================

const fs = require('fs');

const NEW_CSV = './cleaned_3d_printing_leads 3.18.csv';  // 1,034 records (authoritative)
const OLD_CSV = './Cleaned_3D_Printing_Directory.csv';   // 308 records (older)
const OUT_CSV = './merged_businesses.csv';

// ── RFC-4180 compliant CSV row parser (same as convert-csv.js) ──
function parseCSVRow(row) {
  const result = [];
  let inQuotes = false;
  let current = '';
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// ── Parse a CSV file into array of row objects ──────────────────
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  const rawHeaders = parseCSVRow(lines[0]);
  const headers = rawHeaders.map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVRow(lines[i]);
    const row = {};
    headers.forEach((h, idx) => { row[h] = (values[idx] || '').trim(); });
    rows.push(row);
  }
  return rows;
}

// ── Normalize name+city for deduplication ───────────────────────
function dedupKey(name, city) {
  const normalize = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return normalize(name) + '|' + normalize(city);
}

// ── Get name and city from a parsed row (handles column aliases) ─
function getName(row) {
  return row['name'] || row['business_name'] || row['title'] || row['company_name'] || '';
}
function getCity(row) {
  return row['city'] || '';
}

// ── Escape a value for CSV output ────────────────────────────────
function csvEscape(val) {
  const s = String(val || '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// ── Main ─────────────────────────────────────────────────────────
console.log('Reading CSV files...');
const newRows = parseCSV(NEW_CSV);
const oldRows = parseCSV(OLD_CSV);

console.log(`  New CSV: ${newRows.length} records`);
console.log(`  Old CSV: ${oldRows.length} records`);

// Build dedup set from new CSV (authoritative baseline)
const newKeys = new Set();
for (const row of newRows) {
  const key = dedupKey(getName(row), getCity(row));
  if (key !== '|') newKeys.add(key);
}

// Find old CSV records not present in new CSV
const missing = [];
const duplicates = [];
for (const row of oldRows) {
  const name = getName(row);
  if (!name) continue;
  const city = getCity(row);
  const key = dedupKey(name, city);
  if (newKeys.has(key)) {
    duplicates.push({ name, city });
  } else {
    missing.push(row);
  }
}

// ── Audit report ─────────────────────────────────────────────────
console.log('\n=== AUDIT REPORT ===');
console.log(`Old CSV total:       ${oldRows.length}`);
console.log(`Already in new CSV:  ${duplicates.length}`);
console.log(`Missing (to add):    ${missing.length}`);

if (missing.length === 0) {
  console.log('\nAll businesses from the old CSV are already in the new CSV.');
  console.log('No new businesses to add. Exiting without writing merged file.');
  process.exit(0);
}

console.log('\nBusinesses to be added:');
missing.forEach(row => {
  const name = getName(row);
  const city = getCity(row);
  const state = row['region'] || row['state'] || '';
  console.log(`  + ${name} — ${city}, ${state}`);
});

// ── Build merged CSV ──────────────────────────────────────────────
// Unified column order (superset of both CSVs)
const COLUMNS = [
  'NAME', 'CATEGORY', 'STREET ADDRESS', 'CITY', 'REGION', 'ZIP CODE',
  'PHONE', 'WEBSITE', 'EMAIL', 'SCORE', 'RATINGS',
  'LAT', 'LNG', 'OPENING HOURS', 'DESCRIPTION',
  'FACEBOOK', 'INSTAGRAM', 'TWITTER', 'MAIN IMAGE URL'
];

// Map a parsed new-CSV row to the unified columns
function mapNewRow(row) {
  return {
    'NAME':          row['name'] || '',
    'CATEGORY':      row['category'] || row['categories'] || row['type'] || '',
    'STREET ADDRESS':row['street_address'] || row['address'] || row['full_address'] || '',
    'CITY':          row['city'] || '',
    'REGION':        row['region'] || row['state'] || '',
    'ZIP CODE':      row['zip_code'] || row['zip'] || '',
    'PHONE':         row['phone'] || '',
    'WEBSITE':       row['website'] || '',
    'EMAIL':         row['email'] || '',
    'SCORE':         row['score'] || row['rating'] || '',
    'RATINGS':       row['ratings'] || row['reviews'] || '',
    'LAT':           row['lat'] || row['latitude'] || '',
    'LNG':           row['lng'] || row['longitude'] || '',
    'OPENING HOURS': row['opening_hours'] || row['hours'] || '',
    'DESCRIPTION':   row['description'] || row['about'] || '',
    'FACEBOOK':      row['facebook'] || '',
    'INSTAGRAM':     row['instagram'] || '',
    'TWITTER':       row['twitter'] || '',
    'MAIN IMAGE URL':row['main_image_url'] || row['image_url'] || ''
  };
}

// Map a parsed old-CSV row to the unified columns
function mapOldRow(row) {
  return {
    'NAME':          row['name'] || '',
    'CATEGORY':      row['category'] || row['categories'] || row['type'] || '',
    'STREET ADDRESS':row['address'] || row['street_address'] || row['full_address'] || '',
    'CITY':          row['city'] || '',
    'REGION':        row['region'] || row['state'] || '',
    'ZIP CODE':      row['zip_code'] || row['zip'] || '',
    'PHONE':         row['phone'] || '',
    'WEBSITE':       row['website'] || '',
    'EMAIL':         row['email'] || '',
    'SCORE':         row['score'] || row['rating'] || '',
    'RATINGS':       row['ratings'] || row['reviews'] || '',
    'LAT':           '',  // not in old CSV
    'LNG':           '',  // not in old CSV
    'OPENING HOURS': row['opening_hours'] || row['hours'] || '',
    'DESCRIPTION':   row['description'] || row['about'] || '',
    'FACEBOOK':      row['facebook'] || '',
    'INSTAGRAM':     row['instagram'] || '',
    'TWITTER':       row['twitter'] || '',
    'MAIN IMAGE URL':row['main_image_url'] || row['image_url'] || ''
  };
}

const csvLines = [];
csvLines.push(COLUMNS.map(csvEscape).join(','));

for (const row of newRows) {
  const mapped = mapNewRow(row);
  csvLines.push(COLUMNS.map(c => csvEscape(mapped[c])).join(','));
}
for (const row of missing) {
  const mapped = mapOldRow(row);
  csvLines.push(COLUMNS.map(c => csvEscape(mapped[c])).join(','));
}

fs.writeFileSync(OUT_CSV, csvLines.join('\n') + '\n', 'utf-8');

const total = newRows.length + missing.length;
console.log(`\nWritten: ${OUT_CSV}`);
console.log(`Total records: ${total} (${newRows.length} from new CSV + ${missing.length} from old CSV)`);
console.log('\nNext steps:');
console.log('  node convert-csv.js merged_businesses.csv');
console.log('  node generate-listings.js');
console.log('  node generate-data-slim.js');
console.log('  node generate-browse-page.js');
console.log('  node generate-sitemap.js');
