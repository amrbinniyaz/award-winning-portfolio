/**
 * NAMEPLATE — slot-machine lettering
 *
 * Each letter is a fixed-height window ("slot") containing a vertical strip of
 * glyphs ("reel"). To change a letter, a few random glyphs are stacked above
 * the target and the reel is translated up by exactly N × glyph-height, so it
 * lands on the target with no rounding drift.
 *
 * Once a reel lands it is collapsed back to a single glyph at translateY(0).
 * That reset matters: without it the DOM grows on every swap and the
 * transforms accumulate float error until letters sit visibly off-baseline.
 *
 * Exposes: window.Nameplate.{ init, set }
 */
(function () {
  'use strict';

  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  var display = null;
  var current = '';
  var animating = false;

  function makeSlot() {
    var el = document.createElement('div');
    el.className = 'name-slot';
    return el;
  }

  function makeChar(ch) {
    var el = document.createElement('span');
    el.className = 'name-char';
    el.textContent = ch;
    return el;
  }

  function makeReel(slot) {
    var old = slot.querySelector('.name-reel');
    if (old) old.remove();
    var reel = document.createElement('div');
    reel.className = 'name-reel';
    slot.appendChild(reel);
    return reel;
  }

  /** Measure a glyph off-screen — widths are per-character in a condensed face. */
  function measure(ch) {
    var probe = makeChar(ch);
    probe.style.visibility = 'hidden';
    probe.style.position = 'absolute';
    display.appendChild(probe);
    var box = probe.getBoundingClientRect();
    probe.remove();
    return { w: box.width, h: box.height };
  }

  function glyphHeight() { return measure('A').h; }

  function set(name, animate) {
    if (!display) return;
    if (current === name) return;
    if (animate && animating) return;

    current = name;
    var existing = display.querySelectorAll('.name-slot');

    // Retire surplus slots — CSS collapses width and opacity, then we remove.
    for (var k = name.length; k < existing.length; k++) {
      (function (slot) {
        slot.classList.add('exiting');
        setTimeout(function () { slot.remove(); }, 420);
      })(existing[k]);
    }

    if (!animate) {
      name.split('').forEach(function (ch, i) {
        var slot = existing[i] || makeSlot();
        if (!existing[i]) display.appendChild(slot);
        slot.style.width = measure(ch).w + 'px';
        slot.style.opacity = '1';
        var reel = makeReel(slot);
        reel.style.transition = 'none';
        reel.style.transform = 'translateY(0)';
        reel.appendChild(makeChar(ch));
      });
      return;
    }

    animating = true;
    var h = glyphHeight();
    var lastIndex = name.length - 1;

    name.split('').forEach(function (ch, i) {
      var spins = 2 + Math.floor(Math.random() * 3);
      var slot = existing[i];

      // A slot that doesn't exist yet grows in from zero width.
      if (!slot) {
        slot = makeSlot();
        slot.style.width = '0';
        slot.style.opacity = '0';
        display.appendChild(slot);
      }

      var reel = makeReel(slot);
      reel.style.transition = 'none';
      reel.style.transform = 'translateY(0)';

      for (var s = 0; s < spins; s++) {
        reel.appendChild(makeChar(GLYPHS[Math.floor(Math.random() * GLYPHS.length)]));
      }
      reel.appendChild(makeChar(ch));

      // Stagger per letter, with a little jitter so it doesn't read mechanical.
      var delay = i * 70 + Math.random() * 35;
      var duration = 380 + spins * 130;

      setTimeout(function () {
        slot.style.width = measure(ch).w + 'px';
        slot.style.opacity = '1';

        reel.style.transition = 'transform ' + duration + 'ms cubic-bezier(0.25,0.46,0.45,0.94)';
        reel.style.transform = 'translateY(-' + (spins * h) + 'px)';

        // Collapse to the resting state once the spin finishes.
        setTimeout(function () {
          reel.style.transition = 'none';
          reel.style.transform = 'translateY(0)';
          reel.innerHTML = '';
          reel.appendChild(makeChar(ch));
          if (i === lastIndex) animating = false;
        }, duration + 20);
      }, delay);
    });
  }

  function init() {
    display = document.getElementById('nameDisplay');
    if (!display) return;
    var names = (window.SiteConfig && window.SiteConfig.names) || { left: 'YOUR', right: 'NAME' };
    set(names.left, false);
  }

  window.Nameplate = {
    init: init,
    set: set,
    get isAnimating() { return animating; },
    get current() { return current; },
  };
})();
