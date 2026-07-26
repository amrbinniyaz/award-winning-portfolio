/**
 * LIQUID MASK — gooey metaball reveal
 *
 * Two independent reveal channels sit over the portrait:
 *
 *   1. SVG mask — six white circles pushed through a heavy blur and a steep
 *      alpha ramp. The blur makes overlapping circles bleed together and the
 *      ramp snaps the result back to hard edges, so they fuse into one organic
 *      blob instead of reading as six discs. This masks the illustration <img>.
 *
 *   2. Canvas composite — the same illustration drawn to a canvas, then
 *      clipped by the live fluid buffer via `destination-in`. This is why the
 *      illustration appears inside the drifting fluid shape.
 *
 * The blob chases the pointer at a deliberately very low easing constant. The
 * heavy lag IS the effect — it should feel like something viscous catching up,
 * not like a cursor follower.
 *
 * Exposes: window.LiquidMask.{ init, update, setTarget }
 */
(function () {
  'use strict';

  var blobs = [];
  var illustrationImg = null;
  var canvas = null, ctx = null;
  var frame = null;

  // Normalized target and current position, viewport space.
  var targetX = 0.5, targetY = 0.38;
  var x = 0.5, y = 0.38;

  var SVG_MARKUP = [
    '<svg class="liquid-defs" aria-hidden="true"',
    '     style="position:absolute;width:0;height:0;pointer-events:none">',
    '  <defs>',
    '    <filter id="gooey">',
    '      <feGaussianBlur in="SourceGraphic" stdDeviation="32" result="blur"/>',
    // The alpha row (0 0 0 25 -7) is the gooey trick: multiply alpha hard,
    // then bias it back down. Values between the blobs get pushed over the
    // threshold, so they merge; isolated soft edges get cut away.
    '      <feColorMatrix in="blur" mode="matrix"',
    '        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -7" result="goo"/>',
    '      <feBlend in="SourceGraphic" in2="goo"/>',
    '    </filter>',
    '    <mask id="liquidMask">',
    '      <g filter="url(#gooey)">',
    '        <circle id="blob1" cx="0" cy="0" r="180" fill="#fff"/>',
    '        <circle id="blob2" cx="0" cy="0" r="130" fill="#fff"/>',
    '        <circle id="blob3" cx="0" cy="0" r="100" fill="#fff"/>',
    '        <circle id="blob4" cx="0" cy="0" r="80"  fill="#fff"/>',
    '        <circle id="blob5" cx="0" cy="0" r="65"  fill="#fff"/>',
    '        <circle id="blob6" cx="0" cy="0" r="52"  fill="#fff"/>',
    '      </g>',
    '    </mask>',
    '  </defs>',
    '</svg>'
  ].join('\n');

  function setTarget(nx, ny) { targetX = nx; targetY = ny; }

  /** Reposition the six circles — satellites orbit the lead blob. */
  function positionBlobs(t) {
    if (!blobs[0] || !frame) return;

    var rect = frame.getBoundingClientRect();
    if (rect.width === 0) return;

    // Convert viewport-normalized position into the portrait's local space,
    // since the mask coordinate system is the masked element's own box.
    var lx = x * window.innerWidth - rect.left;
    var ly = y * window.innerHeight - rect.top;

    // Each satellite traces its own slow lissajous around the lead position.
    var offsets = [
      [0, 0],
      [Math.sin(t * 2.8) * 140,  Math.cos(t * 6.2) * 140],
      [Math.cos(t * 2.2) * 130,  Math.sin(t * 2.8) * 150],
      [-Math.sin(t * 3.1) * 120, -Math.cos(t * 2.1) * 160],
      [Math.cos(t * 4.0) * 110,  -Math.sin(t * 3.5) * 130],
      [-Math.cos(t * 1.9) * 135, Math.sin(t * 4.1) * 115],
    ];

    for (var i = 0; i < blobs.length; i++) {
      if (!blobs[i]) continue;
      blobs[i].setAttribute('cx', (lx + offsets[i][0]).toFixed(1));
      blobs[i].setAttribute('cy', (ly + offsets[i][1]).toFixed(1));
    }
  }

  /** Draw the illustration clipped to the live fluid shape. */
  function compositeIllustration() {
    if (!ctx || !illustrationImg || !illustrationImg.complete) return;
    if (!illustrationImg.naturalWidth) return;

    var fluidEl = document.getElementById('fluidCanvas');
    if (!fluidEl || !frame) return;

    var rect = frame.getBoundingClientRect();
    if (rect.width === 0) return;

    var cw = Math.round(rect.width);
    var ch = Math.round(rect.height);
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }

    // Contain-fit, anchored to the bottom to match the CSS object-position.
    var imgAR = illustrationImg.naturalWidth / illustrationImg.naturalHeight;
    var canAR = cw / ch;
    var dw, dh, dx, dy;
    if (imgAR > canAR) {
      dw = cw; dh = cw / imgAR;
      dx = 0;  dy = ch - dh;
    } else {
      dh = ch; dw = ch * imgAR;
      dx = (cw - dw) / 2; dy = 0;
    }

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(illustrationImg, dx, dy, dw, dh);

    // Keep only the pixels where the fluid canvas is opaque.
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(fluidEl, rect.left, rect.top, rect.width, rect.height, 0, 0, cw, ch);
    ctx.globalCompositeOperation = 'source-over';
  }

  function update(t, ease) {
    x += (targetX - x) * ease;
    y += (targetY - y) * ease;
    positionBlobs(t);
    compositeIllustration();
  }

  function init() {
    document.body.insertAdjacentHTML('afterbegin', SVG_MARKUP);

    blobs = ['blob1', 'blob2', 'blob3', 'blob4', 'blob5', 'blob6']
      .map(function (id) { return document.getElementById(id); });

    frame = document.getElementById('portraitFrame');
    canvas = document.getElementById('illustrationCanvas');
    if (canvas) ctx = canvas.getContext('2d');

    var src = document.getElementById('portraitIllustration');
    illustrationImg = new Image();
    illustrationImg.src = src ? src.getAttribute('src') : 'assets/images/portrait-illustration.webp';
  }

  window.LiquidMask = {
    init: init,
    update: update,
    setTarget: setTarget,
  };
})();
