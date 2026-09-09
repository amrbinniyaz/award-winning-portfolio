/** Centre-led typographic transition, followed by one downward page reveal. */
(function () {
  'use strict';
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var overlay, timer, busy = false;
  var panelEase = 'cubic-bezier(.77,0,.18,1)';
  var textEase = 'cubic-bezier(.65,0,.35,1)';

  function saved(key) {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  }
  function clearHandoff() {
    try { sessionStorage.removeItem('txLabel'); sessionStorage.removeItem('txColor'); } catch (e) {}
  }
  function reset() {
    clearTimeout(timer);
    var node = document.getElementById('pageOverlay');
    if (node) {
      node.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
      node.replaceChildren();
      node.className = '';
      node.style.cssText = '';
    }
    var cover = document.getElementById('txInitCover');
    if (cover) cover.remove();
    document.body.classList.remove('is-transitioning', 'on-dark');
    document.documentElement.classList.remove('tx-pending');
    busy = false;
  }
  function prepare(color) {
    overlay = document.getElementById('pageOverlay');
    if (!overlay) return false;
    overlay.replaceChildren();
    overlay.style.setProperty('--tx-color', color || '#1a1614');
    overlay.className = 'tx-active';
    document.body.classList.add('is-transitioning', 'on-dark');
    return true;
  }
  function prefetch(url) {
    if (navigator.connection && navigator.connection.saveData) return;
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }
  function out(url, text, color) {
    if (busy) return;
    if (motion.matches || !Element.prototype.animate) {
      clearHandoff();
      window.location.href = url;
      return;
    }
    if (!prepare(color)) { window.location.href = url; return; }
    busy = true;
    try {
      sessionStorage.setItem('txLabel', text || 'LOADING');
      sessionStorage.setItem('txColor', color || '#1a1614');
    } catch (e) {}
    prefetch(url);

    ['left', 'centre', 'right'].forEach(function (side) {
      var panel = document.createElement('div');
      panel.className = 'tx-panel tx-panel--' + side;
      overlay.appendChild(panel);
      panel.animate([
        { transform: 'translateY(105%)' },
        { transform: 'translateY(0)' }
      ], { duration: 600, delay: side === 'centre' ? 10 : 120, easing: panelEase, fill: 'both' });
    });

    var words = document.createElement('div');
    words.className = 'tx-words';
    var count = Math.max(14, Math.ceil(window.innerHeight / 50) + 2);
    for (var i = 0; i < count; i++) {
      var word = document.createElement('span');
      word.textContent = text || 'LOADING';
      words.appendChild(word);
    }
    overlay.appendChild(words);
    words.animate([
      { clipPath: 'inset(0 0 100% 0)', offset: 0 },
      { clipPath: 'inset(0 0 100% 0)', offset: 480 / 2060, easing: textEase },
      { clipPath: 'inset(0 0 0 0)', offset: 1330 / 2060 },
      { clipPath: 'inset(0 0 0 0)', offset: 1410 / 2060, easing: textEase },
      { clipPath: 'inset(100% 0 0 0)', offset: 1 }
    ], { duration: 2060, fill: 'both' });
    timer = setTimeout(function () { window.location.href = url; }, 2200);
  }
  function enter() {
    var text = saved('txLabel');
    var color = saved('txColor');
    clearHandoff();
    if (text === null || motion.matches || !Element.prototype.animate) { reset(); return; }
    if (!prepare(color)) { reset(); return; }
    busy = true;
    overlay.classList.add('tx-arriving');
    var cover = document.getElementById('txInitCover');
    if (cover) cover.remove();
    var reveal = overlay.animate([
      { transform: 'translateY(0)' },
      { transform: 'translateY(100%)' }
    ], { delay: 400, duration: 750, easing: 'ease', fill: 'both' });
    reveal.finished.then(reset, function () {});
  }
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) { clearHandoff(); reset(); }
  });
  // Cover ordinary home/footer links as well as the page-specific handlers.
  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    var destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin || !/^https?:$/.test(destination.protocol)) return;
    if (destination.pathname === location.pathname && destination.search === location.search) return;
    event.preventDefault();
    var home = destination.pathname === '/' || /\/index\.html$/.test(destination.pathname);
    out(destination.href, home ? 'HOME' : link.textContent.trim(), link.dataset.color || '#1a1614');
  });
  window.Transition = { out: out, enter: enter };
})();
