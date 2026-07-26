/**
 * CONTACT — page controller
 *
 * The site is static with no backend, so there is nothing here that could
 * actually send mail. Rather than fake a submit that silently drops the
 * message, the form composes a `mailto:` draft and hands it to the visitor's
 * own mail client. The button and the note next to it say exactly that.
 */
(function () {
  'use strict';

  var ADDRESS = 'amrbinniyaz@gmail.com';

  /**
   * Build the mailto URL. Kept pure and separate from navigating to it, so the
   * encoding can be checked without launching a mail client.
   */
  function buildMailto(name, email, message) {
    var subject = name ? 'Portfolio enquiry from ' + name : 'Portfolio enquiry';

    var body = message;
    if (name || email) {
      body += '\n\n—\n';
      if (name) body += name + '\n';
      if (email) body += email + '\n';
    }

    // encodeURIComponent, not escape: an unencoded newline or & in the body
    // truncates the draft at the first special character.
    return 'mailto:' + ADDRESS
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);
  }

  function init() {
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    /* ── Compose ─────────────────────────────────────────── */
    var form = document.getElementById('composeForm');
    var note = document.getElementById('composeNote');

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var name = (document.getElementById('cName').value || '').trim();
        var email = (document.getElementById('cEmail').value || '').trim();
        var message = (document.getElementById('cMessage').value || '').trim();

        if (!message) {
          note.textContent = 'Add a message first — the rest is optional.';
          note.classList.add('is-error');
          document.getElementById('cMessage').focus();
          return;
        }

        note.classList.remove('is-error');

        window.location.href = buildMailto(name, email, message);

        note.textContent = 'Opening your mail app. If nothing happens, email '
          + ADDRESS + ' directly.';
      });
    }

    /* ── Shared page furniture ───────────────────────────── */
    if (window.Contours) window.Contours.init();
    if (window.Cursor) window.Cursor.init();
    if (window.CRTOverlay) window.CRTOverlay.init();
    if (window.Nav) window.Nav.init();
    if (window.Transition) window.Transition.enter();

    // Route internal links through the page transition, but leave mailto:,
    // tel: and external targets to the browser.
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      if (/^(mailto:|tel:|https?:)/i.test(href)) return;
      if (link.target === '_blank') return;

      e.preventDefault();
      var label = href === '/' ? 'HOME' : link.textContent.trim().toUpperCase();
      if (window.Transition) window.Transition.out(href, label, '#1a1614');
      else window.location.href = href;
    });

    var last = 0;
    requestAnimationFrame(function loop(ts) {
      var dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      if (window.Contours) window.Contours.draw(dt);
      if (window.Cursor) window.Cursor.update(0.12);
      if (window.CRTOverlay) window.CRTOverlay.drawGrain();
      requestAnimationFrame(loop);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.Contact = { buildMailto: buildMailto, address: ADDRESS };
})();
