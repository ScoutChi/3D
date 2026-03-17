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
