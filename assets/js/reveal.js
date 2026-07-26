/**
 * REVEAL — scroll-in animation for grids and galleries
 *
 * Deliberately NOT IntersectionObserver. IO only fires when an element's
 * intersection state actually changes during a rendered frame, so anything a
 * fast scroll jumps clean past — a scrollbar drag, an anchor jump, a restored
 * scroll position — never fires and stays stuck at opacity 0 permanently.
 *
 * A rAF-throttled sweep is correct at any scroll speed. The cost is trivial
 * here: elements are dropped from the pending list once shown, and the
 * listeners detach the moment that list empties, so a fully-revealed page
 * does no work at all.
 *
 * Usage:
 *   var handle = Reveal.watch(nodes, { stagger: 90 });
 *   handle.cancel();   // e.g. before re-watching after a filter change
 */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CLASS = 'is-in';

  function watch(nodes, options) {
    options = options || {};
    var stagger = options.stagger || 0;
    // Reveal slightly before the element's top reaches the bottom edge.
    var trigger = options.trigger || 0.92;

    var pending = Array.prototype.slice.call(nodes);
    if (!pending.length) return { cancel: function () {} };

    if (REDUCED) {
      pending.forEach(function (n) { n.classList.add(CLASS); });
      return { cancel: function () {} };
    }

    var ticking = false;
    var cancelled = false;

    function detach() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }

    function sweep() {
      ticking = false;
      if (cancelled) return;

      var limit = window.innerHeight * trigger;
      var ready = [];

      // Forward pass keeps document order, so the stagger cascades downward.
      for (var i = 0; i < pending.length; i++) {
        if (pending[i].getBoundingClientRect().top < limit) ready.push(pending[i]);
      }

      if (ready.length) {
        ready.forEach(function (node, idx) {
          var index = pending.indexOf(node);
          if (index !== -1) pending.splice(index, 1);
          if (stagger) {
            setTimeout(function () { node.classList.add(CLASS); }, idx * stagger);
          } else {
            node.classList.add(CLASS);
          }
        });
      }

      if (!pending.length) detach();
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(sweep);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    sweep();   // catch whatever is already on screen

    return {
      cancel: function () { cancelled = true; detach(); },
    };
  }

  window.Reveal = { watch: watch };
})();
