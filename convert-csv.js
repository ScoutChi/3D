#!/usr/bin/env node
// ================================================================
// 3DPrintMap - CSV to data.js Converter
// Converts your lobstr.io export to the format the website needs.
//
// Usage:  node convert-csv.js your-lobstr-export.csv
// Output: js/data.js  (overwrites existing file)
// ================================================================

const fs = require('fs');
const path = require('path');

const csvFile = process.argv[2];
if (!csvFile) {
  console.error('\nUsage: node convert-csv.js <path-to-csv-file>\n');
  console.error('Example: node convert-csv.js lobstr-export.csv\n');
  process.exit(1);
}

if (!fs.existsSync(csvFile)) {
  console.error(`\nFile not found: ${csvFile}\n`);
  process.exit(1);
}

const content = fs.readFileSync(csvFile, 'utf-8');
const lines = content.split('\n').filter(l => l.trim());

if (lines.length < 2) {
  console.error('\nCSV file appears to be empty or has only a header row.\n');
  process.exit(1);
}

const rawHeaders = parseCSVRow(lines[0]);
const headers = rawHeaders.map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''));

console.log('\n📋 Detected columns:');
headers.forEach((h, i) => console.log(`  [${i}] ${h}`));

const businesses = [];

for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  const values = parseCSVRow(lines[i]);
  const row = {};
  headers.forEach((h, idx) => { row[h] = (values[idx] || '').trim(); });

  // ── Map lobstr.io field names → our schema ──────────────────
  const name       = row['name'] || row['business_name'] || row['title'] || row['company_name'] || '';
  const address    = row['address'] || row['full_address'] || row['street_address'] || '';
  const city       = row['city'] || extractCity(address);
  const state      = row['region'] || row['state'] || row['state_code'] || extractState(address);
  const zip        = row['zip_code'] || row['zip'] || row['postal_code'] || '';
  const phone      = row['phone'] || row['phone_number'] || row['telephone'] || '';
  const website    = row['website'] || row['url'] || row['web'] || '';
  const ratingRaw  = row['score'] || row['rating'] || row['stars'] || row['average_rating'] || '0';
  const reviewsRaw = row['ratings'] || row['reviews'] || row['number_of_reviews'] || row['review_count'] || '0';
  const category   = row['category'] || row['categories'] || row['type'] || '';
  const description= row['description'] || row['about'] || row['summary'] || '';
  const hours      = row['opening_hours'] || row['hours'] || row['business_hours'] || 'Mon–Fri: 9am–5pm';
  const email      = row['email'] || '';
  const facebook   = row['facebook'] || '';
  const instagram  = row['instagram'] || '';
  const twitter    = row['twitter'] || '';
  const imageUrl   = row['main_image_url'] || row['image_url'] || row['photo'] || '';
  const lat        = row['latitude'] || row['lat'] || '';
  const lng        = row['longitude'] || row['lng'] || row['lon'] || '';

  if (!name) continue; // skip blank rows

  const rating  = Math.min(5, Math.max(0, parseFloat(ratingRaw) || 0));
  const reviews = parseInt(reviewsRaw.toString().replace(/[^0-9]/g, '')) || 0;

  // ── Auto-detect service types ────────────────────────────────
  const text = (name + ' ' + category + ' ' + description).toLowerCase();
  const types = [];
  if (text.includes('fdm') || text.includes('fused deposition') || text.includes('filament') || text.includes('fff')) types.push('FDM');
  if (text.includes('sla') || text.includes('resin') || text.includes('stereolithography') || text.includes('dlp') || text.includes('msla')) types.push('SLA');
  if (text.includes('sls') || text.includes('selective laser') || text.includes('powder bed') || text.includes('nylon printing')) types.push('SLS');
  if (text.includes('metal') || text.includes('dmls') || text.includes('slm') || text.includes('ebm') || text.includes('titanium') || text.includes('steel printing') || text.includes('metal 3d')) types.push('Metal');
  if (text.includes('multicolor') || text.includes('multi-color') || text.includes('full color') || text.includes('polyjet')) types.push('Multicolor');
  if (types.length === 0) types.push('FDM'); // default

  // ── Auto-detect materials ─────────────────────────────────────
  const materials = [];
  if (text.includes('pla')) materials.push('PLA');
  if (text.includes('abs')) materials.push('ABS');
  if (text.includes('petg')) materials.push('PETG');
  if (text.includes('resin') || text.includes('photopolymer')) materials.push('Resin');
  if (text.includes('nylon') || text.includes('pa12') || text.includes('pa11')) materials.push('Nylon');
  if (text.includes('tpu') || text.includes('flexible filament') || text.includes('thermoplastic polyurethane')) materials.push('TPU');
  if (text.includes('carbon fiber') || text.includes('carbon fibre') || text.includes('cfrp')) materials.push('Carbon Fiber');
  if (text.includes('stainless') || text.includes('titanium') || text.includes('aluminum') || text.includes('metal print')) materials.push('Metal');
  if (materials.length === 0) materials.push('PLA');

  // ── Auto-detect services ───────────────────────────────────────
  const services = [];
  if (text.includes('prototype') || text.includes('prototyping') || text.includes('rapid proto')) services.push('Prototyping');
  if (text.includes('production run') || text.includes('low volume') || text.includes('batch print') || text.includes('mass print')) services.push('Production Runs');
  if (text.includes('design') || text.includes('cad') || text.includes('modeling') || text.includes('3d model')) services.push('Design Services');
  if (text.includes('finishing') || text.includes('post-process') || text.includes('paint') || text.includes('sand') || text.includes('smooth')) services.push('Post-Processing');
  if (text.includes('assembl')) services.push('Assembly');
  if (services.length === 0) services.push('Prototyping');

  // ── Price range heuristic ──────────────────────────────────────
  let priceRange = '$$';
  if (text.includes('affordable') || text.includes('budget') || text.includes('cheap') || text.includes('low cost')) priceRange = '$';
  if (text.includes('premium') || text.includes('industrial') || text.includes('enterprise') || types.includes('Metal')) priceRange = '$$$';

  businesses.push({
    id: i,
    name,
    city: city || 'Unknown',
    state: state || 'US',
    address: address || [city, state, zip].filter(Boolean).join(', '),
    phone,
    website: normalizeUrl(website),
    email,
    rating,
    reviews,
    types,
    materials,
    services,
    industries: autoDetectIndustries(text),
    priceRange,
    description: description || `${name} — 3D printing services in ${city || 'your area'}.`,
    hours,
    isOpen: true,
    isNew: true,
    emoji: getEmoji(types[0]),
    imageUrl: imageUrl || '',
    facebook: facebook || '',
    instagram: instagram || '',
    twitter: twitter || '',
    lat: lat || null,
    lng: lng || null
  });
}

