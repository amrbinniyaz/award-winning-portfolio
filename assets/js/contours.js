/**
 * CONTOURS — animated topographic map
 *
 * A height field is built from a handful of Gaussian peaks that slowly drift
 * and breathe. Marching squares then traces iso-lines through it, which reads
 * as a topographic survey map that never quite settles.
 *
 * Contour levels are FIXED (not scrolled over time) on purpose: shifting the
 * levels makes lines pop in and out at the extremes, which is very visible and
 * looks like a bug. Moving the terrain instead keeps every line continuous.
 *
 * Exposes: window.Contours.{ draw, resize, time }
 */
(function () {
  'use strict';

  var canvas, ctx;
  var grid = null;            // Float32Array height field, reused every frame
  var time = 0;
  var isMobile = window.innerWidth < 768;
  var mobileDrawn = false;

  /* Peaks: [x, y, spreadX, spreadY, amplitude] in normalized space. */
  var PEAKS = [
    [0.20, 0.40, 0.22, 0.28, 1.00],
    [0.72, 0.28, 0.26, 0.30, 1.00],
    [0.48, 0.72, 0.24, 0.20, 0.90],
    [0.05, 0.60, 0.18, 0.24, 0.80],
    [0.92, 0.55, 0.20, 0.26, 0.80],
    [0.38, 0.05, 0.22, 0.18, 0.70],
    [0.75, 0.90, 0.20, 0.22, 0.70],
    [0.15, 0.92, 0.18, 0.20, 0.60],
    [0.46, 0.34, 0.14, 0.18, 0.50],
  ];

  // Bracketed to the field's actual range (~0.39–2.27 for the peaks above).
  // Levels outside it would simply render nothing, wasting draw passes and
  // thinning the map out.
  var LEVEL_MIN = 0.46;
  var LEVEL_MAX = 2.24;
  var LEVEL_COUNT = 18;
  var INDEX_EVERY = 4;   // every Nth line is a heavier "index contour"

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    isMobile = window.innerWidth < 768;
    mobileDrawn = false;   // resize clears the canvas, so allow one redraw
  }

  /** Fill `grid` with the height field for the current time. */
  function evaluateField(gw, gh) {
    var total = (gw + 1) * (gh + 1);
    if (!grid || grid.length !== total) grid = new Float32Array(total);

    var t = time * 0.5;
    var stride = gw + 1;

    for (var row = 0; row <= gh; row++) {
      var ny = row / gh;
      var base = row * stride;

      for (var col = 0; col <= gw; col++) {
        var nx = col / gw;
        var h = 0;

        for (var p = 0; p < PEAKS.length; p++) {
          var pk = PEAKS[p];
          // Each peak drifts and pulses on its own phase so the field never
          // repeats visibly.
          var driftX = 0.014 * Math.sin(t * 0.08 + p * 2.1);
          var driftY = 0.010 * Math.cos(t * 0.10 + p * 1.7);
          var amp = pk[4] * (1 + 0.18 * Math.sin(t * 0.28 + p * 0.9));

          var dx = (nx - pk[0] - driftX) / pk[2];
          var dy = (ny - pk[1] - driftY) / pk[3];
          h += amp * Math.exp(-0.5 * (dx * dx + dy * dy));
        }

        grid[base + col] = h;
      }
    }
  }

  function draw(dt) {
    if (!ctx || !canvas) return;

    // Phones redraw once and stop — the field animation is not worth the
    // battery, and at that size the motion barely reads anyway.
    if (isMobile) {
      if (mobileDrawn) return;
      mobileDrawn = true;
    }

    time += dt;
    window.__contourTime = time;

    var W = canvas.width, H = canvas.height;
    var gw = isMobile ? 60 : 140;
    var gh = isMobile ? 40 : 100;

    ctx.clearRect(0, 0, W, H);
    evaluateField(gw, gh);

    var cellW = W / gw, cellH = H / gh;
    var stride = gw + 1;
    var spacing = (LEVEL_MAX - LEVEL_MIN) / (LEVEL_COUNT - 1);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (var li = 0; li < LEVEL_COUNT; li++) {
      var lv = LEVEL_MIN + li * spacing;
      var isIndex = li % INDEX_EVERY === 0;

      ctx.beginPath();
      ctx.lineWidth = isIndex ? 1.4 : 0.65;
      ctx.strokeStyle = isIndex
        ? 'rgba(160,115,20,0.42)'
        : 'rgba(180,140,50,0.17)';

      for (var row = 0; row < gh; row++) {
        var r0 = row * stride, r1 = (row + 1) * stride;
        var y0 = row * cellH, y1 = y0 + cellH;

        for (var col = 0; col < gw; col++) {
          var h00 = grid[r0 + col],     h10 = grid[r0 + col + 1];
          var h11 = grid[r1 + col + 1], h01 = grid[r1 + col];

          // Corner-above-level bitmask → one of 16 marching-squares cases.
          var mc = (h00 > lv ? 1 : 0)
                 | (h10 > lv ? 2 : 0)
                 | (h11 > lv ? 4 : 0)
                 | (h01 > lv ? 8 : 0);
          if (mc === 0 || mc === 15) continue;   // fully out / fully in

          var x0 = col * cellW, x1 = x0 + cellW;

          // Linear interpolation for each edge crossing. Only the edges the
          // case actually needs get computed.
          var tT, tB, tL, tR;

          switch (mc) {
            case 1: case 14:
              tT = (lv - h00) / (h10 - h00);
              tL = (lv - h00) / (h01 - h00);
              ctx.moveTo(x0 + tT * cellW, y0);
              ctx.lineTo(x0, y0 + tL * cellH);
              break;

            case 2: case 13:
              tT = (lv - h00) / (h10 - h00);
              tR = (lv - h10) / (h11 - h10);
              ctx.moveTo(x0 + tT * cellW, y0);
              ctx.lineTo(x1, y0 + tR * cellH);
              break;

            case 3: case 12:
              tL = (lv - h00) / (h01 - h00);
              tR = (lv - h10) / (h11 - h10);
              ctx.moveTo(x0, y0 + tL * cellH);
              ctx.lineTo(x1, y0 + tR * cellH);
              break;

            case 4: case 11:
              tR = (lv - h10) / (h11 - h10);
              tB = (lv - h01) / (h11 - h01);
              ctx.moveTo(x1, y0 + tR * cellH);
              ctx.lineTo(x0 + tB * cellW, y1);
              break;

            case 6: case 9:
              tT = (lv - h00) / (h10 - h00);
              tB = (lv - h01) / (h11 - h01);
              ctx.moveTo(x0 + tT * cellW, y0);
              ctx.lineTo(x0 + tB * cellW, y1);
              break;

            case 7: case 8:
              tL = (lv - h00) / (h01 - h00);
              tB = (lv - h01) / (h11 - h01);
              ctx.moveTo(x0, y0 + tL * cellH);
              ctx.lineTo(x0 + tB * cellW, y1);
              break;

            // Saddle cases — two separate segments through one cell.
            case 5:
              tT = (lv - h00) / (h10 - h00);
              tL = (lv - h00) / (h01 - h00);
              tR = (lv - h10) / (h11 - h10);
              tB = (lv - h01) / (h11 - h01);
              ctx.moveTo(x0 + tT * cellW, y0);
              ctx.lineTo(x0, y0 + tL * cellH);
              ctx.moveTo(x1, y0 + tR * cellH);
              ctx.lineTo(x0 + tB * cellW, y1);
              break;

            case 10:
              tT = (lv - h00) / (h10 - h00);
              tR = (lv - h10) / (h11 - h10);
              tL = (lv - h00) / (h01 - h00);
              tB = (lv - h01) / (h11 - h01);
              ctx.moveTo(x0 + tT * cellW, y0);
              ctx.lineTo(x1, y0 + tR * cellH);
              ctx.moveTo(x0, y0 + tL * cellH);
              ctx.lineTo(x0 + tB * cellW, y1);
              break;
          }
        }
      }

      ctx.stroke();
    }
  }

  function init() {
    canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  window.Contours = {
    init: init,
    draw: draw,
    resize: resize,
    get time() { return time; },
  };
})();
