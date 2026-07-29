/**
 * ANALYTICS
 *
 * Loads the self-hosted Umami tracker and exposes a track() the rest of the
 * site can call without knowing what's behind it.
 *
 * Umami's documented snippet is a <script> in <head>. This injects it from the
 * footer instead, alongside every other module: the tracker is the least
 * important byte on the page and has no business competing with the LCP image
 * for bandwidth. A pageview recorded a few hundred ms later is the same
 * pageview.
 *
 * Self-initializing, unlike the other modules — it has to run on all five
 * pages, and each one boots through a different page script.
 */
window.Analytics = (function () {
  var cfg = (window.SiteConfig && window.SiteConfig.analytics) || {};

  function load() {
    // No id configured — stay silent rather than firing requests at a tracker
    // that would reject them anyway.
    if (!cfg.src || !cfg.websiteId) return;

    var s = document.createElement('script');
    s.src = cfg.src;
    s.defer = true;
    s.setAttribute('data-website-id', cfg.websiteId);
    if (cfg.domains) s.setAttribute('data-domains', cfg.domains);
    document.head.appendChild(s);
  }

  /**
   * Fire a named event. Safe to call before the tracker has loaded and safe
   * when it never will — a blocked or missing tracker must cost nothing.
   */
  function track(name, data) {
    try {
      if (window.umami) window.umami.track(name, data);
    } catch (e) { /* analytics is never worth breaking a page over */ }
  }

  function init() {
    load();

    // The CV is the one real download on the site and the clearest sign a
    // visit went somewhere. Scoped to the PDF specifically — resume.html
    // reuses .cv-download for a link through to projects.
    var cv = document.querySelector('a.cv-download[href$=".pdf"]');
    if (cv) cv.addEventListener('click', function () { track('cv-download'); });
  }

  // Deferred scripts run after parsing but before DOMContentLoaded, so the DOM
  // is already there; the listener is only a guard for a non-deferred include.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { track: track };
})();
