/**
 * PRELOADER — CRT boot sequence
 *
 * Timeline:
 *   0ms     colour bars + chaos blocks visible, progress starts climbing
 *   400ms   glitch burst 1 (RGB strip tearing + snow + horizontal shake)
 *   1100ms  glitch burst 2
 *   ~1.6s   progress reaches 100%
 *   +250ms  BIOS screen types itself out
 *   +900ms  hand off to the page, portrait blinks in like a tube warming up
 *
 * Skippable with space/escape/tap, but the hint is only shown from the second
 * visit on — a first-time visitor should see the thing before being told they
 * can skip it.
 *
 * Exposes: window.Preloader.{ init }
 */
(function () {
  'use strict';

  var VISIT_KEY = 'portfolio_visits';

  // SMPTE-style bar colours, top block then the darker bottom strip.
  var BARS_TOP = ['#bfbfbf', '#bfbf00', '#00bfbf', '#00bf00', '#bf00bf', '#bf0000', '#0000bf'];
  var BARS_BOT = ['#0000bf', '#131313', '#bf00bf', '#131313', '#00bfbf', '#131313', '#bfbfbf'];

  var STRIP_RGB = [
    [191, 191, 191], [191, 191, 0], [0, 191, 191],
    [0, 191, 0], [191, 0, 191], [191, 0, 0], [0, 0, 191]
  ];

  var el = {};
  var rafGrain = null, rafGlitch = null, shakeTimer = null, loadTimer = null;
  var finished = false;

  /* ── Static furniture ────────────────────────────────────── */

  function buildBars() {
    if (el.bars) {
      el.bars.innerHTML = BARS_TOP
        .map(function (c) { return '<div class="tv-bar" style="background:' + c + '"></div>'; })
        .join('');
    }
    if (el.barsBottom) {
      el.barsBottom.innerHTML = BARS_BOT
        .map(function (c) { return '<div class="tv-bar-b" style="background:' + c + '"></div>'; })
        .join('');
    }
  }

  /** Scatter the interference blocks. Seeded per load, so every boot differs. */
  function buildChaos() {
    if (!el.chaos) return;
    var html = '';

    for (var i = 0; i < 30; i++) {
      var w = 20 + Math.random() * 130;
      var h = 6 + Math.random() * 26;
      var left = Math.random() * 92;
      var top = Math.random() * 92;
      var op = 0.25 + Math.random() * 0.6;
      html += '<div class="tv-cb" style="'
        + 'left:' + left.toFixed(1) + '%;'
        + 'top:' + top.toFixed(1) + '%;'
        + 'width:' + w.toFixed(0) + 'px;'
        + 'height:' + h.toFixed(0) + 'px;'
        + 'opacity:' + op.toFixed(2)
        + '"></div>';
    }

    var crossPos = [[14, 18], [82, 26], [48, 84]];
    for (var c = 0; c < crossPos.length; c++) {
      html += '<div class="tv-cross" style="left:' + crossPos[c][0] + '%;top:' + crossPos[c][1] + '%"></div>';
    }

    el.chaos.innerHTML = html;
  }

  function applyBarrelClip() {
    if (!el.outer || !window.CRTOverlay) return;
    var W = el.outer.offsetWidth, H = el.outer.offsetHeight;
    if (!W || !H) return;
    var p = window.CRTOverlay.barrelPaths(W, H);
    el.outer.style.clipPath = "path('" + p.inner + "')";
  }

  /* ── Grain ───────────────────────────────────────────────── */

  function startGrain() {
    if (!el.grain) return;
    var W = 480, H = 270;
    el.grain.width = W;
    el.grain.height = H;
    var ctx = el.grain.getContext('2d');
    var img = ctx.createImageData(W, H);
    var d = img.data;
    for (var i = 3; i < d.length; i += 4) d[i] = 255;

    var tick = 0;
    (function loop() {
      tick++;
      if (tick % 4 === 0) {
        for (var i = 0; i < d.length; i += 4) {
          var v = (Math.random() * 255) | 0;
          d[i] = d[i + 1] = d[i + 2] = v;
        }
        ctx.putImageData(img, 0, 0);
      }
      rafGrain = requestAnimationFrame(loop);
    })();
  }

  /* ── Glitch bursts ───────────────────────────────────────── */

  function startGlitch() {
    if (!el.glitch) return;

    var cfg = (window.SiteConfig && window.SiteConfig.preloader) || {};
    var burstAt = cfg.glitchBurstsAt || [400, 1100];
    var burstMs = cfg.glitchBurstMs || 220;

    var GW = 320, GH = 200;
    el.glitch.width = GW;
    el.glitch.height = GH;
    var ctx = el.glitch.getContext('2d');

    var snow = ctx.createImageData(GW, GH);
    var sd = snow.data;

    var n = STRIP_RGB.length;
    var offsets = new Float32Array(n);
    var targets = new Float32Array(n);
    var stripH = Math.ceil(GH * 0.62);
    var stripW = Math.ceil(GW / n);

    var start = Date.now();
    var active = false, endAt = 0, next = 0;

    function stopShake() {
      if (shakeTimer) { clearInterval(shakeTimer); shakeTimer = null; }
      if (el.inner) el.inner.style.transform = '';
    }

    function startShake() {
      stopShake();
      var step = 0;
      shakeTimer = setInterval(function () {
        step++;
        if (step >= 12 || !el.inner) { stopShake(); return; }
        el.inner.style.transform = 'translateX(' + ((Math.random() - 0.5) * 28).toFixed(1) + 'px)';
      }, burstMs / 12);
    }

    function begin() {
      active = true;
      endAt = Date.now() + burstMs;
      for (var i = 0; i < n; i++) targets[i] = (Math.random() - 0.5) * 36;
      startShake();
    }

    (function loop() {
      var now = Date.now();
      var elapsed = now - start;

      if (!active && next < burstAt.length && elapsed >= burstAt[next]) {
        begin();
        next++;
      }

      if (active && now >= endAt) {
        active = false;
        stopShake();
        ctx.clearRect(0, 0, GW, GH);
        offsets.fill(0);
      }

      if (active) {
        for (var i = 0; i < sd.length; i += 4) {
          var v = (Math.random() * 255) | 0;
          sd[i] = sd[i + 1] = sd[i + 2] = v;
          sd[i + 3] = ((Math.random() * 180) + 55) | 0;
        }
        ctx.putImageData(snow, 0, 0);

        // Each colour strip slides toward its own target, re-aiming at random.
        for (var s = 0; s < n; s++) {
          offsets[s] += (targets[s] - offsets[s]) * 0.35;
          if (Math.random() < 0.18) targets[s] = (Math.random() - 0.5) * 36;
          var c = STRIP_RGB[s];
          ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.72)';
          ctx.fillRect(s * stripW + offsets[s], 0, stripW + 1, stripH);
        }
      }

      rafGlitch = requestAnimationFrame(loop);
    })();
  }

  /* ── Progress bar ────────────────────────────────────────── */

  function updateProgress(n) {
    if (!el.fill || !el.progress) return;
    var barW = el.progress.offsetWidth;
    if (!barW) return;

    // Split the bar into whole segments so the fill always lands on a segment
    // boundary — otherwise the last dash renders a different width.
    var count = Math.max(1, Math.floor(barW / 14));
    var segW = barW / count;
    var litW = segW * (10 / 14);
    var visible = n >= 100 ? count : Math.floor(n * count / 100);

    el.fill.style.width = n >= 100 ? '100%' : (visible * segW) + 'px';
    el.fill.style.background =
      'repeating-linear-gradient(to right,'
      + ' rgba(255,255,255,0.95) 0px,'
      + ' rgba(255,255,255,0.95) ' + litW.toFixed(2) + 'px,'
      + ' transparent ' + litW.toFixed(2) + 'px,'
      + ' transparent ' + segW.toFixed(2) + 'px)';

    if (el.pct) el.pct.textContent = n + '%';
  }

  /* ── BIOS handoff ────────────────────────────────────────── */

  function showBios(done) {
    if (!el.bios) { done(); return; }

    var names = (window.SiteConfig && window.SiteConfig.names) || {};
    var who = ((names.left || '') + ' ' + (names.right || '')).trim().toUpperCase();

    var lines = [
      'CRT DISPLAY SYSTEM v2.4',
      'Copyright (c) ' + new Date().getFullYear() + ' ' + who,
      '',
      'Detecting display .............. OK',
      'Vertical hold .................. OK',
      'Phosphor persistence ........... 16ms',
      'Fluid solver ................... READY',
      'Contour mesh ................... 140x100',
      '',
      'Booting projects…'
    ];

    el.bios.classList.add('is-visible');
    el.bios.textContent = '';

    var i = 0;
    (function typeLine() {
      if (i < lines.length) {
        el.bios.textContent += lines[i] + '\n';
        i++;
        // Blank lines shouldn't cost a full beat.
        setTimeout(typeLine, lines[i - 1] === '' ? 30 : 85);
        return;
      }
      var caret = document.createElement('span');
      caret.className = 'bios-cursor';
      caret.textContent = ' ';
      el.bios.appendChild(caret);
      setTimeout(done, 700);
    })();
  }

  /* ── Reveal ──────────────────────────────────────────────── */

  function reveal() {
    if (finished) return;
    finished = true;

    if (rafGrain) cancelAnimationFrame(rafGrain);
    if (rafGlitch) cancelAnimationFrame(rafGlitch);
    if (shakeTimer) clearInterval(shakeTimer);
    if (loadTimer) clearInterval(loadTimer);

    document.body.classList.remove('boot-pending');
    if (el.root) el.root.classList.add('is-done');

    var portrait = document.getElementById('portraitSection');
    var name = document.getElementById('nameSection');
    var left = document.getElementById('sideLeft');
    var right = document.getElementById('sideRight');
    var nav = document.querySelector('.site-nav');

    // Portrait flickers on like a tube striking — fast stutter settling into
    // longer holds, then a clean fade to steady.
    if (portrait) {
      portrait.style.transition = 'none';
      portrait.style.opacity = '0';

      var blinks = [
        [50, 1], [105, 0], [160, 1], [215, 0], [270, 1], [325, 0], [380, 1], [435, 0],
        [555, 1], [675, 0], [855, 1], [1035, 0], [1285, 1], [1535, 0],
        [2135, 1], [2600, 0], [3300, 1]
      ];
      blinks.forEach(function (b) {
        setTimeout(function () { portrait.style.opacity = String(b[1]); }, b[0]);
      });
      setTimeout(function () {
        portrait.style.transition = 'opacity 0.6s ease';
        portrait.style.opacity = '1';
      }, 3320);
    }

    // Everything else eases in behind the flicker.
    function fadeIn(node, delay, transform) {
      if (!node) return;
      node.style.opacity = '0';
      if (transform) node.style.transform = transform;
      setTimeout(function () {
        node.style.transition = 'opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)';
        node.style.opacity = '1';
        if (transform) node.style.transform = transform.replace(/translateX\([^)]*\)/, 'translateX(0)');
      }, delay);
    }

    fadeIn(name, 900);
    fadeIn(left, 1200, 'translateY(-50%) translateX(-180%)');
    fadeIn(right, 1200, 'translateY(-50%) translateX(180%)');
    fadeIn(nav, 1400);

    ['fluidCanvas', 'bgCanvas', 'illustrationCanvas'].forEach(function (id, i) {
      var c = document.getElementById(id);
      if (!c) return;
      setTimeout(function () {
        c.style.transition = 'opacity 1s ease';
        c.style.opacity = '1';
      }, 600 + i * 120);
    });

    document.dispatchEvent(new CustomEvent('preloader:done'));
  }

  /* ── Boot ────────────────────────────────────────────────── */

  function init() {
    el.root = document.getElementById('preloader');
    if (!el.root) return;

    // Reduced motion: skip the whole sequence, show the page immediately.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.root.remove();
      document.body.classList.remove('boot-pending');
      document.dispatchEvent(new CustomEvent('preloader:done'));
      return;
    }

    el.outer = document.getElementById('tvOuter');
    el.inner = document.getElementById('tvInner');
    el.bars = document.getElementById('tvBars');
    el.barsBottom = document.getElementById('tvBarsBottom');
    el.chaos = document.getElementById('tvChaos');
    el.grain = document.getElementById('tvGrainCanvas');
    el.glitch = document.getElementById('tvGlitchCanvas');
    el.bios = document.getElementById('tvBios');
    el.msg = document.getElementById('tvMsg');
    el.fill = document.getElementById('tvProgressFill');
    el.pct = document.getElementById('tvPct');
    el.progress = el.fill ? el.fill.parentElement : null;
    el.skipHint = document.getElementById('tvSkipHint');

    var cfg = (window.SiteConfig && window.SiteConfig.preloader) || {};

    if (el.msg) el.msg.innerHTML = (cfg.message || ['LOADING']).join('<br>');

    buildBars();
    buildChaos();
    requestAnimationFrame(function () { requestAnimationFrame(applyBarrelClip); });
    window.addEventListener('resize', applyBarrelClip);

    startGrain();
    startGlitch();

    // Skip affordance, from the Nth visit on.
    var visits = 0;
    try {
      visits = (parseInt(localStorage.getItem(VISIT_KEY) || '0', 10) || 0) + 1;
      localStorage.setItem(VISIT_KEY, String(visits));
    } catch (e) { /* private mode — just never show the hint */ }

    if (visits >= (cfg.skipAfterVisits || 2) && el.skipHint) {
      el.skipHint.classList.add('is-visible');

      var onSkip = function (e) {
        if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'Escape') return;
        if (e.type === 'keydown') e.preventDefault();
        document.removeEventListener('keydown', onSkip);
        el.root.removeEventListener('click', onSkip);
        reveal();
      };
      document.addEventListener('keydown', onSkip);
      el.root.addEventListener('click', onSkip);
    }

    // Progress climb, then BIOS, then hand over.
    var n = 0;
    updateProgress(0);
    loadTimer = setInterval(function () {
      n += Math.random() > 0.4 ? 3 : 2;
      if (n >= 100) {
        n = 100;
        clearInterval(loadTimer);
        loadTimer = null;
        setTimeout(function () {
          if (finished) return;
          if (el.inner) {
            el.inner.style.transition = 'opacity 0.25s ease';
            el.inner.style.opacity = '0';
          }
          setTimeout(function () {
            if (finished) return;
            showBios(reveal);
          }, 250);
        }, 260);
      }
      updateProgress(n);
    }, 42);
  }

  window.Preloader = { init: init, reveal: reveal };
})();
