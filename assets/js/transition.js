/**
 * TRANSITION — between-page wipe
 *
 * Leaving:  three panels sweep up from the bottom (centre first, then the
 *           flanks), the destination label fades in, then navigation fires.
 * Arriving: the same panels are already up and sweep away downward.
 *
 * The label and tint are handed across the navigation boundary through
 * sessionStorage, since the outgoing page's JS is destroyed on unload. An
 * inline script in <head> paints a same-colour cover immediately on the new
 * page, so there's no white flash before this module initialises.
 *
 * Exposes: window.Transition.{ out, in }
 */
(function () {
  'use strict';

  var KEY_LABEL = 'txLabel';
  var KEY_COLOR = 'txColor';

  var TIMING = {
    panelStagger: 90,    // delay between centre panel and the flanks
    fillMs:       620,   // panels sweeping in
    labelIn:      260,
    hold:         420,   // label held at full opacity
    unfillMs:     620,   // panels sweeping out
    navDelay:     1500,  // fill + hold + buffer, before location changes
  };

  var overlay = null;
  var label = null;
  var panels = [];

  function buildPanels(color) {
    overlay = document.getElementById('pageOverlay');
    label = document.getElementById('overlayLabel');
    if (!overlay) return false;

    // Remove any panels from a previous run.
    overlay.querySelectorAll('.tx-panel').forEach(function (p) { p.remove(); });
    panels = [];

    var widths = ['34%', '33%', '33%'];
    var lefts = ['0%', '34%', '67%'];
    // Centre leads, flanks follow — reads as an iris rather than a flat wipe.
    var order = [1, 0, 2];

    for (var i = 0; i < 3; i++) {
      var p = document.createElement('div');
      p.className = 'tx-panel';
      p.style.left = lefts[i];
      p.style.width = widths[i];
      if (color) p.style.setProperty('--tx-color', color);
      p.dataset.order = order[i];
      overlay.appendChild(p);
      panels.push(p);
    }

    return true;
  }

  function setPanels(scale, ms, origin) {
    panels.forEach(function (p) {
      var delay = parseInt(p.dataset.order, 10) * TIMING.panelStagger;
      p.style.transformOrigin = origin;
      p.style.transition = 'transform ' + ms + 'ms cubic-bezier(0.22,1,0.36,1) ' + delay + 'ms';
      p.style.transform = 'scaleY(' + scale + ')';
    });
  }

  /** Play the outgoing wipe, then navigate. */
  function out(url, text, color) {
    if (!buildPanels(color)) { window.location.href = url; return; }

    sessionStorage.setItem(KEY_LABEL, text || 'LOADING');
    sessionStorage.setItem(KEY_COLOR, color || '');

    if (overlay) overlay.style.pointerEvents = 'all';
    // Panels are dark; without this the cursor disappears into them.
    document.body.classList.add('on-dark');

    setPanels(1, TIMING.fillMs, 'bottom center');

    if (label) {
      label.textContent = text || '';
      setTimeout(function () {
        label.style.transition = 'opacity ' + TIMING.labelIn + 'ms ease';
        label.style.opacity = '1';
      }, TIMING.labelIn);
    }

    setTimeout(function () { window.location.href = url; }, TIMING.navDelay);
  }

  /** If we arrived from a transition, sweep the panels away. */
  function enter() {
    var text = sessionStorage.getItem(KEY_LABEL);
    if (text === null) return;   // direct load, nothing to undo

    var color = sessionStorage.getItem(KEY_COLOR) || '';
    sessionStorage.removeItem(KEY_LABEL);
    sessionStorage.removeItem(KEY_COLOR);

    if (!buildPanels(color)) return;

    // Start covered, no transition, then release on the next frame.
    panels.forEach(function (p) {
      p.style.transition = 'none';
      p.style.transformOrigin = 'top center';
      p.style.transform = 'scaleY(1)';
    });

    if (label) {
      label.textContent = text;
      label.style.transition = 'none';
      label.style.opacity = '1';
    }

    // Drop the anti-flash cover the inline head script put up.
    var cover = document.getElementById('txInitCover');
    if (cover) cover.remove();

    // Page arrives fully covered by dark panels — keep the cursor light until
    // they have swept away.
    document.body.classList.add('on-dark');

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (label) {
          label.style.transition = 'opacity 320ms ease';
          label.style.opacity = '0';
        }
        setPanels(0, TIMING.unfillMs, 'top center');
        setTimeout(function () {
          if (overlay) overlay.style.pointerEvents = 'none';
          panels.forEach(function (p) { p.remove(); });
          panels = [];
          document.body.classList.remove('on-dark');
        }, TIMING.unfillMs + TIMING.panelStagger * 2 + 60);
      });
    });
  }

  // Back/forward from the bfcache restores a page mid-transition; reset it.
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    sessionStorage.removeItem(KEY_LABEL);
    sessionStorage.removeItem(KEY_COLOR);
    var o = document.getElementById('pageOverlay');
    if (o) {
      o.querySelectorAll('.tx-panel').forEach(function (p) { p.remove(); });
      o.style.pointerEvents = 'none';
    }
    var l = document.getElementById('overlayLabel');
    if (l) l.style.opacity = '0';
    // Otherwise a back-navigation restores the page with the cursor still
    // inverted for panels that are no longer there.
    document.body.classList.remove('on-dark');
  });

  window.Transition = {
    out: out,
    enter: enter,
  };
})();
