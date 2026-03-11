// ================================================================
// 3DPrintMap - Business Data
// Replace this sample data by running: node convert-csv.js your-file.csv
// ================================================================

const BUSINESSES = [
  {
    id: 1,
    name: "Precision Print Works",
    city: "Austin", state: "TX",
    address: "1234 Innovation Blvd, Austin, TX 78701",
    phone: "(512) 555-0101",
    website: "https://example.com",
    rating: 4.8, reviews: 142,
    types: ["FDM", "SLA", "SLS"],
    materials: ["PLA", "ABS", "PETG", "Resin", "Nylon"],
    services: ["Prototyping", "Production Runs", "Design Services"],
    industries: ["Aerospace", "Medical", "Consumer Products"],
    priceRange: "$$",
    description: "Full-service 3D printing studio specializing in rapid prototyping and low-volume production. Serving Austin's tech startup community since 2018.",
    hours: "Mon–Fri: 8am–6pm, Sat: 9am–3pm",
    isOpen: true, isNew: true, emoji: "🖨️"
  },
  {
    id: 2,
    name: "Maker Forge Houston",
    city: "Houston", state: "TX",
    address: "5678 Energy Corridor, Houston, TX 77079",
    phone: "(713) 555-0202",
    website: "https://example.com",
    rating: 4.6, reviews: 89,
    types: ["FDM", "Metal"],
    materials: ["PLA", "ABS", "Stainless Steel", "Titanium"],
    services: ["Prototyping", "Production Runs", "Post-Processing"],
    industries: ["Oil & Gas", "Industrial", "Automotive"],
    priceRange: "$$$",
    description: "Industrial-grade 3D printing for the energy sector. Specializing in metal sintering and high-temperature engineering materials.",
    hours: "Mon–Fri: 7am–7pm",
    isOpen: true, isNew: true, emoji: "⚙️"
  },
  {
    id: 3,
    name: "LayerUp Chicago",
    city: "Chicago", state: "IL",
    address: "333 W Wacker Dr, Chicago, IL 60606",
    phone: "(312) 555-0303",
    website: "https://example.com",
    rating: 4.9, reviews: 215,
    types: ["SLA", "FDM", "Multicolor"],
    materials: ["Resin", "PLA", "PETG", "TPU"],
    services: ["Prototyping", "Design Services", "Finishing", "Assembly"],
    industries: ["Architecture", "Consumer Products", "Art & Design"],
    priceRange: "$$",
    description: "Chicago's premier design-forward 3D printing service. Specializing in architectural models, product design, and art installations.",
    hours: "Mon–Fri: 9am–7pm, Sat–Sun: 10am–4pm",
    isOpen: false, isNew: true, emoji: "🏗️"
  },
  {
    id: 4,
    name: "ResinLab NYC",
    city: "New York", state: "NY",
    address: "147 W 26th St, New York, NY 10001",
    phone: "(212) 555-0404",
    website: "https://example.com",
    rating: 4.7, reviews: 334,
    types: ["SLA", "SLS"],
    materials: ["Resin", "Nylon", "PETG"],
    services: ["Prototyping", "Design Services", "Finishing"],
    industries: ["Jewelry", "Fashion", "Medical", "Dental"],
    priceRange: "$$",
    description: "NYC's specialized SLA and jewelry printing studio. Ultra-high resolution prints for dental, medical, and fine jewelry applications.",
    hours: "Mon–Fri: 8am–8pm, Sat: 10am–6pm",
    isOpen: true, isNew: false, emoji: "💎"
  },
  {
    id: 5,
    name: "Print3D LA",
    city: "Los Angeles", state: "CA",
    address: "8901 Sunset Blvd, Los Angeles, CA 90028",
    phone: "(310) 555-0505",
    website: "https://example.com",
    rating: 4.5, reviews: 178,
    types: ["FDM", "SLA", "Multicolor"],
    materials: ["PLA", "ABS", "Resin", "Carbon Fiber", "TPU"],
    services: ["Prototyping", "Design Services", "Post-Processing"],
    industries: ["Entertainment", "Automotive", "Consumer Products"],
    priceRange: "$$",
    description: "Serving LA's entertainment industry and automotive sector with rapid prototyping and custom prop manufacturing.",
    hours: "Mon–Sat: 9am–7pm",
    isOpen: true, isNew: false, emoji: "🎬"
  },
  {
    id: 6,
    name: "NorthWest3D Seattle",
    city: "Seattle", state: "WA",
    address: "2100 5th Ave, Seattle, WA 98121",
    phone: "(206) 555-0606",
    website: "https://example.com",
    rating: 4.8, reviews: 124,
    types: ["FDM", "SLS", "Metal"],
    materials: ["PLA", "PETG", "Nylon", "Aluminum", "Stainless Steel"],
    services: ["Prototyping", "Production Runs", "Design Services", "Post-Processing"],
    industries: ["Aerospace", "Tech", "Medical"],
    priceRange: "$$$",
    description: "Engineering-grade 3D printing services for Seattle's aerospace and tech companies. ISO 9001 certified facility.",
    hours: "Mon–Fri: 7am–6pm",
    isOpen: true, isNew: false, emoji: "✈️"
  },
  {
    id: 7,
    name: "Desert Print Co.",
    city: "Phoenix", state: "AZ",
    address: "4400 N Scottsdale Rd, Phoenix, AZ 85251",
    phone: "(480) 555-0707",
    website: "https://example.com",
    rating: 4.4, reviews: 67,
    types: ["FDM", "SLA"],
    materials: ["PLA", "ABS", "PETG", "Resin"],
    services: ["Prototyping", "Design Services"],
    industries: ["Construction", "Consumer Products", "Education"],
    priceRange: "$",
    description: "Affordable 3D printing for small businesses and individuals in the Phoenix metro area. Fast turnaround, friendly service.",
    hours: "Mon–Fri: 9am–5pm, Sat: 10am–2pm",
    isOpen: true, isNew: true, emoji: "🌵"
  },
  {
    id: 8,
    name: "Bay Area FabLab",
    city: "San Francisco", state: "CA",
    address: "888 Brannan St, San Francisco, CA 94103",
    phone: "(415) 555-0808",
    website: "https://example.com",
    rating: 4.9, reviews: 412,
    types: ["FDM", "SLA", "SLS", "Metal", "Multicolor"],
    materials: ["PLA", "ABS", "Resin", "Nylon", "Titanium", "Carbon Fiber"],
    services: ["Prototyping", "Production Runs", "Design Services", "Assembly", "Finishing"],
    industries: ["Tech", "Medical", "Aerospace", "Consumer Products"],
    priceRange: "$$$",
    description: "Full-spectrum additive manufacturing for Silicon Valley's most innovative companies. Every technology under one roof.",
    hours: "Mon–Fri: 7am–9pm, Sat–Sun: 9am–5pm",
    isOpen: true, isNew: false, emoji: "🔬"
  },
  {
    id: 9,
    name: "Mile High Makers",
    city: "Denver", state: "CO",
    address: "1600 Glenarm Pl, Denver, CO 80202",
    phone: "(720) 555-0909",
    website: "https://example.com",
    rating: 4.6, reviews: 93,
    types: ["FDM", "SLA"],
    materials: ["PLA", "ABS", "PETG", "TPU", "Resin"],
    services: ["Prototyping", "Design Services", "Assembly"],
    industries: ["Outdoor/Sports", "Consumer Products", "Education"],
    priceRange: "$$",
    description: "Denver's go-to maker space and 3D printing service. Specializing in outdoor gear prototypes and custom consumer products.",
    hours: "Mon–Fri: 8am–7pm, Sat: 9am–4pm",
    isOpen: true, isNew: true, emoji: "⛰️"
  },
  {
    id: 10,
    name: "Capitol Print DC",
    city: "Washington", state: "DC",
    address: "700 K St NW, Washington, DC 20001",
    phone: "(202) 555-1010",
    website: "https://example.com",
    rating: 4.7, reviews: 156,
    types: ["FDM", "SLS", "SLA"],
    materials: ["PLA", "Nylon", "Resin", "PETG"],
    services: ["Prototyping", "Production Runs", "Design Services"],
    industries: ["Government", "Defense", "Medical", "Education"],
    priceRange: "$$",
    description: "Serving government agencies, defense contractors, and research institutions in the DC metro area with certified 3D printing services.",
    hours: "Mon–Fri: 8am–6pm",
    isOpen: false, isNew: false, emoji: "🏛️"
  },
  {
    id: 11,
    name: "Lone Star 3D",
    city: "Dallas", state: "TX",
    address: "2222 Commerce St, Dallas, TX 75201",
    phone: "(214) 555-1111",
    website: "https://example.com",
    rating: 4.5, reviews: 108,
    types: ["FDM", "SLA", "Metal"],
    materials: ["PLA", "ABS", "Resin", "Stainless Steel"],
    services: ["Prototyping", "Production Runs", "Post-Processing"],
    industries: ["Oil & Gas", "Automotive", "Consumer Products"],
    priceRange: "$$",
    description: "Texas-sized 3D printing capacity for industrial and consumer applications. Large-format FDM and precision SLA available.",
    hours: "Mon–Fri: 7am–7pm, Sat: 8am–4pm",
    isOpen: true, isNew: false, emoji: "⭐"
  },
  {
    id: 12,
    name: "Sunshine State Print",
    city: "Miami", state: "FL",
    address: "801 Brickell Ave, Miami, FL 33131",
    phone: "(305) 555-1212",
    website: "https://example.com",
    rating: 4.3, reviews: 74,
    types: ["FDM", "SLA", "Multicolor"],
    materials: ["PLA", "PETG", "Resin", "TPU"],
    services: ["Prototyping", "Design Services", "Finishing"],
    industries: ["Architecture", "Fashion", "Consumer Products", "Marine"],
    priceRange: "$$",
    description: "Miami's creative 3D printing studio for architecture, fashion, and marine industry applications. Spanish and English speaking staff.",
    hours: "Mon–Fri: 9am–6pm, Sat: 10am–3pm",
    isOpen: true, isNew: true, emoji: "🌴"
  }
];

