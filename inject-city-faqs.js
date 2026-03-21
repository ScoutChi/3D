#!/usr/bin/env node
// Injects a 5-question FAQ section (HTML + FAQPage JSON-LD) into every
// city-level category page (public/3d-printing-*.html).
// Run: node inject-city-faqs.js

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Load business data ────────────────────────────────────────────
const src     = fs.readFileSync(path.join(__dirname, 'public/js/data.js'), 'utf-8');
const arrStart = src.indexOf('[', src.indexOf('const BUSINESSES = ['));
let depth = 0, arrEnd = -1;
for (let i = arrStart; i < src.length; i++) {
  if (src[i] === '[') depth++;
  else if (src[i] === ']') { depth--; if (depth === 0) { arrEnd = i; break; } }
}
const ALL = JSON.parse(src.slice(arrStart, arrEnd + 1));

// ── City definitions ──────────────────────────────────────────────
// metroFilter: function to select businesses for this city's metro area
// For cities with no exact data, metroFilter returns []
const CITIES = [
  {
    slug: '3d-printing-albuquerque',
    city: 'Albuquerque', stateAbbr: 'NM', stateName: 'New Mexico',
    metroFilter: b => b.state === 'New Mexico',
  },
  {
    slug: '3d-printing-anchorage',
    city: 'Anchorage', stateAbbr: 'AK', stateName: 'Alaska',
    metroFilter: b => b.state === 'Alaska',
  },
  {
    slug: '3d-printing-baltimore',
    city: 'Baltimore', stateAbbr: 'MD', stateName: 'Maryland',
    metroFilter: b => b.state === 'Maryland',
  },
  {
    slug: '3d-printing-boise',
    city: 'Boise', stateAbbr: 'ID', stateName: 'Idaho',
    metroFilter: b => b.state === 'Idaho',
  },
  {
    slug: '3d-printing-boston',
    city: 'Boston', stateAbbr: 'MA', stateName: 'Massachusetts',
    metroFilter: b => b.state === 'Massachusetts',
  },
  {
    slug: '3d-printing-chicago',
    city: 'Chicago', stateAbbr: 'IL', stateName: 'Illinois',
    metroFilter: b => b.state === 'Illinois',
  },
  {
    slug: '3d-printing-honolulu',
    city: 'Honolulu', stateAbbr: 'HI', stateName: 'Hawaii',
    metroFilter: b => b.state === 'Hawaii',
  },
  {
    slug: '3d-printing-indianapolis',
    city: 'Indianapolis', stateAbbr: 'IN', stateName: 'Indiana',
    metroFilter: b => b.state === 'Indiana',
  },
  {
    slug: '3d-printing-kansas-city',
    city: 'Kansas City', stateAbbr: 'MO', stateName: 'Missouri',
    metroFilter: b => b.state === 'Missouri',
  },
  {
    slug: '3d-printing-los-angeles',
    city: 'Los Angeles', stateAbbr: 'CA', stateName: 'California',
    metroFilter: b => [
      'Los Angeles','Burbank','Culver City','Glendale','Inglewood','Long Beach',
      'Pasadena','Sherman Oaks','Van Nuys','West Hollywood','Hollywood',
      'Reseda','Maywood','Walnut Park','Huntington Park','South El Monte',
      'El Monte','Rosemead','Monrovia','Covina','Arcadia','Irwindale',
      'Carson','Gardena','Seal Beach','Whittier','La Palma','Los Alamitos',
    ].includes(b.city),
  },
  {
    slug: '3d-printing-milwaukee',
    city: 'Milwaukee', stateAbbr: 'WI', stateName: 'Wisconsin',
    metroFilter: b => b.state === 'Wisconsin',
  },
  {
    slug: '3d-printing-new-orleans',
    city: 'New Orleans', stateAbbr: 'LA', stateName: 'Louisiana',
    metroFilter: b => b.state === 'Louisiana',
  },
  {
    slug: '3d-printing-new-york',
    city: 'New York', stateAbbr: 'NY', stateName: 'New York',
    metroFilter: b => [
      'New York','Manhattan','Brooklyn','Long Island City','Yonkers',
      'PECK SLIP','Hoboken','Jersey City','Newark','Staten Island',
      'Valley Stream','Bellerose','Ridgewood','Woodside','Nutley',
      'West New York','Clifton','New Providence',
    ].includes(b.city),
  },
  {
    slug: '3d-printing-portland',
    city: 'Portland', stateAbbr: 'OR', stateName: 'Oregon',
    metroFilter: b => b.state === 'Oregon',
  },
  {
    slug: '3d-printing-salt-lake-city',
    city: 'Salt Lake City', stateAbbr: 'UT', stateName: 'Utah',
    metroFilter: b => b.state === 'Utah',
  },
  {
    slug: '3d-printing-seattle',
    city: 'Seattle', stateAbbr: 'WA', stateName: 'Washington',
    metroFilter: b => b.state === 'Washington',
  },
  {
    slug: '3d-printing-sioux-falls',
    city: 'Sioux Falls', stateAbbr: 'SD', stateName: 'South Dakota',
    metroFilter: b => b.state === 'South Dakota',
  },
  {
    slug: '3d-printing-virginia-beach',
    city: 'Virginia Beach', stateAbbr: 'VA', stateName: 'Virginia',
    metroFilter: b => b.state === 'Virginia',
  },
  {
    slug: '3d-printing-wichita',
    city: 'Wichita', stateAbbr: 'KS', stateName: 'Kansas',
    metroFilter: b => b.state === 'Kansas',
  },
];

