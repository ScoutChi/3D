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
    // City/state/zip filter
    if (city) {
      const loc = (b.city + ' ' + b.state + ' ' + b.address + ' ' + (b.zip || '')).toLowerCase();
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
    const activeTypes     = [...document.querySelectorAll('input[name="type"]:checked')].map(cb => cb.value.toLowerCase());
    const activeServices  = [...document.querySelectorAll('input[name="service"]:checked')].map(cb => cb.value.toLowerCase());
    const activeMaterials = [...document.querySelectorAll('input[name="material"]:checked')].map(cb => cb.value.toLowerCase());

    const GUIDES = {
      // ── Types ──────────────────────────────────────────────────────
      fdm: {
        title: 'About FDM (Fused Deposition Modeling) Printing',
        body: `FDM is the most widely available form of 3D printing. A heated nozzle extrudes thermoplastic filament layer by layer to build parts from the bottom up. It is the go-to choice for functional prototypes, enclosures, brackets, and everyday objects because it balances cost, speed, and material variety better than any other process.\n\nCommon FDM materials include PLA (easy, biodegradable), PETG (tough, food-safe), ABS (heat-resistant), TPU (flexible), and Nylon (strong, wear-resistant). Layer heights typically range from 0.1 mm to 0.3 mm, giving a visible stepped texture that can be sanded or painted for a smooth finish.\n\nFDM is ideal when you need large parts fast, when budget matters, or when you need a functional test piece before committing to injection molding. Most local print shops and makerspaces offer FDM services. If no shops appear for your current city filter, try removing the location and browsing all available FDM providers on the map.`
      },
      sla: {
        title: 'About SLA / Resin 3D Printing',
        body: `SLA (Stereolithography) and its cousin MSLA use UV light to cure liquid photopolymer resin into extremely detailed solid parts. Unlike FDM, there is no visible layer stepping at standard resolutions, making resin ideal for jewelry, dental models, miniatures, hearing aids, and any application where surface finish and dimensional accuracy are critical.\n\nResin prints require post-processing: parts must be washed in isopropyl alcohol and cured under UV light before use. The finished material is hard and brittle compared to FDM plastics, so it is better suited for display models and precision components than for structural parts under repeated stress.\n\nPricing for SLA services varies widely — professional dental-grade or industrial SLA machines produce much tighter tolerances than consumer desktop printers. If no local SLA shops appear for your search, try removing the city filter or searching by state. Many resin print shops also accept mail-in orders and ship finished parts within days.`
      },
      sls: {
        title: 'About SLS / Nylon 3D Printing',
        body: `SLS (Selective Laser Sintering) uses a high-powered laser to fuse powdered nylon (polyamide) into solid parts without support structures. Because unsintered powder supports the part during printing, SLS can produce complex internal channels, interlocking assemblies, and organic lattice shapes that are impossible or extremely difficult with FDM or SLA.\n\nThe resulting parts are strong, slightly porous, and have a matte sand-like texture. They are widely used in aerospace, automotive, medical devices, consumer products, and functional end-use parts that need to withstand real-world loading. Nylon PA12 is the standard material; glass-filled and carbon-fiber-filled variants are available for even higher stiffness.\n\nSLS is an industrial process — machines cost six figures — so services are typically offered by professional print bureaus rather than small hobbyist shops. Lead times range from 1–5 business days depending on batch size. If no providers appear for your filters, try broadening your search to include neighboring states or consider online SLS services that ship nationwide.`
      },
      metal: {
        title: 'About Metal 3D Printing',
        body: `Metal 3D printing encompasses several technologies — DMLS (Direct Metal Laser Sintering), SLM (Selective Laser Melting), and binder jetting — all of which produce fully dense metal parts with mechanical properties comparable to machined stock. Common metals include stainless steel, titanium, aluminum, Inconel, and tool steel.\n\nApplications span aerospace turbine components, medical implants, high-performance automotive parts, industrial tooling, and custom jewelry. The process excels where conventional machining is too expensive or geometrically impossible — internal cooling channels, topology-optimized brackets, and patient-specific surgical guides are classic examples.\n\nMetal 3D printing is expensive. A single part can cost hundreds to thousands of dollars depending on material, size, and finish requirements. Most providers are industrial bureaus or university research centers rather than local print shops. If no metal printing services appear in your area, try searching without a city filter to see all US-based metal print providers, or consider online metal printing services that offer DFM feedback and ship finished parts directly to you.`
      },
      multicolor: {
        title: 'About Multicolor / Multi-Material 3D Printing',
        body: `Multicolor 3D printing uses machines like the Bambu Lab AMS system or Prusa MMU to swap between multiple filament colors or materials during a single print. This allows logos, text, and decorative patterns to be printed directly into a part without painting or post-processing.\n\nBeyond aesthetics, multi-material printing enables functional combinations: a rigid shell with a flexible TPU grip, soluble support material that dissolves in water, or color-coded parts for easy assembly. Bambu Lab printers have made this technology far more accessible in recent years, and many local print shops now offer it as a standard service.\n\nIf no multicolor services appear in your search, try removing the city filter or searching more broadly by state. Alternatively, search for standard FDM providers and ask whether they have multi-filament capability — many shops that do not specifically advertise multicolor printing still have the hardware available on request.`
      },
      // ── Materials ──────────────────────────────────────────────────
      pla: {
        title: 'About PLA (Polylactic Acid) 3D Printing',
        body: `PLA is the most popular 3D printing filament in the world. Made from renewable plant starch, it is easy to print, produces minimal warping, and is available in hundreds of colors and specialty blends (silk, marble, wood-fill, and more). PLA is the default material at most FDM print shops and is the best starting point for prototypes, display models, signage, and consumer products that do not need to withstand high heat.\n\nThe main limitation of PLA is its low heat deflection temperature — around 60°C — meaning it can warp or soften in a hot car, near a window, or in any application above room temperature. For heat-resistant applications, PETG, ABS, or ASA are better choices.\n\nPLA is fully biodegradable under industrial composting conditions, making it an environmentally friendlier choice than petroleum-based plastics. If no PLA printing services appear for your city search, try removing the location filter to browse all US-based providers, or search for any FDM shop — virtually all of them print PLA.`
      },
      abs: {
        title: 'About ABS (Acrylonitrile Butadiene Styrene) 3D Printing',
        body: `ABS was one of the first materials used in desktop FDM printing and remains a workhorse for functional parts. It is stronger and more heat-resistant than PLA (heat deflection around 100°C), impact-resistant, and easy to sand, drill, and acetone-vapor smooth for a professional finish.\n\nABS is commonly used for automotive interior components, electronic enclosures, power-tool housings, and parts that will be painted or post-processed. Its main downside is that it requires an enclosed, heated print chamber to prevent warping and cracking during printing, which limits it to professional-grade printers rather than budget desktop machines.\n\nABS fumes during printing and requires good ventilation or air filtration. Professional print shops with enclosed machines and filtration systems are the best source for high-quality ABS prints. If no ABS services appear for your search, try clearing the city filter or searching by FDM type — many shops list ABS capability under their material offerings even if it is not broken out as a separate filter tag.`
      },
      petg: {
        title: 'About PETG 3D Printing',
        body: `PETG (Polyethylene Terephthalate Glycol) sits between PLA and ABS in the material hierarchy — easier to print than ABS, tougher than PLA, and more chemically resistant than both. It is semi-transparent, food-safe when printed correctly, and has a heat deflection around 80°C, making it excellent for water bottles, food containers, protective guards, and outdoor applications.\n\nPETG bonds strongly to glass and PEI print surfaces and produces parts with good layer adhesion and minimal warping. It is slightly more flexible than PLA, which makes it less prone to brittle fracture under impact. The tradeoff is that PETG strings more during printing and requires careful cooling settings to get clean overhangs.\n\nMost professional FDM shops stock PETG as a standard material alongside PLA. If no PETG-specific services appear in your current search, try searching by FDM type and contact providers directly to ask about PETG availability — it is one of the most commonly stocked materials in the industry.`
      },
      resin: {
        title: 'About Resin (SLA / MSLA) 3D Printing',
        body: `Resin 3D printing uses photopolymer liquid cured by UV light to produce parts with exceptional surface smoothness and fine detail. Layer lines are far smaller than FDM — typically 0.025–0.05 mm — resulting in parts that need little to no sanding before painting or display. This makes resin the preferred choice for miniatures, jewelry masters, dental models, cosplay props, and collectibles.\n\nThere are several resin subtypes: standard resin (brittle, detailed), tough resin (impact-resistant), flexible resin, and engineering resins with specific mechanical properties. Dental and medical-grade resins are also available from specialized bureaus.\n\nResin prints require post-processing: washing in IPA and UV curing are mandatory steps. Uncured resin is toxic and requires careful handling. Professional resin printing services handle all of this on your behalf and ship finished, cured parts ready to use. If no resin services appear for your location, try clearing the city filter — resin shops are less common than FDM shops, so broadening your search geographically is the best way to find providers.`
      },
      nylon: {
        title: 'About Nylon 3D Printing',
        body: `Nylon is one of the strongest and most versatile 3D printing materials available. It combines high tensile strength, excellent fatigue resistance, low friction, and good chemical resistance in a single material — properties that make it indispensable for gears, hinges, snap-fit clips, living hinges, ducts, and functional end-use parts.\n\nNylon can be printed via FDM (requires a high-temperature hot end and enclosed chamber) or SLS (industrial powder-bed fusion). SLS nylon produces parts with isotropic strength in all directions, while FDM nylon is strong along the print axis but weaker between layers. Nylon PA12 is the most common SLS variant; PA11 offers better flexibility and impact resistance.\n\nBecause nylon is hygroscopic (it absorbs moisture from the air), filament must be dried before printing and finished parts stored properly to maintain mechanical properties. If no nylon printing services appear for your search, try selecting the SLS technology filter or removing the city restriction — industrial SLS bureaus that print nylon are less geographically dense than consumer FDM shops.`
      },
      tpu: {
        title: 'About TPU / Flexible 3D Printing',
        body: `TPU (Thermoplastic Polyurethane) is the most popular flexible filament in FDM printing. It behaves like rubber — it can be stretched, compressed, and bent repeatedly without cracking — while still being printable on standard desktop printers with a direct-drive extruder. Shore hardness typically ranges from 85A (very soft) to 98A (semi-rigid).\n\nTPU is used for phone cases, wearable devices, gaskets, vibration dampeners, shoe soles, medical grips, and any part that needs to absorb shock or conform to irregular surfaces. It is also highly abrasion-resistant, making it suitable for parts that rub against other surfaces under load.\n\nPrinting TPU requires slower speeds and a direct-drive extruder — Bowden setups struggle with the flexible filament. Many professional FDM shops offer TPU as a specialty material. If no TPU services appear for your search, try clearing the material filter and searching by FDM type, then contact providers directly to ask about flexible filament options.`
      },
      carbon: {
        title: 'About Carbon Fiber 3D Printing',
        body: `Carbon fiber 3D printing comes in two main forms: chopped carbon fiber composites (short CF strands mixed into PLA, PETG, or Nylon filament) and continuous carbon fiber (long fibers laid into a nylon matrix by machines like the Markforged Mark Two). Both approaches dramatically increase stiffness and strength-to-weight ratio compared to unfilled plastics.\n\nChopped CF composites are widely available and can be printed on hardened-nozzle FDM machines. They are stiffer and lighter than standard filaments but still isotropic — strength is similar in all directions. Continuous fiber composites produce parts that rival aluminum in specific stiffness, making them valuable for drone frames, robotic arms, tooling fixtures, and performance automotive components.\n\nCarbon fiber printing requires abrasion-resistant nozzles (brass wears out quickly) and specialized printers for the continuous fiber variant. Providers offering carbon fiber are typically professional engineering bureaus. If no carbon fiber services appear for your location, try removing the city filter to search nationally — continuous fiber printing is a specialized capability with fewer providers than standard FDM.`
      },
      // ── Services ───────────────────────────────────────────────────
      prototyping: {
        title: 'About Rapid Prototyping Services',
        body: `Rapid prototyping is the practice of producing a physical part from a digital design in hours or days rather than weeks. 3D printing is the dominant rapid prototyping technology because it requires no tooling, no minimum order quantities, and can produce complex geometry directly from a CAD file.\n\nPrototype iterations help engineers and designers validate form, fit, and function before committing to expensive injection molds or machined tooling. A single design iteration that catches a flaw can save tens of thousands of dollars in tooling costs. Most professional 3D print services offer same-day or next-day turnaround for standard prototyping requests.\n\nThe best material for a prototype depends on what it needs to demonstrate: PLA for form and visual check, PETG or ABS for functional fit, SLA resin for fine detail, or Nylon SLS for mechanical testing. If no rapid prototyping services appear in your search results, try clearing the city filter — many prototyping bureaus serve clients nationally through mail-in services and ship finished parts within 1–3 business days.`
      },
      production: {
        title: 'About Production Run 3D Printing',
        body: `Production-run 3D printing — sometimes called additive manufacturing at scale — uses 3D printers to manufacture end-use parts in batches rather than just prototypes. This model makes economic sense when geometry is too complex for injection molding, when order quantities are too low to justify tooling, or when supply chain speed is more important than per-part cost.\n\nIndustries that routinely use production 3D printing include aerospace (brackets, ducts), medical devices (custom implants, prosthetics), consumer electronics (antenna housings), and footwear (lattice midsoles). SLS nylon, metal DMLS, and MultiJet Fusion are the most common processes for production runs because they produce consistent, isotropic parts at scale.\n\nPricing for production runs typically benefits from volume discounts and batch optimization — a professional bureau will nest many parts into a single build to reduce per-unit cost. If no production run services appear for your search, try removing location filters or the service filter and contact FDM or SLS providers directly to ask about batch pricing.`
      },
      design: {
        title: 'About 3D Design Services',
        body: `Not every project starts with a finished CAD file. Many 3D print shops and bureaus offer design services alongside printing — taking a sketch, photograph, or verbal description and converting it into a printable 3D model. This is invaluable for customers who know what they want but cannot use CAD software.\n\nDesign services range from simple part modeling (brackets, housings, enclosures) to complex organic forms (character models, architectural details, custom prosthetics). Some shops specialize in reverse engineering — 3D scanning an existing physical part and creating a clean digital model for modification or reproduction.\n\nWhen evaluating design services, ask about file format deliverables (STEP, STL, OBJ), number of revision rounds included, and ownership of the finished CAD file. Most shops charge an hourly rate for design work and a separate fee for printing. If no design service providers appear in your search, try clearing the location filter to browse all US-based shops that advertise design services.`
      },
      finishing: {
        title: 'About Post-Processing & Finishing Services',
        body: `Raw 3D printed parts often show layer lines, support marks, and rough surfaces that need refinement before they look or perform their best. Post-processing and finishing services transform prints into professional-grade parts through a combination of techniques tailored to the material and end use.\n\nCommon finishing options include sanding (manual or vibratory), priming and painting, acetone vapor smoothing (for ABS), resin coating for a glossy surface, media blasting for uniform matte texture, and electroplating for metallic finishes. SLS nylon parts are often dyed black or tumble-polished. Metal parts may be heat-treated, CNC machined to tight tolerances, or anodized.\n\nFinishing adds time and cost but dramatically changes the perceived quality of a printed part. If you need production-quality parts for a client presentation, trade show, or retail product, always ask about finishing options when requesting quotes. If no finishing-focused providers appear in your current search, try removing filters and contacting FDM or SLS shops directly — many offer finishing as an add-on service even if not listed as a primary filter tag.`
      },
      assembly: {
        title: 'About 3D Print Assembly Services',
        body: `Complex 3D printed products often consist of multiple individual parts that must be joined, bonded, or fastened together. Assembly services handle this step on your behalf, delivering a complete, ready-to-use product rather than a bag of loose components.\n\nAssembly techniques vary by material and application: solvent bonding for ABS, UV-cure adhesive for resin, threaded inserts heat-set into plastic for FDM parts, or snap-fit and press-fit joints designed directly into the geometry. Some bureaus also offer light electromechanical assembly — mounting PCBs, wiring harnesses, or off-the-shelf fasteners into printed housings.\n\nAssembly services are particularly valuable for production runs where a customer needs a finished, packaged product rather than raw prints. If no assembly service providers appear for your current search, try clearing the location or service filters and contacting larger print bureaus directly — assembly is typically offered as a value-added service alongside printing and finishing rather than as a standalone offering.`
      }
    };

    // Pick the most relevant guide based on active filters (first match wins)
    let guide = null;
    for (const key of [...activeTypes, ...activeMaterials, ...activeServices]) {
      if (GUIDES[key]) { guide = GUIDES[key]; break; }
    }

    const guideHtml = guide ? `
      <div class="empty-guide">
        <h3 class="empty-guide-title">${guide.title}</h3>
        ${guide.body.split('\n\n').map(p => `<p>${p}</p>`).join('')}
      </div>` : '';

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
      </div>
      ${guideHtml}`;
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

// ── Premium listing card ──────────────────────────────────────────
function createListingCard(b) {
  const TYPE_MAP = { fdm: 'FDM', sla: 'SLA', sls: 'SLS', metal: 'Metal', multicolor: 'Multicolor' };

  const typePills = (b.types || []).slice(0, 3).map(t => {
    const label = TYPE_MAP[t.toLowerCase()] || t;
    return `<span class="listing-type-pill">${label}</span>`;
  }).join('');

  const openBadge = b.isOpen
    ? `<span class="badge-open">● Open Now</span>`
    : '';

  const locIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

  const arrowIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;

  let ratingRow = '';
  if (b.rating && b.rating >= 1) {
    const rounded = Math.round(b.rating);
    const stars = '★'.repeat(Math.min(5, rounded)) + '☆'.repeat(Math.max(0, 5 - rounded));
    ratingRow = `<div class="listing-rating-row">
      <span class="listing-stars">${stars}</span>
      <span>${b.rating.toFixed(1)} · ${b.reviews} review${b.reviews !== 1 ? 's' : ''}</span>
    </div>`;
  }

  const priceLabel = b.priceRange
    ? `<span class="listing-price">${b.priceRange}</span>`
    : '';

  return `<article class="listing-card">
    <div class="listing-card-top">
      <h3><a href="/listing/${b.id}.html">${b.name}</a></h3>
      ${openBadge}
    </div>
    <div class="listing-loc">${locIcon} ${b.city}, ${b.state}</div>
    ${typePills ? `<div class="listing-types">${typePills}</div>` : ''}
    ${ratingRow}
    <div class="listing-card-footer">
      <a href="/listing/${b.id}.html" class="listing-cta">View Details ${arrowIcon}</a>
      ${priceLabel}
    </div>
  </article>`;
}
