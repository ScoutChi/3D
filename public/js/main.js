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
  'Honolulu': 'honolulu', 'Boston': 'boston', 'Milwaukee': 'milwaukee'
};

function renderCities() {
  const container = document.getElementById('cityGrid');
  if (!container) return;
  container.innerHTML = CITIES.map(city => {
    const count = getBusinessesByCity(city.name).length;
    const countText = count > 0 ? count + ' service' + (count !== 1 ? 's' : '') : 'Coming soon';
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

function handleSearch() {
  const query = document.getElementById('searchQuery')?.value || '';
  const location = document.getElementById('searchLocation')?.value || '';
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (location) params.set('city', location);
  window.location.href = 'directory.html?' + params.toString();
}
