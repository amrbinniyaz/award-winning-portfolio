/**
 * RESUME — page controller
 *
 * The resume content is authored directly in resume.html rather than rendered
 * from a data file (as projects.js does). A CV should be readable and
 * crawlable without JavaScript, and it has no filtering or routing to justify
 * client-side rendering. JS here only animates.
 *
 * Meters fill from 0 to their `data-level` once scrolled into view, so the
 * levels read as instrumentation coming online rather than static bars.
 */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fillMeters() {
    var meters = Array.prototype.slice.call(document.querySelectorAll('.meter-fill'));
    if (!meters.length) return;

    if (REDUCED) {
      meters.forEach(function (m) { m.style.width = (m.dataset.level || 0) + '%'; });
      return;
    }

    // Reuse the shared reveal sweep rather than a second scroll mechanism.
    // It reveals by adding a class, so watch a proxy and read it back.
    var pending = meters.slice();
    var ticking = false;

    function sweep() {
      ticking = false;
      var limit = window.innerHeight * 0.9;

      for (var i = pending.length - 1; i >= 0; i--) {
        var m = pending[i];
        if (m.getBoundingClientRect().top >= limit) continue;

        // Stagger down the column so a group fills in sequence.
        (function (node, delay) {
          setTimeout(function () {
            node.style.width = (node.dataset.level || 0) + '%';
          }, delay);
        })(m, (pending.length - 1 - i) * 90);

        pending.splice(i, 1);
      }

      if (!pending.length) detach();
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(sweep);
    }

    function detach() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    sweep();
  }

  function wireNavigation() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      if (link.hasAttribute('download')) return;          // let the CV download
      if (link.target === '_blank') return;

      e.preventDefault();
      var label = href === '/' ? 'HOME'
        : /projects/.test(href) ? 'PROJECTS'
        : link.textContent.trim().toUpperCase();

      if (window.Transition) window.Transition.out(href, label, '#1a1614');
      else window.location.href = href;
    });
  }

  function init() {
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    // Career and education entries share the site-wide reveal behaviour.
    document.querySelectorAll('[data-reveal]').forEach(function (group) {
      var items = group.querySelectorAll('.trace-item');
      if (window.Reveal) window.Reveal.watch(items, { stagger: 80 });
      else Array.prototype.forEach.call(items, function (i) { i.classList.add('is-in'); });
    });

    fillMeters();
    wireNavigation();

    if (window.Contours) window.Contours.init();
    if (window.Cursor) window.Cursor.init();
    if (window.CRTOverlay) window.CRTOverlay.init();
    if (window.Nav) window.Nav.init();
    if (window.Transition) window.Transition.enter();

    var last = 0;
    requestAnimationFrame(function loop(ts) {
      var dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      if (window.Contours) window.Contours.draw(dt);
      if (window.Cursor) window.Cursor.update(0.12);
      if (window.CRTOverlay) window.CRTOverlay.drawGrain();
      requestAnimationFrame(loop);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
