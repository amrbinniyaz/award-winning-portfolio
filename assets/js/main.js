/**
 * MAIN — orchestrator
 *
 * Owns the single requestAnimationFrame loop and the shared pointer state.
 * Every effect module exposes an update/draw function; nothing else runs its
 * own loop, so ordering is explicit and there is one place to profile.
 *
 * Per-frame order matters:
 *   pointer smoothing → contours → fluid → liquid mask → slide/parallax →
 *   cursor → nav probe → grain
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
  var prevClientX = 0, prevClientY = 0;

  var side = null;                            // 'left' | 'center' | 'right'
  var slideOffset = 0, slideTarget = 0, slideReady = false;
  var paraPortrait = 0, paraName = 0, parallaxReady = false;

  var isIdle = true, idleTimer = null, idleClock = 0, idleSplatClock = 0;

  var lastFrame = 0;

  var slideGroup, portraitSection, nameSection;

  var lerp = function (a, b, t) { return a + (b - a) * t; };

  /* ── Idle behaviour ──────────────────────────────────────────
     After a period of stillness the fluid drives itself, so the page never
     looks frozen. Three streamers on different periods trace lissajous
     orbits around the portrait; tangential velocity gives them swirl. */

  function idleOrbit(dt) {
    idleClock += dt;

    // Drift the liquid mask on its own slow path.
    if (window.LiquidMask) {
      window.LiquidMask.setTarget(
        0.5 + Math.cos(idleClock * 0.44) * 0.32,
        0.38 + Math.sin(idleClock * 0.63) * 0.30
      );
    }

    if (!window.Fluid || !window.Fluid.ready) return;

    idleSplatClock += dt;
    if (idleSplatClock < 0.038) return;   // ~26Hz is plenty
    idleSplatClock = 0;

    var cx = window.innerWidth * 0.50;
    var cy = window.innerHeight * 0.44;
    var baseR = Math.min(window.innerWidth, window.innerHeight) * 0.15;

    [
      { speed: 0.52, radius: baseR * 1.00, phase: 0 },
      { speed: 0.33, radius: baseR * 1.55, phase: Math.PI * 0.667 },
      { speed: 0.74, radius: baseR * 0.72, phase: Math.PI * 1.333 },
    ].forEach(function (s) {
      var a = idleClock * s.speed + s.phase;
      window.Fluid.splat(
        cx + Math.cos(a) * s.radius,
        cy + Math.sin(a) * s.radius,
        -Math.sin(a) * s.speed * 0.0018,
        Math.cos(a) * s.speed * 0.0018
      );
    });
  }

  /* ── Frame ───────────────────────────────────────────────── */

  function frame(ts) {
    var dt = Math.min((ts - lastFrame) / 1000, 0.05);
    lastFrame = ts;

    smoothX = lerp(smoothX, pointerX, EASE.mouse || 0.08);
    smoothY = lerp(smoothY, pointerY, EASE.mouse || 0.08);

    if (isIdle) {
      idleOrbit(dt);
    } else {
      idleSplatClock = 0;
      if (window.LiquidMask) window.LiquidMask.setTarget(pointerX, pointerY);
    }

    if (window.Contours) window.Contours.draw(dt);
    if (window.Fluid && window.Fluid.ready) window.Fluid.tick();
    if (window.LiquidMask) {
      window.LiquidMask.update(
        window.__contourTime || 0,
        EASE.mask || 0.012
      );
    }

    // Content group slides away from the cursor's side.
    if (slideReady && slideGroup) {
      slideOffset = lerp(slideOffset, slideTarget, EASE.slide || 0.045);
      slideGroup.style.transform = 'translateX(' + slideOffset.toFixed(2) + 'px)';
    }

    // Vertical parallax. The portrait eases far slower than the nameplate,
    // which is what sells one as distant and the other as close.
    if (parallaxReady) {
      var target = pointerY - 0.5;
      paraPortrait = lerp(paraPortrait, target, 0.022);
      paraName = lerp(paraName, target, 0.09);
      if (portraitSection) {
        portraitSection.style.transform =
          'translateX(-50%) translateY(' + (paraPortrait * -45).toFixed(1) + 'px)';
      }
      if (nameSection) {
        // Bottom-anchored in CSS, so this is a plain offset — no -50% base.
        nameSection.style.transform =
          'translateY(' + (paraName * -15).toFixed(1) + 'px)';
      }
    }

    if (window.Cursor) window.Cursor.update(EASE.ring || 0.12);
    if (window.Nav) window.Nav.update();
    if (window.CRTOverlay) window.CRTOverlay.drawGrain();

    requestAnimationFrame(frame);
  }

  /* ── Pointer ─────────────────────────────────────────────── */

  function onPointerMove(e) {
    // Inject velocity into the fluid, scaled to viewport fraction.
    if (window.Fluid && window.Fluid.ready) {
      window.Fluid.splat(
        e.clientX, e.clientY,
        (e.clientX - prevClientX) / window.innerWidth,
        (e.clientY - prevClientY) / window.innerHeight
      );
    }
    prevClientX = e.clientX;
    prevClientY = e.clientY;

    pointerX = e.clientX / window.innerWidth;
    pointerY = e.clientY / window.innerHeight;

    // The slide and nameplate swap are hover-model interactions: they answer
    // "which half is the cursor in", which is meaningless without a cursor.
    //
    // This guard matters because tapping a touchscreen fires a SYNTHETIC
    // mousemove. Without it, a single tap sets slideTarget to ±250px and the
    // whole composition lurches sideways. The dedicated touchmove handler
    // never sets slideTarget, but the synthetic event bypasses it entirely.
    if (!HAS_FINE_POINTER) {
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
        slideTarget = SLIDE_PX;
        if (window.Nameplate) window.Nameplate.set(names.left, true);
      } else if (next === 'right') {
        document.body.classList.add('cursor-right');
        slideTarget = -SLIDE_PX;
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
    if (window.Fluid) {
      if (window.Fluid.init()) window.Fluid.setBackground('assets/images/fluid-bg.png');
    }
    if (window.LiquidMask) window.LiquidMask.init();
    if (window.Nameplate) window.Nameplate.init();
    if (window.Cursor) window.Cursor.init();
    if (window.CRTOverlay) window.CRTOverlay.init();
    if (window.Nav) window.Nav.init();

    wireSideNav();

    document.addEventListener('mousemove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', function () { isIdle = true; });

    // Touch devices get fluid on drag, but no slide/parallax (no hover model).
    document.addEventListener('touchmove', function (e) {
      var t = e.touches[0];
      if (!t) return;
      if (window.Fluid && window.Fluid.ready) {
        window.Fluid.splat(
          t.clientX, t.clientY,
          (t.clientX - prevClientX) / window.innerWidth,
          (t.clientY - prevClientY) / window.innerHeight
        );
      }
      prevClientX = t.clientX;
      prevClientY = t.clientY;
      isIdle = false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () { isIdle = true; }, IDLE_MS);
    }, { passive: true });

    if (window.Transition) window.Transition.enter();
    if (window.Preloader) window.Preloader.init();

    // Hold the interactive layers back until the boot sequence hands over,
    // so nothing slides around behind the CRT. Both are cursor-driven, so
    // neither is armed on touch — parallax reads pointerY, which touchmove
    // also updates, and would jolt the portrait vertically on every tap.
    document.addEventListener('preloader:done', function () {
      if (!HAS_FINE_POINTER) return;
      setTimeout(function () { slideReady = true; }, 400);
      setTimeout(function () { parallaxReady = true; }, 900);
    });

    idleTimer = setTimeout(function () { isIdle = true; }, IDLE_MS);
    requestAnimationFrame(function (ts) {
      lastFrame = ts;
      requestAnimationFrame(frame);
    });

    document.body.classList.add('js-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
