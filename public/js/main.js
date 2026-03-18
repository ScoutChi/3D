// ================================================================
// 3DPrintMap - Homepage JavaScript
// ================================================================

document.addEventListener('DOMContentLoaded', function () {

  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }

  // Populate dynamic content
  updateTechCounts();
  renderNewestListings();
  renderCities();
  renderServiceTags();
  renderMaterials();

  // Total count
  const totalEl = document.getElementById('totalCount');
  if (totalEl) totalEl.textContent = BUSINESSES.length.toLocaleString() + '+';

  // Enter key on search inputs
  ['searchQuery', 'searchLocation'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') handleSearch(); });
  });
});

function updateTechCounts() {
  const techMap = {
    'fdm': 'fdm-count',
    'sla': 'sla-count',
    'sls': 'sls-count',
    'metal': 'metal-count',
    'multicolor': 'multi-count'
  };
  for (const [type, id] of Object.entries(techMap)) {
    const count = BUSINESSES.filter(b => b.types.some(t => t.toLowerCase() === type)).length;
    const el = document.getElementById(id);
    if (el) el.textContent = count + ' services';
  }
  const designCount = BUSINESSES.filter(b => b.services.some(s => s.toLowerCase().includes('design'))).length;
  const dEl = document.getElementById('design-count');
  if (dEl) dEl.textContent = designCount + ' services';
}

function renderNewestListings() {
  const container = document.getElementById('newestListings');
  if (!container) return;
  container.innerHTML = BUSINESSES.slice(0, 6).map(b => createListingCard(b)).join('');
}

const CITY_PAGES = {
  'Chicago': 'chicago', 'New York': 'new-york', 'Indianapolis': 'indianapolis',
  'Wichita': 'wichita', 'Boise': 'boise', 'Anchorage': 'anchorage',
  'Sioux Falls': 'sioux-falls', 'New Orleans': 'new-orleans', 'Kansas City': 'kansas-city',
  'Honolulu': 'honolulu', 'Boston': 'boston', 'Milwaukee': 'milwaukee',
  'Seattle': 'seattle', 'Los Angeles': 'los-angeles', 'Virginia Beach': 'virginia-beach',
  'Salt Lake City': 'salt-lake-city', 'Baltimore': 'baltimore',
  'Albuquerque': 'albuquerque', 'Portland': 'portland'
};

function renderCities() {
  const container = document.getElementById('cityGrid');
  if (!container) return;
  const citiesWithCounts = CITIES.map(city => ({
    ...city,
    count: getBusinessesByCity(city.name).length
  })).filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 18);
  container.innerHTML = citiesWithCounts.map(city => {
    const countText = city.count + ' service' + (city.count !== 1 ? 's' : '');
    const slug = CITY_PAGES[city.name];
    const href = slug ? `/3d-printing-${slug}.html` : `directory.html?city=${encodeURIComponent(city.name)}`;
    return `
      <a href="${href}" class="city-card">
        <div class="city-name">${city.name}, ${city.state} <span class="city-count">(${countText})</span></div>
      </a>
    `;
  }).join('');
}

function renderServiceTags() {
  const container = document.getElementById('serviceTags');
  if (!container) return;
  container.innerHTML = SERVICES.map(s => `
    <a href="directory.html?service=${encodeURIComponent(s.name)}" class="service-tag">
      ${s.name}
      <span class="count">${s.count}</span>
    </a>
  `).join('');
}

function renderMaterials() {
  const container = document.getElementById('materialGrid');
  if (!container) return;
  const MATERIAL_LIST = [
    { name: 'PLA',           desc: 'The most popular filament — easy to print, great detail, wide color range.' },
    { name: 'PETG',          desc: 'Stronger and more flexible than PLA. Great for functional parts.' },
    { name: 'ABS',           desc: 'Heat-resistant and tough. Widely used for enclosures and automotive parts.' },
    { name: 'TPU / Flexible',desc: 'Rubber-like flexibility. Perfect for gaskets, grips, and wearable parts.' },
    { name: 'Nylon',         desc: 'High strength and wear resistance. Ideal for engineering and SLS printing.' },
    { name: 'Carbon Fiber',  desc: 'Lightweight and stiff. Used in aerospace, automotive, and performance parts.' },
  ];
  container.innerHTML = MATERIAL_LIST.map(m => {
    const count = BUSINESSES.filter(b => b.materials && b.materials.some(mat => mat.toLowerCase().includes(m.name.toLowerCase().split(' ')[0]))).length;
    if (count > 0) {
      return `<a href="directory.html?q=${encodeURIComponent(m.name.split(' ')[0])}" class="material-card">
        <h3>${m.name} <span style="font-size:12px;font-weight:600;color:var(--slate);margin-left:6px;">${count}</span></h3>
        <p>${m.desc}</p>
      </a>`;
    }
    return `<div class="material-card" style="opacity:.55;cursor:default;">
      <h3>${m.name} <span style="font-size:11px;font-weight:500;color:var(--slate);margin-left:6px;">Coming soon</span></h3>
      <p>${m.desc}</p>
    </div>`;
  }).join('');
}

function handleSearch() {
  const query = document.getElementById('searchQuery')?.value || '';
  const location = document.getElementById('searchLocation')?.value || '';
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (location) params.set('city', location);
  window.location.href = 'directory.html?' + params.toString();
}
