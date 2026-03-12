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

  // Page title
  document.title = `${business.name} — 3D Printing Service in ${business.city}, ${business.state} | 3DPrintMap`;

  // SEO meta tags (set dynamically so each business page is unique)
  const techList = business.types.join(', ');
  const shortDesc = business.description.length > 140
    ? business.description.slice(0, 140).replace(/\s\S*$/, '') + '…'
    : business.description;
  const metaDesc = `${business.name} in ${business.city}, ${business.state}. ${techList} 3D printing services. ${shortDesc}`;

  setMeta('name', 'description', metaDesc);
  setMeta('property', 'og:title', `${business.name} | 3DPrintMap`);
  setMeta('property', 'og:description', metaDesc);
  setMeta('property', 'og:type', 'business.business');
  if (business.imageUrl) setMeta('property', 'og:image', business.imageUrl);

  // Canonical URL
  const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
  canonical.rel = 'canonical';
  canonical.href = `https://3dprintmap.com/business?id=${business.id}`;
  document.head.appendChild(canonical);

  // Structured data (JSON-LD) — helps Google show rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': business.name,
    'description': business.description,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': business.address,
      'addressLocality': business.city,
      'addressRegion': business.state,
      'addressCountry': 'US'
    },
    'telephone': business.phone,
    'url': business.website || `https://3dprintmap.com/business?id=${business.id}`,
    'aggregateRating': business.reviews > 0 ? {
      '@type': 'AggregateRating',
      'ratingValue': business.rating,
      'reviewCount': business.reviews
    } : undefined,
    'openingHours': business.hours,
    'image': business.imageUrl || undefined
  };
  // Remove undefined keys
  Object.keys(jsonLd).forEach(k => jsonLd[k] === undefined && delete jsonLd[k]);
  if (jsonLd.aggregateRating && !jsonLd.aggregateRating.reviewCount) delete jsonLd.aggregateRating;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(jsonLd);
  document.head.appendChild(script);

  // Breadcrumb
  const bc = document.getElementById('bizBreadcrumbName');
  if (bc) bc.textContent = business.name;

  // Hero — show real image if available, otherwise emoji
  const heroEl = document.getElementById('bizHero');
  if (heroEl && business.imageUrl) {
    heroEl.innerHTML = `<img src="${business.imageUrl}" alt="${business.name}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius);">`;
  } else {
    const emojiEl = document.getElementById('bizEmoji');
    if (emojiEl) emojiEl.textContent = business.emoji;
  }

  // Name
  const nameEl = document.getElementById('bizName');
  if (nameEl) nameEl.textContent = business.name;

  // Status badge
  const statusEl = document.getElementById('bizStatus');
  if (statusEl) {
    statusEl.textContent = business.isOpen ? 'Now Open' : 'Now Closed';
    statusEl.className = 'listing-badge ' + (business.isOpen ? 'badge-open' : 'badge-closed');
  }

  // Meta info
  setText('bizCity', `📍 ${business.city}, ${business.state}`);
  setText('bizRating', `⭐ ${business.rating} (${business.reviews} reviews)`);
  setText('bizPrice', `${business.priceRange}`);

  // Description
  setText('bizDesc', business.description);

  // Type tags on header
  setHTML('bizTypeTags', business.types.map(t => `<span class="tag">${t}</span>`).join(''));

  // Detail sections
  setHTML('bizTech', business.types.map(t => `<span class="tag-pill">${t}</span>`).join(''));
  setHTML('bizMaterials', business.materials.map(m => `<span class="tag-pill">${m}</span>`).join(''));
  setHTML('bizServices', business.services.map(s => `<span class="tag-pill">${s}</span>`).join(''));
  setHTML('bizIndustries', business.industries.map(i => `<span class="tag-pill">${i}</span>`).join(''));

  // Contact info
  const phoneEl = document.getElementById('bizPhone');
  if (phoneEl) phoneEl.innerHTML = `
    <span class="biz-contact-icon">📞</span>
    <a href="tel:${business.phone}">${business.phone || 'Not listed'}</a>`;

  const webEl = document.getElementById('bizWebsite');
  if (webEl && business.website) {
    const display = business.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
    webEl.innerHTML = `<span class="biz-contact-icon">🌐</span><a href="${business.website}" target="_blank" rel="noopener">${display}</a>`;
  }

  const addrEl = document.getElementById('bizAddress');
  if (addrEl) addrEl.innerHTML = `<span class="biz-contact-icon">📍</span><span>${business.address}</span>`;

  const hoursEl = document.getElementById('bizHours');
  if (hoursEl) hoursEl.innerHTML = `<span class="biz-contact-icon">🕐</span><span>${business.hours}</span>`;

  // Social links
  const socialEl = document.getElementById('bizSocial');
  if (socialEl) {
    const links = [];
    if (business.facebook)  links.push(`<a href="${business.facebook}" target="_blank" rel="noopener" class="social-btn">Facebook</a>`);
    if (business.instagram) links.push(`<a href="${business.instagram}" target="_blank" rel="noopener" class="social-btn">Instagram</a>`);
    if (business.twitter)   links.push(`<a href="${business.twitter}" target="_blank" rel="noopener" class="social-btn">Twitter / X</a>`);
    socialEl.innerHTML = links.length ? links.join('') : '';
    if (!links.length) socialEl.closest('.biz-section').style.display = 'none';
  }

  // Website button
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
