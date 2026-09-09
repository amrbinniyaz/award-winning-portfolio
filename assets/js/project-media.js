/** Lightweight portfolio previews. Only visible, permitted videos play;
 * long-page thumbnails use a measured CSS translation instead of an iframe.
 */
(function () {
  'use strict';
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var previews = [];

  function sync(item) {
    var allowed = item.manual || (!motion.matches && !(navigator.connection && navigator.connection.saveData));
    var card = item.video.closest('.work-card');
    var shouldPlay = item.visible && !document.hidden && !card.classList.contains('is-hidden') && !item.paused && allowed && !item.failed;
    if (!shouldPlay) {
      item.video.pause();
      item.button.textContent = 'Play preview';
      item.button.setAttribute('aria-label', 'Play animation preview for ' + item.title);
      return;
    }
    if (!item.video.getAttribute('src')) item.video.src = item.video.dataset.src;
    var play = item.video.play();
    if (play) play.catch(function () {
      item.paused = true;
      item.button.textContent = 'Play preview';
      item.button.setAttribute('aria-label', 'Play animation preview for ' + item.title);
    });
  }

  function refresh() { previews.forEach(sync); }

  function init(root) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var item = previews.find(function (p) { return p.video === entry.target; });
        if (item) { item.visible = entry.isIntersecting; sync(item); }
      });
    }, { threshold: 0.15 });

    root.querySelectorAll('video[data-preview]').forEach(function (video) {
      var card = video.closest('.work-card');
      var button = card.querySelector('.preview-toggle');
      var item = { video: video, button: button, title: card.querySelector('.work-title').textContent, visible: false, paused: false, manual: false, failed: false };
      previews.push(item);
      video.addEventListener('playing', function () {
        video.classList.add('is-playing');
        button.textContent = 'Pause preview';
        button.setAttribute('aria-label', 'Pause animation preview for ' + item.title);
      });
      video.addEventListener('pause', function () { video.classList.remove('is-playing'); });
      video.addEventListener('error', function () {
        item.failed = true;
        video.classList.remove('is-playing');
        button.hidden = true;
      });
      button.addEventListener('click', function () {
        if (!video.paused) item.paused = true;
        else { item.paused = false; item.manual = true; }
        sync(item);
      });
      observer.observe(video);
    });

    root.querySelectorAll('.work-media--scroll').forEach(function (media) {
      var img = media.querySelector('img');
      function measure() {
        if (!img.naturalWidth) return;
        var distance = Math.max(0, media.clientWidth * img.naturalHeight / img.naturalWidth - media.clientHeight);
        media.style.setProperty('--preview-travel', -distance + 'px');
        media.style.setProperty('--preview-duration', Math.max(7, Math.min(18, distance / 180)) + 's');
      }
      img.addEventListener('load', measure);
      new ResizeObserver(measure).observe(media);
      measure();
    });

    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('pagehide', function () { previews.forEach(function (p) { p.video.pause(); }); });
    window.addEventListener('pageshow', refresh);
    motion.addEventListener('change', function () {
      previews.forEach(function (p) { p.manual = false; });
      refresh();
    });
  }
  window.ProjectMedia = { init: init, refresh: refresh };
})();
