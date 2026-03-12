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

function renderCities() {
  const container = document.getElementById('cityGrid');
  if (!container) return;
  container.innerHTML = CITIES.map(city => {
    const count = getBusinessesByCity(city.name).length;
    return `
      <a href="directory.html?city=${encodeURIComponent(city.name)}" class="city-card">
        <div class="city-name">${city.name}, ${city.state}</div>
        <div class="city-count">${count > 0 ? count + ' service' + (count !== 1 ? 's' : '') : 'Coming soon'}</div>
        <span class="city-link">Find 3D Printers →</span>
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