// ================================================================
// Cities derived from data
// ================================================================
const CITIES = [
  { name: "Austin", state: "TX" },
  { name: "Chicago", state: "IL" },
  { name: "Dallas", state: "TX" },
  { name: "Denver", state: "CO" },
  { name: "Houston", state: "TX" },
  { name: "Los Angeles", state: "CA" },
  { name: "Miami", state: "FL" },
  { name: "New York", state: "NY" },
  { name: "Phoenix", state: "AZ" },
  { name: "San Francisco", state: "CA" },
  { name: "Seattle", state: "WA" },
  { name: "Washington", state: "DC" }
];

// ================================================================
// Service categories with counts
// ================================================================
const SERVICES = [
  { name: "Rapid Prototyping", count: 842 },
  { name: "Production Runs", count: 456 },
  { name: "Design & CAD Services", count: 312 },
  { name: "Post-Processing & Finishing", count: 287 },
  { name: "Assembly", count: 198 },
  { name: "Reverse Engineering", count: 145 },
  { name: "Medical / Dental", count: 134 },
  { name: "Aerospace Parts", count: 89 },
  { name: "Jewelry & Casting", count: 76 },
  { name: "Architectural Models", count: 65 }
];

// ================================================================
// Helper functions
// ================================================================
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
  const tags = business.types.slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('');
  const statusClass = business.isOpen ? 'badge-open' : 'badge-closed';
  const statusText = business.isOpen ? 'Now Open' : 'Now Closed';

  return `
    <div class="listing-card" onclick="window.location='business.html?id=${business.id}'">
      <div class="listing-img">
        <span>${business.emoji}</span>
        <span class="listing-badge ${statusClass}">${statusText}</span>
      </div>
      <div class="listing-body">
        <div class="listing-name">${business.name}</div>
        <div class="listing-location">📍 ${business.city}, ${business.state}</div>
        <div class="listing-rating">
          <span class="stars">${stars}</span>
          <span class="rating-text">${business.rating} (${business.reviews} reviews)</span>
        </div>
        <div class="listing-tags">${tags}</div>
        <div class="listing-footer">
          <span class="price-range">Price: ${business.priceRange}</span>
          <span class="listing-cta">View Details →</span>
        </div>
      </div>
    </div>
  `;
}
