// ================================================================
// 3DPrintMap - Directory Page JavaScript
// ================================================================

let currentPage = 1;
const PER_PAGE = 12;
let filteredResults = [...BUSINESSES];

document.addEventListener('DOMContentLoaded', function () {

  // Mobile menu
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }

  // Read URL params and pre-fill filters
  const params = new URLSearchParams(window.location.search);

  if (params.get('q')) {
    const el = document.getElementById('dirSearchQuery');
    if (el) el.value = params.get('q');
  }
  if (params.get('city')) {
    const el = document.getElementById('dirSearchCity');
    if (el) el.value = params.get('city');
  }

  // Check boxes from URL
  ['type', 'service', 'material'].forEach(param => {
    const val = params.get(param);
    if (val) {
      const cb = document.querySelector(`input[name="${param}"][value="${val.toLowerCase()}"]`);
      if (cb) cb.checked = true;
    }
  });

  // Listen to all filter changes
  document.querySelectorAll('.filter-option input').forEach(cb => {
    cb.addEventListener('change', () => applyFilters());
  });

  // Listen to search inputs
  ['dirSearchQuery', 'dirSearchCity'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') applyFilters(); });
  });

  applyFilters();
});

function applyFilters() {
  const query = (document.getElementById('dirSearchQuery')?.value || '').toLowerCase().trim();
  const city = (document.getElementById('dirSearchCity')?.value || '').toLowerCase().trim();
  const sortBy = document.getElementById('sortBy')?.value || 'newest';

  const selectedTypes = [...document.querySelectorAll('input[name="type"]:checked')].map(cb => cb.value.toLowerCase());
  const selectedServices = [...document.querySelectorAll('input[name="service"]:checked')].map(cb => cb.value.toLowerCase());
  const selectedMaterials = [...document.querySelectorAll('input[name="material"]:checked')].map(cb => cb.value.toLowerCase());
  const selectedPrices = [...document.querySelectorAll('input[name="price"]:checked')].map(cb => cb.value);
  const openOnly = document.querySelector('input[name="status"][value="open"]')?.checked;

  filteredResults = BUSINESSES.filter(b => {
    // Text search
    if (query) {
      const haystack = [b.name, b.city, b.state, b.description, ...b.types, ...b.services, ...b.materials].join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    // City/state filter
    if (city) {
      const loc = (b.city + ' ' + b.state + ' ' + b.address).toLowerCase();
      if (!loc.includes(city)) return false;
    }
    // Type filter
    if (selectedTypes.length > 0) {
      const bTypes = b.types.map(t => t.toLowerCase());
      if (!selectedTypes.some(t => bTypes.includes(t))) return false;
    }
    // Service filter
    if (selectedServices.length > 0) {
      const bServices = b.services.map(s => s.toLowerCase());
      if (!selectedServices.some(s => bServices.some(bs => bs.includes(s)))) return false;
    }
    // Material filter
    if (selectedMaterials.length > 0) {
      const bMats = b.materials.map(m => m.toLowerCase());
      if (!selectedMaterials.some(m => bMats.some(bm => bm.includes(m)))) return false;
    }
    // Price filter
    if (selectedPrices.length > 0) {
      if (!selectedPrices.includes(b.priceRange)) return false;
    }
    // Open filter
    if (openOnly && !b.isOpen) return false;

    return true;
  });

  // Sort
  switch (sortBy) {
    case 'rating':  filteredResults.sort((a, b) => b.rating - a.rating); break;
    case 'reviews': filteredResults.sort((a, b) => b.reviews - a.reviews); break;
    case 'name':    filteredResults.sort((a, b) => a.name.localeCompare(b.name)); break;
    default: break;
  }

  currentPage = 1;
  renderChips({ query, city, selectedTypes, selectedServices, selectedMaterials, selectedPrices, openOnly });
  renderResults();
}

function renderResults() {
  const container = document.getElementById('dirListings');
  const countEl = document.getElementById('resultsCount');
  const pagination = document.getElementById('pagination');
  if (!container) return;

  const total = filteredResults.length;
  const totalPages = Math.ceil(total / PER_PAGE);
  const start = (currentPage - 1) * PER_PAGE;
  const pageResults = filteredResults.slice(start, start + PER_PAGE);

  if (countEl) countEl.textContent = `${total} service${total !== 1 ? 's' : ''} found`;

  if (pageResults.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No services found</h3>
        <p>No 3D printing services match your current filters. Try broadening your search.</p>
        <ul class="empty-suggestions">
          <li>Remove one or more filters</li>
          <li>Try a different city or state</li>
          <li>Search by technology type instead</li>
        </ul>
        <div class="empty-actions">
          <button class="btn btn-primary" onclick="clearFilters()">Clear All Filters</button>
          <a href="/add-listing.html" class="btn btn-outline">Add Your Business →</a>
        </div>
      </div>`;
  } else {
    container.innerHTML = pageResults.map(b => createListingCard(b)).join('');
  }

  // Pagination
  if (pagination) {
    if (totalPages > 1) {
      let btns = '';
      if (currentPage > 1) btns += `<button class="page-btn" onclick="goToPage(${currentPage - 1})">← Prev</button>`;
      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
          btns += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
          btns += `<span style="color:var(--text-muted);padding:8px 4px">…</span>`;
        }
      }
      if (currentPage < totalPages) btns += `<button class="page-btn" onclick="goToPage(${currentPage + 1})">Next →</button>`;
      pagination.innerHTML = btns;
    } else {
      pagination.innerHTML = '';
    }
  }
}

const TYPE_LABELS    = { fdm:'FDM Printing', sla:'SLA / Resin', sls:'SLS / Nylon', metal:'Metal Printing', multicolor:'Multicolor' };
const SERVICE_LABELS = { prototyping:'Rapid Prototyping', production:'Production Runs', design:'Design Services', finishing:'Post-Processing', assembly:'Assembly' };
const MATERIAL_LABELS= { pla:'PLA', abs:'ABS', petg:'PETG', resin:'Resin', nylon:'Nylon', metal:'Metal', tpu:'TPU / Flexible', carbon:'Carbon Fiber' };
const PRICE_LABELS   = { '$':'$ Budget', '$$':'$$ Mid-range', '$$$':'$$$ Premium' };

function renderChips({ query, city, selectedTypes, selectedServices, selectedMaterials, selectedPrices, openOnly }) {
  const container = document.getElementById('activeChips');
  if (!container) return;
  const chips = [];

  if (query) chips.push({ label: `"${query}"`, action: `document.getElementById('dirSearchQuery').value='';applyFilters();` });
  if (city)  chips.push({ label: city,          action: `document.getElementById('dirSearchCity').value='';applyFilters();` });
  selectedTypes.forEach(v    => chips.push({ label: TYPE_LABELS[v]    || v, action: `removeCheck('type','${v}')` }));
  selectedServices.forEach(v => chips.push({ label: SERVICE_LABELS[v] || v, action: `removeCheck('service','${v}')` }));
  selectedMaterials.forEach(v=> chips.push({ label: MATERIAL_LABELS[v]|| v, action: `removeCheck('material','${v}')` }));
  selectedPrices.forEach(v   => chips.push({ label: PRICE_LABELS[v]   || v, action: `removeCheck('price','${v}')` }));
  if (openOnly) chips.push({ label: 'Open Now', action: `removeCheck('status','open')` });

  container.innerHTML = chips.map(c =>
    `<span class="chip">${c.label}<button class="chip-x" onclick="${c.action}" aria-label="Remove filter">×</button></span>`
  ).join('');
}

function removeCheck(name, value) {
  const cb = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (cb) { cb.checked = false; applyFilters(); }
}

function goToPage(page) {
  currentPage = page;
  renderResults();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearFilters() {
  document.querySelectorAll('.filter-option input').forEach(cb => cb.checked = false);
  const q = document.getElementById('dirSearchQuery');
  const c = document.getElementById('dirSearchCity');
  const s = document.getElementById('sortBy');
  if (q) q.value = '';
  if (c) c.value = '';
  if (s) s.value = 'newest';
  applyFilters();
}
