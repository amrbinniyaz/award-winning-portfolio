/**
 * NAV — morphing dot menu + mobile overlay
 *
 * The button is nine dots that cycle between four arrangements. Each dot keeps
 * its identity across formations (dot 0 is always dot 0), so CSS transitions on
 * left/top carry it from one arrangement to the next. Positions are in px
 * inside a 48×48 button; the dots are centred on their coordinates via a
 * negative margin in CSS.
 *
 * Exposes: window.Nav.{ init, update }
 */
(function () {
  'use strict';

  /* Nine coordinate pairs per formation. Order is meaningful. */
  var FORMATIONS = [
    // 3×3 grid
    [[10,10],[21,10],[32,10],[10,21],[21,21],[32,21],[10,32],[21,32],[32,32]],
    // ring
    [[21,8],[29,11],[34,19],[32,28],[25,33],[17,33],[9,28],[8,19],[11,11]],
    // cross
    [[21,7],[21,13],[7,21],[13,21],[21,21],[29,21],[35,21],[21,29],[21,35]],
    // scatter
    [[5,4],[21,6],[37,4],[7,21],[21,21],[35,21],[5,37],[21,35],[37,37]],
  ];

  var CYCLE_MS = 3500;

  var dotsBtn = null;
  var dotEls = [];
  var overlay = null;
  var formIndex = 0;
  var cycleTimer = null;
  var lastFocused = null;

  function applyFormation(idx) {
    var f = FORMATIONS[idx];
    for (var i = 0; i < dotEls.length; i++) {
      dotEls[i].style.left = f[i][0] + 'px';
      dotEls[i].style.top = f[i][1] + 'px';
    }
  }

  function buildNav() {
    var cfg = window.SiteConfig || {};
    var names = cfg.names || {};

    var nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.setAttribute('aria-label', 'Primary');

    var mark = document.createElement('a');
    mark.className = 'nav-mark';
    mark.href = '/';
    mark.textContent = ((names.left || '') + ' ' + (names.right || '')).trim();

    var btn = document.createElement('button');
    btn.className = 'menu-dots';
    btn.id = 'menuDots';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open menu');
    btn.setAttribute('aria-expanded', 'false');
    for (var i = 0; i < 9; i++) btn.appendChild(document.createElement('span'));

    nav.appendChild(mark);
    nav.appendChild(btn);
    document.body.appendChild(nav);

    dotsBtn = btn;
    dotEls = Array.prototype.slice.call(btn.querySelectorAll('span'));
  }

  function buildOverlay() {
    var cfg = window.SiteConfig || {};
    var navCfg = cfg.nav || {};

    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.id = 'navOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Menu');

    var close = document.createElement('button');
    close.className = 'nav-overlay-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Close menu');
    close.textContent = '×';
    overlay.appendChild(close);

    [
      { label: 'HOME', href: '/' },
      { label: 'PROJECTS', href: 'projects.html' },
      { label: 'RESUME', href: 'resume.html' },
    ].forEach(function (item) {
      var a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      a.dataset.color = item.color || '';
      overlay.appendChild(a);
    });

    document.body.appendChild(overlay);
    close.addEventListener('click', closeMenu);
  }

  function openMenu() {
    if (!overlay) return;
    lastFocused = document.activeElement;
    overlay.classList.add('is-open');
    // Flips the custom cursor to light — it's near-black and would otherwise
    // be invisible against the dark overlay.
    document.body.classList.add('on-dark');
    if (dotsBtn) dotsBtn.setAttribute('aria-expanded', 'true');
    var first = overlay.querySelector('a');
    if (first) first.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeMenu() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.classList.remove('on-dark');
    if (dotsBtn) dotsBtn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.key !== 'Tab') return;

    // Trap focus inside the dialog while it's open.
    var focusable = overlay.querySelectorAll('a, button');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /** Called once per frame — inverts the dots when the fluid passes under. */
  function update() {
    if (!dotsBtn || !window.Fluid || !window.Fluid.ready) return;
    var r = dotsBtn.getBoundingClientRect();
    var alpha = window.Fluid.getAlphaAt((r.left + r.right) / 2, (r.top + r.bottom) / 2);
    dotsBtn.classList.toggle('fluid-over', alpha > 0.08);
  }

  function init() {
    buildNav();
    buildOverlay();
    applyFormation(0);

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cycleTimer = setInterval(function () {
        formIndex = (formIndex + 1) % FORMATIONS.length;
        applyFormation(formIndex);
      }, CYCLE_MS);
    }

    dotsBtn.addEventListener('click', function () {
      if (overlay.classList.contains('is-open')) closeMenu();
      else openMenu();
    });

    // Route overlay links through the page transition.
    overlay.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      e.preventDefault();
      closeMenu();
      var href = a.getAttribute('href');
      if (window.Transition) {
        window.Transition.out(href, a.textContent, a.dataset.color || '');
      } else {
        window.location.href = href;
      }
    });
  }

  window.Nav = {
    init: init,
    update: update,
  };
})();
