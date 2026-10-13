/**
 * PROJECT DETAIL
 *
 * Project pages are static HTML under work/<slug>/, written by
 * tools/build-seo.mjs — that script is the only place their markup is built.
 * This file adds behaviour on top: gallery reveal, an image lightbox, the
 * "On this page" highlight, and page transitions. Legacy project.html?slug=
 * links are forwarded to the static pages.
 */
(function () {
  'use strict';

  var projects = window.Projects || [];
  var root;

  // Set before first paint of the gallery, so figures can start hidden and
  // rise in — without JS they simply stay visible.
  document.documentElement.classList.add('pd-reveal');

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function querySlug() {
    var m = /[?&]slug=([^&]+)/.exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function renderMissing(slug) {
    root.innerHTML = '';
    var head = el('header', 'pd-head');
    var main = el('div', 'pd-head-main');
    var back = el('a', 'project-back', '← All work');
    back.href = 'projects.html';
    main.appendChild(back);
    main.appendChild(el('h1', 'project-title', 'Project not found'));
    main.appendChild(el('p', 'pd-summary',
      slug ? 'No project matches "' + slug + '".' : 'No project was specified.'));
    head.appendChild(main);
    root.appendChild(head);
  }

  /* ── Gallery reveal ── */
  function revealFigures() {
    var figures = root.querySelectorAll('.gallery-figure');
    if (window.Reveal) window.Reveal.watch(figures, { trigger: 1.5 });
    else Array.prototype.forEach.call(figures, function (f) { f.classList.add('is-in'); });
  }

  /* ── Lightbox ── */
  function wireLightbox() {
    var buttons = root.querySelectorAll('[data-zoom]');
    if (!buttons.length || typeof HTMLDialogElement !== 'function') return;

    var dialog = el('dialog', 'pd-lightbox');
    dialog.setAttribute('aria-label', 'Enlarged image');
    var img = el('img');
    var close = el('button', 'pd-lightbox-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close');
    dialog.appendChild(close);
    dialog.appendChild(img);
    document.body.appendChild(dialog);

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('click', function () {
        var source = btn.querySelector('img');
        img.src = btn.dataset.zoom;
        img.alt = source ? source.alt : '';
        dialog.showModal();
      });
    });
    // Any click closes it — on the image, the backdrop or the button.
    dialog.addEventListener('click', function () { dialog.close(); });
  }

  /* ── "On this page" highlight ── */
  function wireContents() {
    var links = root.querySelectorAll('.pd-toc a');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var byId = {};
    Array.prototype.forEach.call(links, function (a) { byId[a.hash.slice(1)] = a; });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Array.prototype.forEach.call(links, function (a) { a.removeAttribute('aria-current'); });
        var link = byId[entry.target.id];
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-35% 0px -60% 0px' });

    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) io.observe(section);
    });
  }

  function wireFilm() {
    var film = root.querySelector('.project-film');
    if (!film) return;
    document.addEventListener('visibilitychange', function () { if (document.hidden) film.pause(); });
  }

  function wireNavigation() {
    root.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#' || (link.hash && link.pathname === location.pathname) || link.target === '_blank' || /^https?:/.test(href)) return;

      e.preventDefault();

      var label = 'PROJECTS';
      if (link.dataset.slug) {
        var next = projects.find(function (p) { return p.slug === link.dataset.slug; });
        if (next) {
          label = next.title;
          sessionStorage.setItem('txCover', next.cover);
        }
      } else if (href === '/') {
        label = 'HOME';
      }

      if (window.Transition) {
        window.Transition.out(href, label, '#1a1614');
      } else {
        window.location.href = href;
      }
    });
  }

  function init() {
    root = document.getElementById('projectRoot');
    if (!root) return;

    if (!root.dataset.slug) {
      var slug = querySlug();
      var match = projects.find(function (p) {
        return p.slug === slug || (p.aliases || []).indexOf(slug) !== -1;
      });
      if (match) {
        window.location.replace('work/' + encodeURIComponent(match.slug) + '/' + window.location.hash);
        return;
      }
      renderMissing(slug);
    } else {
      revealFigures();
      wireLightbox();
      wireContents();
      wireFilm();
    }

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