if (businesses.length === 0) {
  console.error('\n❌ No businesses were parsed. Check that your CSV has a "name" column.\n');
  process.exit(1);
}

// ── Generate cities from data ──────────────────────────────────
const cityMap = {};
businesses.forEach(b => {
  if (b.city && b.city !== 'Unknown') {
    cityMap[b.city] = b.state;
  }
});
const cities = Object.entries(cityMap)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([name, state]) => ({ name, state }));

// ── Service tag counts from data ───────────────────────────────
const serviceNames = ['Prototyping', 'Production Runs', 'Design Services', 'Post-Processing', 'Assembly'];
const serviceCounts = serviceNames.map(sn => ({
  name: sn === 'Prototyping' ? 'Rapid Prototyping' :
        sn === 'Design Services' ? 'Design & CAD Services' :
        sn === 'Post-Processing' ? 'Post-Processing & Finishing' : sn,
  count: businesses.filter(b => b.services.includes(sn)).length
}));

// ── Write output ───────────────────────────────────────────────
const output = `// ================================================================
// 3DPrintMap - Business Data
// Auto-generated by convert-csv.js on ${new Date().toLocaleDateString()}
// Source: ${path.basename(csvFile)}
// Total: ${businesses.length} businesses
// Re-run: node convert-csv.js ${csvFile}
// ================================================================

const BUSINESSES = ${JSON.stringify(businesses, null, 2)};

const CITIES = ${JSON.stringify(cities, null, 2)};

const SERVICES = ${JSON.stringify(serviceCounts, null, 2)};

// ── Helper functions ──────────────────────────────────────────
function getStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function getBusinessesByCity(city) {
  return BUSINESSES.filter(b => b.city.toLowerCase() === city.toLowerCase());
}

function getBusinessesByType(type) {
  return BUSINESSES.filter(b => b.types.map(t => t.toLowerCase()).includes(type.toLowerCase()));
}

function searchBusinesses(query) {
  const q = query.toLowerCase();
  return BUSINESSES.filter(b =>
    b.name.toLowerCase().includes(q) ||
    b.city.toLowerCase().includes(q) ||
    b.state.toLowerCase().includes(q) ||
    b.types.some(t => t.toLowerCase().includes(q)) ||
    b.services.some(s => s.toLowerCase().includes(q)) ||
    b.materials.some(m => m.toLowerCase().includes(q))
  );
}

function createListingCard(business) {
  const stars = getStars(business.rating);
  const tags = business.types.slice(0, 3).map(t => \`<span class="tag">\${t}</span>\`).join('');
  const statusClass = business.isOpen ? 'badge-open' : 'badge-closed';
  const statusText = business.isOpen ? 'Now Open' : 'Now Closed';
  return \`
    <div class="listing-card" onclick="window.location='business.html?id=\${business.id}'">
      <div class="listing-img">
        <span>\${business.emoji}</span>
        <span class="listing-badge \${statusClass}">\${statusText}</span>
      </div>
      <div class="listing-body">
        <div class="listing-name">\${business.name}</div>
        <div class="listing-location">📍 \${business.city}, \${business.state}</div>
        <div class="listing-rating">
          <span class="stars">\${stars}</span>
          <span class="rating-text">\${business.rating} (\${business.reviews} reviews)</span>
        </div>
        <div class="listing-tags">\${tags}</div>
        <div class="listing-footer">
          <span class="price-range">Price: \${business.priceRange}</span>
          <span class="listing-cta">View Details →</span>
        </div>
      </div>
    </div>
  \`;
}
`;

