/**
 * CURSOR — dot + trailing ring
 *
 * The dot is written directly on every mousemove so it tracks the pointer with
 * no perceptible lag. The ring is eased toward it inside the render loop, which
 * is what produces the elastic trailing feel.
 *
 * Position is mirrored into sessionStorage so the next page can place the
 * cursor where it actually is before its first mousemove, instead of flashing
 * it in from a corner during a page transition.
 *
 * Exposes: window.Cursor.{ init, update, setPosition }
 */
(function () {
  'use strict';

  var dot = null, ring = null;
  var x = -200, y = -200;         // true pointer position
  var ringX = -200, ringY = -200; // eased ring position

  var HOVER_SELECTOR = 'a, button, [role="button"], input, textarea, select';

  function setPosition(px, py) {
    x = px; y = py;
    if (dot) {
      dot.style.left = px + 'px';
      dot.style.top = py + 'px';
    }
  }

  function update(ease) {
    if (!ring) return;
    ringX += (x - ringX) * ease;
    ringY += (y - ringY) * ease;
    ring.style.left = ringX.toFixed(2) + 'px';
    ring.style.top = ringY.toFixed(2) + 'px';
  }

  function init() {
    dot = document.getElementById('cursorDot');
    ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    // Restore where the pointer was on the previous page, if we came from one.
    var sx = parseFloat(sessionStorage.getItem('cursorX') || '');
    var sy = parseFloat(sessionStorage.getItem('cursorY') || '');
    if (!isNaN(sx) && !isNaN(sy)) {
      x = ringX = sx;
      y = ringY = sy;
    }
    setPosition(x, y);
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';

    document.addEventListener('mousemove', function (e) {
      setPosition(e.clientX, e.clientY);
      sessionStorage.setItem('cursorX', e.clientX);
      sessionStorage.setItem('cursorY', e.clientY);
    }, { passive: true });

    // Grow the ring over anything interactive.
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(HOVER_SELECTOR)) {
        document.body.classList.add('cursor-hover');
      }
    }, { passive: true });

    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(HOVER_SELECTOR)) {
        document.body.classList.remove('cursor-hover');
      }
    }, { passive: true });
  }

  window.Cursor = {
    init: init,
    update: update,
    setPosition: setPosition,
  };
})();