// ── Helpers ───────────────────────────────────────────────────────
function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escJson(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ');
}

// Strip HTML tags for JSON-LD plain text
function stripHtml(str) {
  return str.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// ── FAQ generator ─────────────────────────────────────────────────
function generateFAQs(cityDef, biz) {
  const { city, stateAbbr, stateName } = cityDef;
  const cityEnc = encodeURIComponent(city);

  const total       = biz.length;
  const types       = [...new Set(biz.flatMap(b => b.types || []))].sort();
  const open24      = biz.filter(b => b.hours && b.hours.includes('Open 24 hours'));
  const protoBiz    = biz.filter(b => (b.services || []).includes('Prototyping'));
  const designBiz   = biz.filter(b => (b.services || []).includes('Design Services'));
  const hasMetal    = biz.some(b => (b.types || []).includes('Metal'));
  const hasSLA      = biz.some(b => (b.types || []).includes('SLA'));
  const hasSLS      = biz.some(b => (b.types || []).includes('SLS'));
  const topRated    = biz
    .filter(b => b.rating >= 4.5)
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);

  const hasData = total > 0;

  const faqs = [];

  // ── Q1: Affordable / where to find ─────────────────────────────
  if (hasData && total >= 5) {
    faqs.push({
      q: `Where can I find affordable 3D printing in ${city}?`,
      a: `3DPrintMap lists ${total}+ 3D printing services in the ${city} metro area. ` +
         `FDM printing is the most affordable technology, typically starting at $5–$50 for simple parts. ` +
         `Use the <a href="/directory?city=${cityEnc}">3D printing directory</a> to filter by price range ` +
         `and compare local shops side-by-side.`,
    });
  } else {
    faqs.push({
      q: `Where can I find affordable 3D printing in ${city}?`,
      a: `FDM (Fused Deposition Modeling) is the most affordable 3D printing option available in ${city}, ` +
         `typically starting at $5–$50 per part for simple geometries. ` +
         `Browse the <a href="/directory?city=${cityEnc}">3DPrintMap directory</a> to compare local shops ` +
         `by price range, or request free quotes from multiple providers to find the best deal.`,
    });
  }

  // ── Q2: What technologies are available ─────────────────────────
  if (hasData && types.length > 0) {
    let techDetail = `${city}-area print shops on 3DPrintMap offer ${types.join(', ')} printing. `;
    if (hasSLA)   techDetail += `SLA resin printing delivers the finest detail for jewelry, dental, and engineering models. `;
    if (hasSLS)   techDetail += `SLS nylon printing produces strong, support-free parts ideal for complex geometries. `;
    if (hasMetal) techDetail += `Metal 3D printing is available for end-use metal components in steel, titanium, and aluminum. `;
    techDetail += `<a href="/directory?city=${cityEnc}">Filter by technology</a> to find the right shop for your project.`;
    faqs.push({
      q: `What types of 3D printing are available in ${city}?`,
      a: techDetail,
    });
  } else {
    faqs.push({
      q: `What types of 3D printing are available in ${city}?`,
      a: `${city} has access to the full range of 3D printing technologies: ` +
         `FDM for fast, affordable plastic parts; SLA resin for high-resolution detail; ` +
         `SLS nylon for strong, support-free engineering parts; and metal printing for end-use metal components. ` +
         `FDM is the most widely available and lowest-cost option. ` +
         `<a href="/directory?city=${cityEnc}">Browse the directory</a> to filter by technology and see what's available near ${city}.`,
    });
  }

  // ── Q3: 24-hour / rush availability ────────────────────────────
  if (open24.length > 0) {
    const names = open24.slice(0, 2).map(b => b.name).join(' and ');
    faqs.push({
      q: `Are there 24-hour 3D printing services in ${city}?`,
      a: `Yes — ${open24.length} print ${open24.length === 1 ? 'shop' : 'shops'} in the ${city} area ` +
         `${open24.length === 1 ? 'is' : 'are'} listed on 3DPrintMap as open 24 hours, including ${names}. ` +
         `Use the "Open Now" filter in the <a href="/directory?city=${cityEnc}">directory</a> ` +
         `to see all currently available services.`,
    });
  } else {
    faqs.push({
      q: `Are there same-day or rush 3D printing services in ${city}?`,
      a: `Many 3D printing shops in ${city} offer rush and same-day services for simple FDM parts — ` +
         `especially for small, low-complexity prints. Turnaround times depend on part complexity, material, ` +
         `and shop queue. Contact providers directly via their listings on ` +
         `<a href="/directory?city=${cityEnc}">3DPrintMap</a> to confirm rush availability and pricing.`,
    });
  }

  // ── Q4: Cost / pricing ──────────────────────────────────────────
  const protoNote = hasData && protoBiz.length > 0
    ? ` ${protoBiz.length} of the listed ${city} services specialize in prototyping.`
    : '';
  faqs.push({
    q: `How much does 3D printing cost in ${city}?`,
    a: `3D printing prices in ${city} vary by technology, material, and part complexity. ` +
       `FDM printing typically costs $5–$200 per part; SLA resin $25–$500+; SLS nylon $100–$1,000+; ` +
       `and metal printing $500–$5,000+ per part.${protoNote} ` +
       `Most ${city} print shops offer free online quotes — visit individual listings on ` +
       `<a href="/directory?city=${cityEnc}">3DPrintMap</a> to request pricing.`,
  });

  // ── Q5: Best / top-rated or design services ─────────────────────
  if (topRated.length > 0) {
    const top = topRated[0];
    const second = topRated[1];
    let answer = `${top.name} is one of the highest-rated 3D printing services in the ${city} area` +
      (top.rating ? ` with a ${top.rating}-star rating` : '') +
      (top.reviews ? ` across ${top.reviews} reviews` : '') + `. `;
    if (second) {
      answer += `${second.name} (${second.rating} stars) is another top-rated option. `;
    }
    answer += `The best shop for your project depends on technology, turnaround, and budget — ` +
      `<a href="/directory?city=${cityEnc}">compare all ${city} services</a> on 3DPrintMap.`;
    faqs.push({
      q: `What is the best 3D printing service in ${city}?`,
      a: answer,
    });
  } else if (hasData && designBiz.length > 0) {
    faqs.push({
      q: `Do 3D printing shops in ${city} offer design services?`,
      a: `Yes — ${designBiz.length} of the 3D printing services listed in the ${city} area offer ` +
         `design assistance, including CAD modeling, file repair, and print optimization. ` +
         `If you don't have a ready-to-print file, look for shops with "Design Services" in their listing. ` +
         `<a href="/directory?city=${cityEnc}">Browse ${city} design-capable shops</a> on 3DPrintMap.`,
    });
  } else {
    faqs.push({
      q: `Do 3D printing shops in ${city} offer design and CAD services?`,
      a: `Many 3D printing shops in ${city} offer design assistance alongside printing, including ` +
         `CAD modeling, STL file repair, and print optimization for customers who don't have a ready file. ` +
         `Look for "Design Services" listed on each shop's profile at ` +
         `<a href="/directory?city=${cityEnc}">3DPrintMap</a> to find full-service providers.`,
    });
  }

  return faqs;
}