const outputPath = path.join(__dirname, 'public', 'js', 'data.js');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output, 'utf-8');

console.log(`\n✅ Success! Generated js/data.js with ${businesses.length} businesses`);
console.log(`📍 Cities found: ${cities.length}`);
console.log(`\nNext steps:`);
console.log(`  1. Open index.html in your browser to preview`);
console.log(`  2. Deploy to Vercel (drag the folder to vercel.com/new)`);
console.log(`\n`);

// ── Utility functions ─────────────────────────────────────────
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

function extractCity(address) {
  if (!address) return '';
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 3) return parts[parts.length - 3];
  if (parts.length === 2) return parts[0];
  return '';
}

function extractState(address) {
  if (!address) return '';
  const match = address.match(/,\s*([A-Z]{2})\s*\d{5}/);
  if (match) return match[1];
  const stateNames = { 'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA','Colorado':'CO','Connecticut':'CT','Delaware':'DE','Florida':'FL','Georgia':'GA','Hawaii':'HI','Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA','Kansas':'KS','Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD','Massachusetts':'MA','Michigan':'MI','Minnesota':'MN','Mississippi':'MS','Missouri':'MO','Montana':'MT','Nebraska':'NE','Nevada':'NV','New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM','New York':'NY','North Carolina':'NC','North Dakota':'ND','Ohio':'OH','Oklahoma':'OK','Oregon':'OR','Pennsylvania':'PA','Rhode Island':'RI','South Carolina':'SC','South Dakota':'SD','Tennessee':'TN','Texas':'TX','Utah':'UT','Vermont':'VT','Virginia':'VA','Washington':'WA','West Virginia':'WV','Wisconsin':'WI','Wyoming':'WY','District of Columbia':'DC' };
  for (const [name, code] of Object.entries(stateNames)) {
    if (address.includes(name)) return code;
  }
  return '';
}

function normalizeUrl(url) {
  if (!url) return '';
  url = url.trim();
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.includes('.')) return 'https://' + url;
  return '';
}

function getEmoji(type) {
  return { FDM: '🖨️', SLA: '💎', SLS: '⚡', Metal: '🔩', Multicolor: '🎨' }[type] || '🖨️';
}

function autoDetectIndustries(text) {
  const map = [
    ['aerospace', 'Aerospace'],
    ['medical', 'Medical'],
    ['dental', 'Dental'],
    ['automotive', 'Automotive'],
    ['architect', 'Architecture'],
    ['jewelry', 'Jewelry'],
    ['fashion', 'Fashion'],
    ['education', 'Education'],
    ['defense', 'Defense'],
    ['oil', 'Oil & Gas'],
    ['marine', 'Marine'],
    ['entertainment', 'Entertainment'],
  ];
  const found = map.filter(([k]) => text.includes(k)).map(([, v]) => v);
  return found.length > 0 ? found : ['Consumer Products'];
}
