/**
 * MAIN — orchestrator
 *
 * Owns the single requestAnimationFrame loop and the shared pointer state.
 * Every effect module exposes an update/draw function; nothing else runs its
 * own loop, so ordering is explicit and there is one place to profile.
 *
 * Per-frame order matters:
 *   pointer smoothing → contours → slide/parallax → portrait bounds →
 *   fluid composition → cursor → grain
 */
(function () {
  'use strict';

  var CFG = window.SiteConfig || {};
  var EASE = CFG.easing || {};
  var SLIDE_PX = CFG.slidePx || 250;
  var IDLE_MS = CFG.idleMs || 2200;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* True only where a real cursor exists. Gates the interactions that are
     meaningless on touch — the left/right slide and the depth parallax. */
  var HAS_FINE_POINTER = window.matchMedia('(pointer: fine)').matches;

  /* ── Shared state ────────────────────────────────────────── */

  var pointerX = 0.5, pointerY = 0.5;        // normalized, raw
  var smoothX = 0.5, smoothY = 0.5;          // normalized, eased
  var previousX = 0.5, previousY = 0.5, pointerActive = false;

  var side = null;                            // 'left' | 'center' | 'right'
  var slideOffset = 0, slideTarget = 0, slideReady = false;
  var paraPortrait = 0, paraName = 0, parallaxReady = false;

  var isIdle = true, idleTimer = null, idleClock = 0, idleSplatClock = 0;

  var lastFrame = 0, frameId = null, grainDraws = 0;

  var slideGroup, portraitSection, nameSection;

  var lerp = function (a, b, t) { return a + (b - a) * t; };

  // Convert 60Hz tuning to elapsed-time easing for high-refresh displays.
  function ease(value, dt) { return 1 - Math.pow(1 - value, dt * 60); }

  /* ── Idle behaviour ──────────────────────────────────────────
     After a period of stillness the fluid drives itself, so the page never
     looks frozen. Three streamers on different periods trace lissajous
     orbits around the portrait; tangential velocity gives them swirl. */

  function idleOrbit(dt) {
    idleClock += dt;

    if (!window.Fluid || !window.Fluid.ready) return;

    idleSplatClock += dt;
    if (idleSplatClock < 0.038) return;   // ~26Hz is plenty
    idleSplatClock %= 0.038;

    var cx = window.innerWidth * 0.50;
    var cy = window.innerHeight * 0.46;
    var baseR = Math.min(window.innerWidth, window.innerHeight) * 0.27;

    [
      { speed: 0.52, radius: baseR * 1.00, phase: 0 },
      { speed: 0.33, radius: baseR * 1.55, phase: Math.PI * 0.667 },
      { speed: 0.74, radius: baseR * 0.72, phase: Math.PI * 1.333 },
    ].forEach(function (s) {
      var a = idleClock * s.speed + s.phase;
      window.Fluid.splat(
        cx + Math.cos(a) * s.radius,
        cy + Math.sin(a) * s.radius,
        -Math.sin(a) * s.speed * 0.0035,
        Math.cos(a) * s.speed * 0.0035
      );
    });
  }

  /* ── Frame ───────────────────────────────────────────────── */

  function frame(ts) {
    var dt = Math.min((ts - lastFrame) / 1000, 0.05);
    lastFrame = ts;

    frameId = null;
    if (document.hidden) return;
    smoothX = lerp(smoothX, pointerX, ease(EASE.mouse || 0.16, dt));
    smoothY = lerp(smoothY, pointerY, ease(EASE.mouse || 0.16, dt));

    // Events only update the target. Inject a bounded, continuous stroke once
    // per rendered frame, independent of mouse polling rate.
    if (!reduced) {
      if (isIdle) idleOrbit(dt);
      else if (pointerActive && window.Fluid && window.Fluid.ready) {
        var dx = smoothX - previousX, dy = smoothY - previousY;
        var distance = Math.hypot(dx * innerWidth, dy * innerHeight);
        if (distance > 0.3) {
          var samples = Math.min(5, Math.max(1, Math.ceil(distance / 24)));
          for (var i = 1; i <= samples; i++) {
            window.Fluid.splat(
              lerp(previousX, smoothX, i / samples) * innerWidth,
              lerp(previousY, smoothY, i / samples) * innerHeight,
              dx / samples, dy / samples
            );
          }
        }
      }
    }
    previousX = smoothX;
    previousY = smoothY;

    if (window.Contours) window.Contours.draw(reduced ? 0 : dt);

    // Content group slides away from the cursor's side.
    if (slideReady && slideGroup) {
      slideOffset = lerp(slideOffset, slideTarget, ease(EASE.slide || 0.055, dt));
      slideGroup.style.transform = 'translateX(' + slideOffset.toFixed(2) + 'px)';
    }

    // Vertical parallax. The portrait eases far slower than the nameplate,
    // which is what sells one as distant and the other as close.
    if (parallaxReady) {
      var target = pointerY - 0.5;
      paraPortrait = lerp(paraPortrait, target, ease(0.035, dt));
      paraName = lerp(paraName, target, ease(0.09, dt));
      if (portraitSection && !document.body.classList.contains('gpu-portrait')) {
        portraitSection.style.transform =
          'translateX(-50%) translateY(' + (paraPortrait * -45).toFixed(1) + 'px)';
      }
      if (nameSection) {
        // Bottom-anchored in CSS, so this is a plain offset — no -50% base.
        nameSection.style.transform =
          'translateY(' + (paraName * -15).toFixed(1) + 'px)';
      }
    }

    if (window.LiquidMask) window.LiquidMask.update(slideOffset, paraPortrait * -45);
    if (!reduced && window.Fluid && window.Fluid.ready) window.Fluid.tick(dt);
    if (window.Cursor) window.Cursor.update(reduced ? 1 : ease(EASE.ring || 0.16, dt));
    // One grain plate is enough for the paper texture. Repainting a full
    // screen noise layer while the fluid moves adds avoidable raster work.
    if (!reduced && window.CRTOverlay && grainDraws < 5) {
      window.CRTOverlay.drawGrain();
      grainDraws++;
    }

    if (!reduced) frameId = requestAnimationFrame(frame);
  }

  /* ── Pointer ─────────────────────────────────────────────── */

  function onPointerMove(e) {
    pointerX = e.clientX / window.innerWidth;
    pointerY = e.clientY / window.innerHeight;
    if (!pointerActive) {
      // Never join the first pointer event to a phantom stroke from (0,0).
      smoothX = previousX = pointerX;
      smoothY = previousY = pointerY;
      pointerActive = true;
    }
    if (reduced) {
      if (window.Cursor) window.Cursor.update(1);
      return;
    }

    // The slide and nameplate swap are hover-model interactions: they answer
    // "which half is the cursor in", which is meaningless without a cursor.
    //
    // Hybrid laptops can have a fine pointer AND touch: gate each event too.
    if (!HAS_FINE_POINTER || e.pointerType === 'touch') {
      isIdle = false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () { isIdle = true; }, IDLE_MS);
      return;
    }

    // Dead zone between 0.4 and 0.6 stops the name thrashing mid-screen.
    var next = pointerX < 0.4 ? 'left' : pointerX > 0.6 ? 'right' : 'center';
    if (next !== side) {
      side = next;
      document.body.classList.remove('cursor-left', 'cursor-right');

      var names = CFG.names || {};
      if (next === 'left') {
        document.body.classList.add('cursor-left');
        slideTarget = Math.min(SLIDE_PX, innerWidth * 0.13);
        if (window.Nameplate) window.Nameplate.set(names.left, true);
      } else if (next === 'right') {
        document.body.classList.add('cursor-right');
        slideTarget = -Math.min(SLIDE_PX, innerWidth * 0.13);
        if (window.Nameplate) window.Nameplate.set(names.right, true);
      } else {
        slideTarget = 0;
      }
    }

    isIdle = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { isIdle = true; }, IDLE_MS);
  }

  /* ── Side nav ────────────────────────────────────────────── */

  function wireSideNav() {
    var navCfg = CFG.nav || {};

    [
      { el: document.getElementById('sideLeft'), cfg: navCfg.left },
      { el: document.getElementById('sideRight'), cfg: navCfg.right },
    ].forEach(function (item) {
      if (!item.el || !item.cfg) return;

      item.el.setAttribute('href', item.cfg.href);
      item.el.setAttribute('aria-label', item.cfg.label);
      // Drives the numeral's glow colour in CSS.
      if (item.cfg.color) item.el.style.setProperty('--glow', item.cfg.color);

      var labelEl = item.el.querySelector('[data-side-label]');
      var indexEl = item.el.querySelector('[data-side-index]');
      if (labelEl) labelEl.textContent = item.cfg.label;
      if (indexEl) indexEl.textContent = item.cfg.index;

      item.el.addEventListener('click', function (e) {
        e.preventDefault();
        if (window.Transition) {
          window.Transition.out(item.cfg.href, item.cfg.label, item.cfg.color);
        } else {
          window.location.href = item.cfg.href;
        }
      });
    });
  }

  /* ── Init ────────────────────────────────────────────────── */

  function init() {
    slideGroup = document.getElementById('slideGroup');
    portraitSection = document.getElementById('portraitSection');
    nameSection = document.getElementById('nameSection');

    if (window.Contours) window.Contours.init();
    if (window.Fluid && !reduced) {
      if (window.Fluid.init()) window.Fluid.setBackground('assets/images/fluid-landscape.svg');
    }
    if (window.LiquidMask) window.LiquidMask.init();
    if (window.Nameplate) window.Nameplate.init();
    if (window.Cursor) window.Cursor.init();
    if (window.CRTOverlay) window.CRTOverlay.init();
    if (window.Nav) window.Nav.init();

    wireSideNav();

    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', function () {
      isIdle = true;
      pointerActive = false;
      slideTarget = 0;
    });
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') {
        pointerActive = false;
        onPointerMove(e);
      }
    }, { passive: true });
    document.addEventListener('pointerup', function (e) {
      if (e.pointerType === 'touch') pointerActive = false;
    }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
      pointerActive = false;
      if (!document.hidden && !reduced) {
        lastFrame = performance.now();
        frameId = requestAnimationFrame(frame);
      }
    });
    window.addEventListener('resize', function () {
      if (reduced) frame(performance.now());
    });

    if (window.Transition) window.Transition.enter();

    // Hold the interactive layers back until the boot sequence hands over,
    // so nothing slides around behind the CRT. Both are cursor-driven, so
    // neither is armed on touch — parallax reads pointerY, which touchmove
    // also updates, and would jolt the portrait vertically on every tap.
    document.addEventListener('preloader:done', function () {
      if (!HAS_FINE_POINTER || reduced) return;
      setTimeout(function () { slideReady = true; }, 400);
      setTimeout(function () { parallaxReady = true; }, 900);
    });

    if (window.Preloader) window.Preloader.init();

    idleTimer = setTimeout(function () { isIdle = true; }, IDLE_MS);
    requestAnimationFrame(function (ts) {
      lastFrame = ts;
      frameId = requestAnimationFrame(frame);
    });

    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (event) {
      reduced = event.matches;
      if (reduced) {
        slideReady = parallaxReady = false;
        slideGroup.style.transform = '';
        portraitSection.style.transform = '';
        nameSection.style.transform = '';
        document.body.classList.remove('gpu-portrait', 'cursor-left', 'cursor-right');
        if (frameId !== null) cancelAnimationFrame(frameId);
        frameId = null;
        if (window.Contours) { window.Contours.resize(); window.Contours.draw(0); }
      } else {
        if (window.Fluid && !window.Fluid.ready && window.Fluid.init()) {
          window.Fluid.setBackground('assets/images/fluid-landscape.svg');
        }
        if (window.LiquidMask) window.LiquidMask.init();
        slideReady = parallaxReady = HAS_FINE_POINTER;
        lastFrame = performance.now();
        frameId = requestAnimationFrame(frame);
      }
    });
    document.body.classList.add('js-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
