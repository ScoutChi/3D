(function () {
  'use strict';

  // ── State abbreviation lookup ────────────────────────────────────
  var STATE_ABBR = {
    'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA',
    'Colorado':'CO','Connecticut':'CT','Delaware':'DE','Florida':'FL','Georgia':'GA',
    'Hawaii':'HI','Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA',
    'Kansas':'KS','Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD',
    'Massachusetts':'MA','Michigan':'MI','Minnesota':'MN','Mississippi':'MS',
    'Missouri':'MO','Montana':'MT','Nebraska':'NE','Nevada':'NV','New Hampshire':'NH',
    'New Jersey':'NJ','New Mexico':'NM','New York':'NY','North Carolina':'NC',
    'North Dakota':'ND','Ohio':'OH','Oklahoma':'OK','Oregon':'OR','Pennsylvania':'PA',
    'Rhode Island':'RI','South Carolina':'SC','South Dakota':'SD','Tennessee':'TN',
    'Texas':'TX','Utah':'UT','Vermont':'VT','Virginia':'VA','Washington':'WA',
    'West Virginia':'WV','Wisconsin':'WI','Wyoming':'WY'
  };

  function abbr(state) {
    return STATE_ABBR[state] || state;
  }

  function stars(rating) {
    return rating ? ('&#9733; ' + rating) : '';
  }

  function card(b, labelOverride) {
    var type = (b.types && b.types.length) ? b.types[0] : '3D Printing';
    var loc  = labelOverride || ('3D Printing in ' + b.city + ', ' + abbr(b.state));
    return '<a href="/listing/' + b.id + '" class="related-card" aria-label="' +
      b.name + ' — ' + loc + '">' +
      '<span class="related-card-type">' + type + '</span>' +
      '<span class="related-card-name">' + b.name + '</span>' +
      '<span class="related-card-loc">' + loc + '</span>' +
      (b.rating ? '<span class="related-card-rating">' + stars(b.rating) + '</span>' : '') +
      '</a>';
  }

  function section(title, cards, viewAllHref, viewAllText) {
    return '<div class="related-block">' +
      '<h2 class="related-section-title">' + title + '</h2>' +
      '<div class="related-grid">' + cards + '</div>' +
      '<a href="' + viewAllHref + '" class="related-view-all">' + viewAllText + ' &#8594;</a>' +
      '</div>';
  }

  // ── Entry point ──────────────────────────────────────────────────
  function init() {
    var container = document.getElementById('related-services');
    if (!container) return;
    if (typeof BUSINESSES === 'undefined') return;

    // Derive business ID from URL: /listing/123
    var m = window.location.pathname.match(/\/listing\/(\d+)/);
    if (!m) return;
    var id = parseInt(m[1], 10);

    var biz = null;
    for (var i = 0; i < BUSINESSES.length; i++) {
      if (BUSINESSES[i].id === id) { biz = BUSINESSES[i]; break; }
    }
    if (!biz) return;

    var city  = biz.city;
    var state = biz.state;
    var type0 = (biz.types && biz.types.length) ? biz.types[0] : null;

    // ── Same-city businesses (up to 6, sorted by rating desc) ──────
    var cityPool = BUSINESSES
      .filter(function (b) { return b.id !== id && b.city === city; })
      .sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); })
      .slice(0, 6);

    // ── Same-type businesses from other cities (up to 4) ───────────
    var typePool = [];
    if (type0) {
      typePool = BUSINESSES
        .filter(function (b) {
          return b.id !== id &&
                 b.city !== city &&
                 b.types && b.types.indexOf(type0) > -1;
        })
        .sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); })
        .slice(0, 4);
    }

    if (!cityPool.length && !typePool.length) return;

    var html = '<section class="related-services-section" aria-label="Related 3D printing services"><div class="wrap">';

    if (cityPool.length) {
      var cityCards = cityPool.map(function (b) {
        return card(b, b.city + ', ' + abbr(b.state));
      }).join('');
      html += section(
        'More 3D Printing in ' + city,
        cityCards,
        '/directory?city=' + encodeURIComponent(city),
        'View all 3D printing services in ' + city
      );
    }

    if (typePool.length && type0) {
      var typeCards = typePool.map(function (b) { return card(b); }).join('');
      html += section(
        type0 + ' 3D Printing Services Nearby',
        typeCards,
        '/directory?type=' + encodeURIComponent(type0.toLowerCase()),
        'Browse all ' + type0 + ' printing services'
      );
    }

    html += '</div></section>';
    container.innerHTML = html;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
