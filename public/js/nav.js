(function(){
  var dropParent = document.querySelector('.nav-has-drop');
  if (!dropParent) return;
  var btn = dropParent.querySelector('button.nav-link');
  var menu = dropParent.querySelector('.nav-drop');
  if (!btn || !menu) return;

  btn.addEventListener('click', function(e){
    e.stopPropagation();
    var isOpen = dropParent.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close when clicking anywhere outside
  document.addEventListener('click', function(){
    dropParent.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });

  // Prevent clicks inside the dropdown from closing it
  menu.addEventListener('click', function(e){
    e.stopPropagation();
  });
})();

// ── Active nav link by pathname ───────────────────────────
(function () {
  var path = window.location.pathname.replace(/\.html$/, '').replace(/\/index$/, '');
  var links = document.querySelectorAll('.nav-links a.nav-link');
  links.forEach(function (a) {
    var href = a.getAttribute('href').replace(/\.html$/, '').replace(/\/index$/, '');
    if (href !== '/' && (path === href || path.startsWith(href + '/'))) {
      a.classList.add('active');
    }
  });
  // Browse button active on tech/directory sub-pages
  var browseBtn = document.querySelector('.nav-has-drop > button.nav-link');
  if (browseBtn) {
    var browsePages = ['/fdm-printing', '/sla-resin', '/sls-nylon', '/metal-printing', '/directory'];
    if (browsePages.some(function (p) { return path === p; })) {
      browseBtn.classList.add('active');
    }
  }
})();
