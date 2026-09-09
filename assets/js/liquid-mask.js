/** Align the GPU portrait with its responsive DOM frame.
 * Measure only on resize. The orchestrator supplies its current transforms,
 * avoiding a forced layout between DOM writes and the WebGL display pass.
 */
(function () {
  'use strict';
  var frame, section, observer;
  var rect = { left: 0, top: 0, width: 1, height: 1 };
  var originX = 0, originY = 0;

  function measure() {
    if (!frame || !section) return;
    rect.width = frame.offsetWidth;
    rect.height = frame.offsetHeight;
    originX = (window.innerWidth - rect.width) / 2;
    originY = window.innerHeight - parseFloat(getComputedStyle(section).bottom) - rect.height;
  }

  function update(slide, parallax) {
    if (!frame || !window.Fluid || !window.Fluid.ready) return;
    rect.left = originX + (slide || 0);
    rect.top = originY + (parallax || 0);
    window.Fluid.setPortraitRect(rect);
  }

  function init() {
    frame = document.getElementById('portraitFrame');
    section = document.getElementById('portraitSection');
    var base = document.getElementById('portraitBase');
    var art = document.getElementById('portraitIllustration');
    if (base && art && window.Fluid && window.Fluid.ready) {
      window.Fluid.setPortrait(base.src, art.src);
    }
    measure();
    update();
    if (!observer && frame) {
      observer = new ResizeObserver(measure);
      observer.observe(frame);
      window.addEventListener('resize', measure);
    }
  }
  window.LiquidMask = { init: init, update: update };
})();
