/**
 * CRT OVERLAY — persistent screen furniture
 *
 * Gives the whole page the shape and texture of a CRT tube:
 *
 *   · A barrel-curved viewport built with `clip-path: path()`. The frame
 *     element uses an evenodd path (full rect MINUS the barrel) so it paints
 *     only the corners; the bevel and stroke use the barrel path directly.
 *   · Per-pixel grain, redrawn every 5th frame — full-rate noise is both
 *     needlessly expensive and reads as harsh flicker.
 *
 * Exposes: window.CRTOverlay.{ init, drawGrain }
 */
(function () {
  'use strict';

  var grainCanvas = null, grainCtx = null, grainImage = null;
  var grainTick = 0;

  var GRAIN_W = 480, GRAIN_H = 270;   // upscaled by CSS; cheap and looks right

  /**
   * Barrel path: corners inset by `inset`, sides bowing outward to the very
   * edge via quadratic control points. Returns { inner, outer }.
   */
  function barrelPaths(W, H) {
    var isSmall = W <= 768;
    var inset = isSmall ? 12 : 38;   // corner inset
    var bulge = isSmall ? 4 : 8;     // how far the side midpoints bow out
    var r = isSmall
      ? Math.min(Math.max(18, W * 0.03), 28)
      : Math.min(Math.max(40, W * 0.042), 70);

    var inner = [
      'M ' + (inset + r) + ',' + inset,
      'Q ' + (W / 2) + ',' + bulge + ' ' + (W - inset - r) + ',' + inset,
      'Q ' + (W - inset) + ',' + inset + ' ' + (W - inset) + ',' + (inset + r),
      'Q ' + (W - bulge) + ',' + (H / 2) + ' ' + (W - inset) + ',' + (H - inset - r),
      'Q ' + (W - inset) + ',' + (H - inset) + ' ' + (W - inset - r) + ',' + (H - inset),
      'Q ' + (W / 2) + ',' + (H - bulge) + ' ' + (inset + r) + ',' + (H - inset),
      'Q ' + inset + ',' + (H - inset) + ' ' + inset + ',' + (H - inset - r),
      'Q ' + bulge + ',' + (H / 2) + ' ' + inset + ',' + (inset + r),
      'Q ' + inset + ',' + inset + ' ' + (inset + r) + ',' + inset,
      'Z'
    ].join(' ');

    var outer = 'M 0,0 L ' + W + ',0 L ' + W + ',' + H + ' L 0,' + H + ' Z';

    return { inner: inner, outer: outer };
  }

  function applyShape() {
    var W = window.innerWidth;
    var H = window.innerHeight;
    var p = barrelPaths(W, H);

    var frame = document.querySelector('.page-tv-frame');
    if (frame) {
      // evenodd: rect minus barrel = just the rounded corner fills.
      frame.style.clipPath = "path(evenodd, '" + p.outer + ' ' + p.inner + "')";
      frame.style.visibility = 'visible';
    }

    var bevel = document.querySelector('.page-crt-bevel');
    if (bevel) bevel.style.clipPath = "path('" + p.inner + "')";

    var svg = document.querySelector('.page-tv-stroke');
    if (svg) {
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.style.clipPath = "path('" + p.inner + "')";
      svg.innerHTML = '';
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', p.inner);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'rgba(30,28,26,0.10)');
      path.setAttribute('stroke-width', '6');
      svg.appendChild(path);
    }
  }

  function drawGrain() {
    if (!grainCtx) return;
    grainTick++;
    if (grainTick % 5 !== 0) return;

    var d = grainImage.data;
    for (var i = 0; i < d.length; i += 4) {
      var v = (Math.random() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = v;
    }
    grainCtx.putImageData(grainImage, 0, 0);
  }

  function initGrain() {
    grainCanvas = document.getElementById('pageGrainCanvas');
    if (!grainCanvas) return;
    grainCanvas.width = GRAIN_W;
    grainCanvas.height = GRAIN_H;
    grainCtx = grainCanvas.getContext('2d');
    grainImage = grainCtx.createImageData(GRAIN_W, GRAIN_H);

    // Alpha is constant — only luminance changes frame to frame.
    var d = grainImage.data;
    for (var i = 3; i < d.length; i += 4) d[i] = 255;
  }

  function init() {
    initGrain();
    applyShape();

    var pending = null;
    function onViewportChange() {
      if (pending) cancelAnimationFrame(pending);
      pending = requestAnimationFrame(applyShape);
    }

    window.addEventListener('resize', onViewportChange);
    if (window.visualViewport) {
      // Mobile browser chrome sliding in and out changes the usable height.
      window.visualViewport.addEventListener('resize', onViewportChange);
      window.visualViewport.addEventListener('scroll', onViewportChange);
    }
  }

  window.CRTOverlay = {
    init: init,
    drawGrain: drawGrain,
    barrelPaths: barrelPaths,
  };
})();
