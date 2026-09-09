/**
 * PORTFOLIO — listing grid
 *
 * Renders the grid from window.Projects, wires category filtering, reveals
 * cards on scroll, and hands navigation to the transition system.
 *
 * The scroll reveal uses IntersectionObserver and unobserves each card once
 * shown — a card that has appeared never needs watching again, and leaving
 * observers attached to a 12-item grid costs main-thread work on every scroll.
 */
(function () {
  'use strict';

  var ALL = 'All';

  var grid, filterBar;
  var projects = window.Projects || [];
  var active = ALL;
  var observer = null;

  /* ── Rendering ───────────────────────────────────────────── */

  function categories() {
    var counts = {};
    projects.forEach(function (p) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    // Largest category first, so the filter row leads with the strongest work.
    var names = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
    return [{ name: ALL, count: projects.length }].concat(
      names.map(function (n) { return { name: n, count: counts[n] }; })
    );
  }

  function buildFilters() {
    filterBar.innerHTML = '';

    categories().forEach(function (c) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-btn' + (c.name === active ? ' is-active' : '');
      btn.dataset.category = c.name;
      btn.setAttribute('aria-pressed', String(c.name === active));
      btn.innerHTML = c.name + '<span class="filter-count">' + c.count + '</span>';
      filterBar.appendChild(btn);
    });
  }

  function buildGrid() {
    grid.innerHTML = '';

    projects.forEach(function (p, i) {
      var card = document.createElement('article');
      var link = document.createElement('a');
      link.className = 'work-card-link';
      var bar = document.createElement('div');
      bar.className = 'work-preview-bar';
      card.className = 'work-card';
      link.href = 'project.html?slug=' + encodeURIComponent(p.slug);
      card.dataset.category = p.category;
      card.dataset.slug = p.slug;

      var media = document.createElement('div');
      media.className = 'work-media' + (p.previewVideo ? ' work-media--video' : p.scrollPreview ? ' work-media--scroll' : '');

      var img = document.createElement('img');
      img.src = p.scrollPreview ? (p.thumbnail && p.thumbnail.scroll || p.scrollPreview) : (p.thumbnail && p.thumbnail.src || p.cover);
      if (p.thumbnail && !p.scrollPreview) {
        img.width = p.thumbnail.width;
        img.height = p.thumbnail.height;
      }
      img.alt = p.coverAlt || p.title;
      // The first row is above the fold; everything else can wait.
      img.loading = i < 2 ? 'eager' : 'lazy';
      img.decoding = 'async';

      var index = document.createElement('span');
      index.className = 'work-index';
      index.textContent = String(i + 1).padStart(2, '0');

      media.appendChild(img);
      if (p.previewVideo) {
        var video = document.createElement('video');
        video.className = 'work-preview';
        video.dataset.preview = '';
        video.dataset.src = p.previewVideo;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'none';
        video.poster = p.thumbnail && p.thumbnail.src || p.cover;
        video.setAttribute('aria-hidden', 'true');
        media.appendChild(video);
      }
      if (p.previewVideo || p.scrollPreview) {
        var badge = document.createElement('span');
        badge.className = 'work-preview-label';
        badge.textContent = p.previewVideo ? '3D IN MOTION' : 'EXPLORE THE WEBSITE';
        bar.appendChild(badge);
      }
      bar.insertBefore(index, bar.firstChild);

      var meta = document.createElement('div');
      meta.className = 'work-meta';

      var title = document.createElement('h2');
      title.className = 'work-title';
      title.textContent = p.title;

      var tag = document.createElement('span');
      tag.className = 'work-tag';
      tag.textContent = p.category + (p.year ? ' · ' + p.year : '');

      meta.appendChild(title);
      meta.appendChild(tag);

      link.appendChild(media);
      link.appendChild(meta);
      card.appendChild(bar);
      card.appendChild(link);
      if (p.previewVideo) {
        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'preview-toggle';
        toggle.textContent = 'Play preview';
        toggle.setAttribute('aria-label', 'Play animation preview for ' + p.title);
        bar.appendChild(toggle);
      }
      grid.appendChild(card);
    });

    observeCards();
    if (window.ProjectMedia) window.ProjectMedia.init(grid);
  }

  /* ── Scroll reveal ───────────────────────────────────────── */

  function observeCards() {
    if (observer) observer.cancel();

    var visible = Array.prototype.filter.call(
      grid.querySelectorAll('.work-card'),
      function (c) { return !c.classList.contains('is-hidden'); }
    );

    observer = window.Reveal
      ? window.Reveal.watch(visible, { stagger: 90 })
      : (visible.forEach(function (c) { c.classList.add('is-in'); }), null);
  }

  /* ── Filtering ───────────────────────────────────────────── */

  function applyFilter(category) {
    active = category;

    filterBar.querySelectorAll('.filter-btn').forEach(function (b) {
      var on = b.dataset.category === category;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });

    var shown = 0;
    grid.querySelectorAll('.work-card').forEach(function (card) {
      var match = category === ALL || card.dataset.category === category;
      card.classList.toggle('is-hidden', !match);
      if (match) {
        shown++;
        // Reset so re-shown cards animate in again rather than popping.
        card.classList.remove('is-in');
      }
    });

    var empty = grid.querySelector('.work-empty');
    if (empty) empty.remove();
    if (shown === 0) {
      var msg = document.createElement('p');
      msg.className = 'work-empty';
      msg.textContent = 'Nothing in this category yet.';
      grid.appendChild(msg);
    }

    observeCards();
    if (window.ProjectMedia) window.ProjectMedia.refresh();
  }

  /* ── Navigation ──────────────────────────────────────────── */

  function wireNavigation() {
    grid.addEventListener('click', function (e) {
      var link = e.target.closest('.work-card-link');
      if (!link) return;
      var card = link.closest('.work-card');
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;  // let modified clicks through

      e.preventDefault();
      var p = projects.find(function (x) { return x.slug === card.dataset.slug; });

      // Hand the cover to the detail page so it can paint instantly instead of
      // waiting on a fresh network fetch.
      if (p) sessionStorage.setItem('txCover', p.cover);

      if (window.Transition) {
        window.Transition.out(link.href, p ? p.title : 'PROJECT', '#1a1614');
      } else {
        window.location.href = link.href;
      }
    });
  }

  /* ── Init ────────────────────────────────────────────────── */

  function init() {
    grid = document.getElementById('workGrid');
    filterBar = document.getElementById('filters');
    if (!grid || !filterBar) return;

    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    if (!projects.length) {
      grid.innerHTML = '<p class="work-empty">No projects loaded.</p>';
      return;
    }

    // Deep link, e.g. projects.html?filter=Illustration. Matched
    // case-insensitively against real categories so a bad value falls back to
    // showing everything rather than an empty grid.
    var wanted = (/[?&]filter=([^&]+)/.exec(window.location.search) || [])[1];
    if (wanted) {
      wanted = decodeURIComponent(wanted).toLowerCase();
      var match = categories().find(function (c) { return c.name.toLowerCase() === wanted; });
      if (match) active = match.name;
    }

    buildFilters();
    buildGrid();
    wireNavigation();
    if (active !== ALL) applyFilter(active);

    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (btn) applyFilter(btn.dataset.category);
    });

    if (window.Contours) window.Contours.init();
    if (window.Cursor) window.Cursor.init();
    if (window.CRTOverlay) window.CRTOverlay.init();
    if (window.Nav) window.Nav.init();
    if (window.Transition) window.Transition.enter();

    // Inner pages share the landing page's render loop shape, minus the fluid.
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
