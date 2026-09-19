/**
 * PORTFOLIO — listing grid
 *
 * Renders the grid from window.Projects, wires category filtering, shows
 * ready-to-scroll thumbnails, and hands navigation to the transition system.
 *
 */
(function () {
  'use strict';

  var ALL = 'All';

  var grid, filterBar;
  var projects = window.Projects || [];
  var active = ALL;
  var saveData = navigator.connection && navigator.connection.saveData;

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
      card.className = 'work-card is-in';
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
      // The small optimized gallery loads ahead of scrolling. Respect data saving.
      img.loading = saveData && i >= 2 ? 'lazy' : 'eager';
      img.fetchPriority = i < 2 ? 'high' : 'low';
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

    if (window.ProjectMedia) window.ProjectMedia.init(grid);
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
        card.classList.add('is-in');
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

  function initMotion() {
    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var fine = window.matchMedia('(pointer: fine)');
    var enabled = false, pointerActive = false;
    var x = .5, y = .5, smoothX = .5, smoothY = .5;
    var last = 0, frameId = null, grainDraws = 0;
    var easing = (window.SiteConfig || {}).easing || {};

    function resetPointer() { pointerActive = false; }

    function frame(ts) {
      frameId = null;
      if (document.hidden) return;
      var dt = Math.min(Math.max((ts - last) / 1000, .001), .05);
      last = ts;
      if (enabled && window.Fluid && window.Fluid.ready) {
        if (pointerActive) {
          var previousX = smoothX, previousY = smoothY;
          var ease = 1 - Math.pow(1 - (easing.mouse || .16), dt * 60);
          smoothX += (x - smoothX) * ease;
          smoothY += (y - smoothY) * ease;
          var dx = smoothX - previousX, dy = smoothY - previousY;
          var distance = Math.hypot(dx * innerWidth, dy * innerHeight);
          if (distance > .3) {
            var samples = Math.min(5, Math.max(1, Math.ceil(distance / 24)));
            for (var i = 1; i <= samples; i++) {
              window.Fluid.splat(
                (previousX + dx * i / samples) * innerWidth,
                (previousY + dy * i / samples) * innerHeight,
                dx / samples, dy / samples
              );
            }
          }
        }
        window.Fluid.tick(dt);
      }
      if (window.Cursor) window.Cursor.update(motion.matches ? 1 : 1 - Math.pow(1 - (easing.ring || .16), dt * 60));
      // A static grain plate leaves GPU time for the fluid and video previews.
      if (window.CRTOverlay && grainDraws < 5) {
        window.CRTOverlay.drawGrain();
        grainDraws++;
      }
      if (!motion.matches && fine.matches) frameId = requestAnimationFrame(frame);
    }

    function resume() {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
      resetPointer();
      if (document.hidden) return;
      last = performance.now();
      frameId = requestAnimationFrame(frame);
    }

    function updateMotion() {
      enabled = !motion.matches && fine.matches;
      if (enabled && window.Fluid && !window.Fluid.ready && window.Fluid.init()) {
        window.Fluid.setBackground('assets/images/cinematic-interior.webp');
      }
      resume();
    }

    document.addEventListener('pointermove', function (e) {
      if (!enabled || e.pointerType === 'touch') return;
      x = e.clientX / innerWidth;
      y = e.clientY / innerHeight;
      // Re-entry starts here instead of drawing a streak from the last visit.
      if (!pointerActive) {
        smoothX = x; smoothY = y;
        pointerActive = true;
      }
    }, { passive: true });
    document.addEventListener('pointerleave', resetPointer);
    window.addEventListener('blur', resetPointer);
    window.addEventListener('resize', function () { grainDraws = 0; resume(); });
    document.addEventListener('visibilitychange', resume);
    motion.addEventListener('change', updateMotion);
    fine.addEventListener('change', updateMotion);
    updateMotion();
  }

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

    if (window.Cursor) window.Cursor.init();
    if (window.CRTOverlay) window.CRTOverlay.init();
    if (window.Nav) window.Nav.init();
    if (window.Transition) window.Transition.enter();

    initMotion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
