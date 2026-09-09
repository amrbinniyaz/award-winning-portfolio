/**
 * RESUME — page controller
 *
 * The resume content is authored directly in resume.html rather than rendered
 * from a data file (as projects.js does). A CV should be readable and
 * crawlable without JavaScript, and it has no filtering or routing to justify
 * client-side rendering. JS adds section tracking, navigation and printing.
 */
(function () {
  'use strict';

  function wireNavigation() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      if (link.hasAttribute('download')) return;          // let the CV download
      if (link.target === '_blank') return;
      if (!/^https?:$/.test(new URL(link.href).protocol)) return;

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

    var printButton = document.getElementById('printResume');
    if (printButton) {
      printButton.hidden = false;
      printButton.addEventListener('click', function () { window.print(); });
    }

    // The document stays fully readable without animation or JavaScript.
    var sections = Array.from(document.querySelectorAll('.resume-content > section'));
    var links = Array.from(document.querySelectorAll('.resume-index a'));
    var scheduled = false;
    function updateIndex() {
      scheduled = false;
      var current = sections[0];
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= 180) current = section;
      });
      links.forEach(function (link) {
        if (current && link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    window.addEventListener('scroll', function () {
      if (!scheduled) { scheduled = true; requestAnimationFrame(updateIndex); }
    }, { passive: true });
    updateIndex();

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
