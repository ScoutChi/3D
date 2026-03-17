// ================================================================
// 3DPrintMap - Business Detail Page JavaScript
// ================================================================

document.addEventListener('DOMContentLoaded', function () {

  // Mobile menu
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  const business = BUSINESSES.find(b => b.id === id);

  if (!business) {
    document.querySelector('.biz-layout').innerHTML = `
      <div class="container" style="text-align:center;padding:80px 20px;">
        <div style="font-size:64px;margin-bottom:16px;">😕</div>
        <h2 style="margin-bottom:8px;">Listing Not Found</h2>
        <p style="color:var(--text-muted);margin-bottom:24px;">This listing may have been removed or the link may be incorrect.</p>
        <a href="directory.html" class="btn btn-primary">← Back to Directory</a>
      </div>`;
    return;
  }

  // ── Noindex thin pages (missing name or address) ──────────────
  if (!business.name || !business.address || business.address === business.city) {
    setMeta('name', 'robots', 'noindex, nofollow');
  }

  // ── Page Title ─────────────────────────────────────────────────
  document.title = `${business.name} — 3D Printing in ${business.city}, ${business.state} | 3DPrintMap`;

  // ── Meta Description ───────────────────────────────────────────
  const techList  = business.types.join(', ');
  const indList   = business.industries.slice(0, 2).join(' & ');
  const metaDesc  = `Looking for 3D printing in ${business.city}? ${business.name} offers ${techList} printing for ${indList}. View reviews, contact info, and pricing on 3DPrintMap.`;

  setMeta('name',     'description',     metaDesc);
  setMeta('name',     'robots',          'index, follow');

  // ── Open Graph ─────────────────────────────────────────────────
  const ogTitle = `${business.name} — 3D Printing in ${business.city}, ${business.state} | 3DPrintMap`;
  setMeta('property', 'og:title',       ogTitle);
  setMeta('property', 'og:description', metaDesc);
  setMeta('property', 'og:url',         `https://3dprintmap.com/business?id=${business.id}`);
  setMeta('property', 'og:type',        'business.business');
  setMeta('property', 'og:image', business.imageUrl || 'https://3dprintmap.com/og-default.png');

  // ── Twitter Card ───────────────────────────────────────────────
  setMeta('name', 'twitter:card',        'summary_large_image');
  setMeta('name', 'twitter:title',       ogTitle);
  setMeta('name', 'twitter:description', metaDesc);
  setMeta('name', 'twitter:image', business.imageUrl || 'https://3dprintmap.com/og-default.png');

  // ── Canonical URL ──────────────────────────────────────────────
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
  canonical.href = `https://3dprintmap.com/business?id=${business.id}`;

  // ── JSON-LD: LocalBusiness ─────────────────────────────────────
  const DEFAULT_IMAGE = 'https://3dprintmap.com/og-default.png';
  const sameAs = [business.facebook, business.instagram, business.twitter].filter(Boolean);
  const mapsQuery = encodeURIComponent(`${business.name} ${business.address} ${business.city} ${business.state}`);
  const hasMap = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': business.name,
    'description': business.description,
    'url': business.website || `https://3dprintmap.com/business?id=${business.id}`,
    'telephone': business.phone ? formatPhone(business.phone) : undefined,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': business.address,
      'addressLocality': business.city,
      'addressRegion': business.state,
      'addressCountry': 'US'
    },
    'openingHours': business.hours,
    'priceRange': business.priceRange || '$$',
    'image': business.imageUrl || DEFAULT_IMAGE,
    'logo': {
      '@type': 'ImageObject',
      'url': DEFAULT_IMAGE,
      'width': 1200,
      'height': 630
    },
    'hasMap': hasMap,
    'sameAs': sameAs.length ? sameAs : undefined,
    'aggregateRating': business.reviews > 0 ? {
      '@type': 'AggregateRating',
      'ratingValue': business.rating,
      'bestRating': '5',
      'worstRating': '1',
      'reviewCount': business.reviews
    } : undefined
  };
  // Remove undefined keys
  Object.keys(jsonLd).forEach(k => jsonLd[k] === undefined && delete jsonLd[k]);

  injectJsonLd(jsonLd);

  // ── JSON-LD: Organization (site-level, satisfies logo warning) ─
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': '3DPrintMap',
    'url': 'https://3dprintmap.com',
    'logo': {
      '@type': 'ImageObject',
      'url': DEFAULT_IMAGE,
      'width': 1200,
      'height': 630
    },
    'sameAs': ['https://3dprintmap.com']
  });

  // ── JSON-LD: BreadcrumbList ────────────────────────────────────
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home',        'item': 'https://3dprintmap.com/' },
      { '@type': 'ListItem', 'position': 2, 'name': business.state, 'item': `https://3dprintmap.com/directory?state=${business.state}` },
      { '@type': 'ListItem', 'position': 3, 'name': business.city,  'item': `https://3dprintmap.com/directory?city=${encodeURIComponent(business.city)}` },
      { '@type': 'ListItem', 'position': 4, 'name': business.name }
    ]
  };
  injectJsonLd(breadcrumbLd);

  // ── Breadcrumb nav ─────────────────────────────────────────────
  const bcName = document.getElementById('bizBreadcrumbName');
  if (bcName) bcName.textContent = business.name;

  const bcState = document.getElementById('bizBreadcrumbState');
  if (bcState) {
    bcState.textContent = business.state;
    bcState.href = `directory.html?state=${business.state}`;
  }

  const bcCity = document.getElementById('bizBreadcrumbCity');
  if (bcCity) {
    bcCity.textContent = business.city;
    bcCity.href = `directory.html?city=${encodeURIComponent(business.city)}`;
  }

  // ── Hero — FA icon if no real photo ───────────────────────────
  const heroEl = document.getElementById('bizHero');
  if (heroEl) {
    heroEl.setAttribute('aria-label', `${business.name} — ${business.types[0]} 3D printing service in ${business.city}`);
  }
  if (business.imageUrl) {
    const heroIcon = document.getElementById('bizHeroIcon');
    if (heroIcon) heroIcon.outerHTML = `<img src="${business.imageUrl}" alt="${business.name} — 3D printing service in ${business.city}, ${business.state}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius);" onerror="this.style.display='none'">`;
  } else {
    const heroIcon = document.getElementById('bizHeroIcon');
    if (heroIcon) {
      heroIcon.innerHTML = getTypeIcon(business.types[0]);
      heroIcon.setAttribute('aria-label', `${business.types[0]} 3D printing icon`);
    }
  }

  // ── Business Name (H1) ─────────────────────────────────────────
  const nameEl = document.getElementById('bizName');
  if (nameEl) nameEl.textContent = business.name;

  // ── Status badge ───────────────────────────────────────────────
  const statusEl = document.getElementById('bizStatus');
  if (statusEl) {
    statusEl.textContent = business.isOpen ? 'Now Open' : 'Now Closed';
    statusEl.className = 'listing-badge ' + (business.isOpen ? 'badge-open' : 'badge-closed');
  }

  // ── Meta row ───────────────────────────────────────────────────
  setText('bizCity',   `📍 ${business.city}, ${business.state}`);
  setText('bizRating', `⭐ ${business.rating} (${business.reviews} reviews)`);
  setText('bizPrice',  `${business.priceRange}`);

  // ── Description ────────────────────────────────────────────────
  setText('bizDesc', business.description);

  // ── Tech tags on header ────────────────────────────────────────
  setHTML('bizTypeTags', business.types.map(t => `<span class="tag">${t}</span>`).join(''));

  // ── Detail sections ────────────────────────────────────────────
  setHTML('bizTech',       business.types.map(t =>      `<span class="tag-pill">${t}</span>`).join(''));
  setHTML('bizMaterials',  business.materials.map(m =>  `<span class="tag-pill">${m}</span>`).join(''));
  setHTML('bizServices',   business.services.map(s =>   `<span class="tag-pill">${s}</span>`).join(''));
  setHTML('bizIndustries', business.industries.map(i => `<span class="tag-pill">${i}</span>`).join(''));

  // ── Contact: Phone ─────────────────────────────────────────────
  const phoneEl = document.getElementById('bizPhone');
  if (phoneEl) {
    const formatted = formatPhone(business.phone);
    if (formatted) {
      phoneEl.innerHTML = `<span class="biz-contact-icon" aria-hidden="true"><i class="fa-solid fa-phone"></i></span><a href="tel:${business.phone}">${formatted}</a>`;
    } else {
      phoneEl.style.display = 'none';
    }
  }

  // ── Contact: Website ───────────────────────────────────────────
  const webEl = document.getElementById('bizWebsite');
  if (webEl) {
    if (business.website) {
      const display = business.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
      webEl.innerHTML = `<span class="biz-contact-icon" aria-hidden="true"><i class="fa-solid fa-globe"></i></span><a href="${business.website}" target="_blank" rel="noopener">${display}</a>`;
    } else {
      webEl.style.display = 'none';
    }
  }

  // ── Contact: Address ───────────────────────────────────────────
  const addrEl = document.getElementById('bizAddress');
  if (addrEl) addrEl.innerHTML = `<span class="biz-contact-icon" aria-hidden="true"><i class="fa-solid fa-location-dot"></i></span><span>${business.address}</span>`;

  // ── Contact: Hours ─────────────────────────────────────────────
  const hoursEl = document.getElementById('bizHours');
  if (hoursEl) renderHoursBlock(hoursEl, business.hours, business.isOpen);

  // ── Social links ───────────────────────────────────────────────
  const socialEl = document.getElementById('bizSocial');
  if (socialEl) {
    const links = [];
    if (business.facebook)  links.push(`<a href="${business.facebook}"  target="_blank" rel="noopener" class="social-btn"><i class="fa-brands fa-facebook" aria-label="Facebook"></i> Facebook</a>`);
    if (business.instagram) links.push(`<a href="${business.instagram}" target="_blank" rel="noopener" class="social-btn"><i class="fa-brands fa-instagram" aria-label="Instagram"></i> Instagram</a>`);
    if (business.twitter)   links.push(`<a href="${business.twitter}"   target="_blank" rel="noopener" class="social-btn"><i class="fa-brands fa-x-twitter" aria-label="X / Twitter"></i> Twitter / X</a>`);
    socialEl.innerHTML = links.length ? links.join('') : '';
    if (!links.length) socialEl.closest('.biz-section').style.display = 'none';
  }

  // ── Website button ─────────────────────────────────────────────
  const wsBtn = document.getElementById('bizWebsiteBtn');
  if (wsBtn) {
    if (business.website) {
      wsBtn.href = business.website;
      wsBtn.setAttribute('target', '_blank');
      wsBtn.setAttribute('rel', 'noopener');
    } else {
      wsBtn.style.display = 'none';
    }
  }
});