// ── HTML builder ──────────────────────────────────────────────────
function buildFAQHtml(cityDef, faqs) {
  const { city } = cityDef;
  const items = faqs.map((faq, i) => `
    <div class="faq-item">
      <button class="faq-question" aria-expanded="${i === 0 ? 'true' : 'false'}">${esc(faq.q)}<i class="fa-solid fa-chevron-down faq-chevron" aria-hidden="true"></i></button>
      <div class="faq-answer"><p>${faq.a}</p></div>
    </div>`).join('');

  return `
<section class="section city-faq-section" style="background:var(--white);padding-bottom:0;" aria-label="Frequently asked questions about 3D printing in ${esc(city)}">
  <div class="wrap">
    <div class="faq-layout" style="max-width:780px;">
      <div class="faq-group">
        <div class="faq-group-header">
          <span class="faq-group-icon"><i class="fa-solid fa-circle-question" aria-hidden="true"></i></span>
          <h2>3D Printing in ${esc(city)} — FAQ</h2>
        </div>
        <div class="faq-list">${items}
        </div>
      </div>
    </div>
  </div>
</section>
<script>
(function(){
  document.querySelectorAll('.city-faq-section .faq-question').forEach(function(btn){
    // open first item by default
    var item = btn.closest('.faq-item');
    if(btn.getAttribute('aria-expanded')==='true') item.classList.add('open');
    btn.addEventListener('click',function(){
      var isOpen=item.classList.contains('open');
      document.querySelectorAll('.city-faq-section .faq-item.open').forEach(function(el){
        el.classList.remove('open');
        el.querySelector('.faq-question').setAttribute('aria-expanded','false');
      });
      if(!isOpen){item.classList.add('open');btn.setAttribute('aria-expanded','true');}
    });
  });
})();
</script>`;
}