// ── Utility helpers ────────────────────────────────────────────
function formatPhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\.0+$/, '').replace(/\D/g, '');
  const local = digits.length === 11 && digits[0] === '1' ? digits.slice(1) : digits;
  if (local.length === 10) {
    return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  }
  return digits.length ? digits : '';
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
function setMeta(attr, name, content) {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
  el.setAttribute('content', content);
}
function injectJsonLd(obj) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(obj);
  document.head.appendChild(script);
}

function renderHoursBlock(container, hoursStr, isOpen) {
  var DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var DAY_MAP = {
    'monday':'Monday','mon':'Monday',
    'tuesday':'Tuesday','tue':'Tuesday','tues':'Tuesday',
    'wednesday':'Wednesday','wed':'Wednesday',
    'thursday':'Thursday','thu':'Thursday','thur':'Thursday','thurs':'Thursday',
    'friday':'Friday','fri':'Friday',
    'saturday':'Saturday','sat':'Saturday',
    'sunday':'Sunday','sun':'Sunday'
  };

  function normDay(s) { return DAY_MAP[s.trim().toLowerCase()] || null; }

  function expandRange(from, to) {
    var a = DAY_ORDER.indexOf(normDay(from));
    var b = DAY_ORDER.indexOf(normDay(to));
    if (a === -1 || b === -1) return null;
    var days = [];
    for (var i = a; i <= b; i++) days.push(DAY_ORDER[i]);
    return days;
  }

  if (!hoursStr) {
    container.innerHTML = '<span class="biz-contact-icon" aria-hidden="true"><i class="fa-solid fa-clock"></i></span><span>Hours not available</span>';
    return;
  }

  var parts = hoursStr.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
  var entries = [];

  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];
    var ci = part.indexOf(':');
    if (ci === -1) continue;
    var dayPart = part.slice(0, ci).trim();
    var timePart = part.slice(ci + 1).trim();
    var rm = dayPart.match(/^(.+?)[\u2013\u2014\-](.+)$/);
    if (rm) {
      var days = expandRange(rm[1].trim(), rm[2].trim());
      if (days) {
        days.forEach(function(d){ entries.push({day: d, time: timePart}); });
        continue;
      }
    }
    var d = normDay(dayPart);
    if (d) entries.push({day: d, time: timePart});
  }

  entries.sort(function(a, b){ return DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day); });

  if (!entries.length) {
    container.innerHTML = '<span class="biz-contact-icon" aria-hidden="true"><i class="fa-solid fa-clock"></i></span><span>' + hoursStr + '</span>';
    return;
  }

  // Group consecutive days with same hours
  var groups = [];
  var cur = {days: [entries[0].day], time: entries[0].time};
  for (var j = 1; j < entries.length; j++) {
    if (entries[j].time.toLowerCase() === cur.time.toLowerCase()) {
      cur.days.push(entries[j].day);
    } else {
      groups.push(cur);
      cur = {days: [entries[j].day], time: entries[j].time};
    }
  }
  groups.push(cur);

  var todayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];

  var rows = groups.map(function(g) {
    var label;
    if (g.days.length === 1) {
      label = g.days[0].slice(0, 3);
    } else {
      var idx = g.days.map(function(d){ return DAY_ORDER.indexOf(d); });
      var consec = idx.every(function(v, k){ return k === 0 || v === idx[k-1] + 1; });
      label = consec
        ? g.days[0].slice(0, 3) + '\u2013' + g.days[g.days.length - 1].slice(0, 3)
        : g.days.map(function(d){ return d.slice(0, 3); }).join(', ');
    }
    var isToday = g.days.indexOf(todayName) !== -1;
    var dot = (isToday && isOpen) ? '<span class="hours-open-dot" aria-label="Open now"></span>' : '';
    return '<tr class="hours-row' + (isToday ? ' hours-today' : '') + '">'
      + '<td class="hours-day">' + label + dot + '</td>'
      + '<td class="hours-time">' + g.time + '</td>'
      + '</tr>';
  }).join('');

  container.className = 'biz-hours-block-wrap';
  container.innerHTML = '<div class="biz-hours-label"><i class="fa-solid fa-clock" aria-hidden="true"></i> Hours of Operation</div>'
    + '<table class="hours-table"><tbody>' + rows + '</tbody></table>';
}