// ── JSON-LD builder ───────────────────────────────────────────────
function buildFAQJsonLd(cityDef, faqs) {
  const items = faqs.map(faq => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: stripHtml(faq.a),
    },
  }));

  return `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": ${JSON.stringify(items, null, 4)}
}
</script>`;
}

// ── Main loop ─────────────────────────────────────────────────────
const pub = path.join(__dirname, 'public');
let updated = 0;
let skipped = 0;

CITIES.forEach(cityDef => {
  const fp = path.join(pub, cityDef.slug + '.html');
  if (!fs.existsSync(fp)) {
    console.warn(`⚠  Not found: ${cityDef.slug}.html`);
    return;
  }

  let html = fs.readFileSync(fp, 'utf-8');

  if (html.includes('city-faq-section')) {
    console.log(`⚠  ${cityDef.slug} already has FAQ — skipping`);
    skipped++;
    return;
  }

  const biz  = ALL.filter(cityDef.metroFilter);
  const faqs = generateFAQs(cityDef, biz);

  // 1. Add FAQPage JSON-LD before </head>
  const jsonLd   = buildFAQJsonLd(cityDef, faqs);
  html = html.replace('</head>', jsonLd + '\n</head>');

  // 2. Insert FAQ section before <section class="cta-section">
  const faqHtml  = buildFAQHtml(cityDef, faqs);
  html = html.replace('<section class="cta-section">', faqHtml + '\n\n<section class="cta-section">');

  fs.writeFileSync(fp, html, 'utf-8');
  updated++;
  console.log(`✅ ${cityDef.city} (${biz.length} businesses in data)`);
});

console.log(`\nDone — ${updated} pages updated, ${skipped} skipped`);
