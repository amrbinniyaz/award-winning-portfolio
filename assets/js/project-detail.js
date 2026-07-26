/**
 * PROJECT DETAIL
 *
 * Renders a single project from `?slug=`. Six of the twelve projects carry
 * only a cover image and no gallery or copy, so the layout is built to look
 * deliberate when that is all there is: the hero simply becomes the piece,
 * and the gallery section is omitted rather than left as an empty gap.
 */
(function () {
  'use strict';

  var projects = window.Projects || [];
  var root, observer = null;

  function getSlug() {
    var m = /[?&]slug=([^&]+)/.exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function figure(src, alt) {
    var fig = el('figure', 'gallery-figure');
    var img = el('img');
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    fig.appendChild(img);
    return fig;
  }

  function specs(project, index) {
    var list = el('dl', 'project-specs');
    var cs = project.caseStudy;

    // A case study describes itself better through role/timeline/status than
    // through the gallery-oriented category/year/index triple.
    var rows = cs
      ? [
          ['Role', cs.role || '—'],
          ['Timeline', cs.timeline || project.year || '—'],
          ['Status', cs.status || '—'],
          ['Category', project.category],
        ]
      : [
          ['Category', project.category],
          ['Year', project.year || '—'],
          ['Index', String(index + 1).padStart(2, '0') + ' / ' + String(projects.length).padStart(2, '0')],
        ];

    rows.forEach(function (pair) {
      var wrapper = el('div', 'spec');
      wrapper.appendChild(el('dt', null, pair[0]));
      wrapper.appendChild(el('dd', null, pair[1]));
      list.appendChild(wrapper);
    });

    return list;
  }

  /* ── Case study ──────────────────────────────────────────────
     Only built when a project carries a `caseStudy` object. Each block is
     skipped individually if its data is absent, so a partially-filled case
     study degrades to whatever is actually written rather than leaving
     empty headings behind. */

  function sectionHead(nr, title) {
    var head = el('div', 'section-head');
    head.appendChild(el('span', 'section-nr', nr));
    head.appendChild(el('h2', 'section-title', title));
    head.appendChild(el('span', 'section-rule'));
    return head;
  }

  function caseStudy(cs) {
    var wrap = el('div', 'case-study');
    var n = 0;
    var pad = function () { return String(++n).padStart(2, '0'); };

    if (cs.summary) {
      var lede = el('p', 'case-lede', cs.summary);
      wrap.appendChild(lede);
    }

    if (cs.problem) {
      var pSec = el('section', 'section');
      pSec.appendChild(sectionHead(pad(), 'The problem'));
      pSec.appendChild(el('p', 'case-body', cs.problem));
      wrap.appendChild(pSec);
    }

    if (cs.approach && cs.approach.length) {
      var aSec = el('section', 'section');
      aSec.appendChild(sectionHead(pad(), 'Approach'));
      var steps = el('ol', 'case-steps');
      cs.approach.forEach(function (step) {
        var li = el('li', 'case-step');
        li.appendChild(el('h3', 'case-step-title', step.title));
        li.appendChild(el('p', 'case-step-body', step.body));
        steps.appendChild(li);
      });
      aSec.appendChild(steps);
      wrap.appendChild(aSec);
    }

    if (cs.stack && cs.stack.length) {
      var sSec = el('section', 'section');
      sSec.appendChild(sectionHead(pad(), 'Stack'));
      var groups = el('div', 'stack-groups');
      cs.stack.forEach(function (g) {
        var group = el('div', 'stack-group');
        group.appendChild(el('h3', null, g.group));
        var tags = el('div', 'tag-list');
        (g.items || []).forEach(function (item) {
          tags.appendChild(el('span', 'tag', item));
        });
        group.appendChild(tags);
        groups.appendChild(group);
      });
      sSec.appendChild(groups);
      wrap.appendChild(sSec);
    }

    if (cs.outcome && cs.outcome.length) {
      var oSec = el('section', 'section');
      oSec.appendChild(sectionHead(pad(), 'What it changes'));
      var list = el('ul', 'case-outcomes');
      cs.outcome.forEach(function (line) {
        list.appendChild(el('li', null, line));
      });
      oSec.appendChild(list);
      wrap.appendChild(oSec);
    }

    if (cs.note) wrap.appendChild(el('p', 'case-note', cs.note));

    return wrap;
  }

  function prevNext(index) {
    var nav = el('nav', 'project-nav');
    nav.setAttribute('aria-label', 'Project navigation');

    [
      { key: 'prev', label: 'Previous', item: projects[index - 1] },
      { key: 'next', label: 'Next', item: projects[index + 1] },
    ].forEach(function (side) {
      var link = el('a', 'pnav pnav--' + side.key);
      if (!side.item) {
        link.className += ' is-empty';
        link.setAttribute('aria-hidden', 'true');
        link.tabIndex = -1;
        nav.appendChild(link);
        return;
      }
      link.href = 'project.html?slug=' + encodeURIComponent(side.item.slug);
      link.dataset.slug = side.item.slug;
      link.appendChild(el('span', 'pnav-label', side.label));
      link.appendChild(el('span', 'pnav-title', side.item.title));
      nav.appendChild(link);
    });

    return nav;
  }

  function renderMissing(slug) {
    root.innerHTML = '';
    var head = el('header', 'project-head');
    var back = el('a', 'project-back', '← All work');
    back.href = 'projects.html';
    head.appendChild(back);
    head.appendChild(el('h1', 'project-title', 'Project not found'));
    var note = el('p', 'project-note',
      slug ? 'No project matches "' + slug + '".' : 'No project was specified.');
    head.appendChild(note);
    root.appendChild(head);
  }

  function render(project, index) {
    document.title = project.title + ' — Amr Binniyaz';
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', project.title + ' — ' + project.category + ' work by Amr Binniyaz.');

    root.innerHTML = '';

    /* Header */
    var head = el('header', 'project-head');
    var back = el('a', 'project-back');
    back.href = 'projects.html';
    back.dataset.back = 'true';
    back.appendChild(el('span', null, '←'));
    back.appendChild(el('span', null, 'All work'));
    head.appendChild(back);
    head.appendChild(el('h1', 'project-title', project.title));
    head.appendChild(specs(project, index));

    if (project.description) {
      head.appendChild(el('p', 'project-desc', project.description));
    }
    root.appendChild(head);

    /* Hero */
    if (project.cover) {
      var hero = el('div', 'project-hero');
      var heroImg = el('img');
      heroImg.src = project.cover;
      heroImg.alt = project.title;
      heroImg.fetchPriority = 'high';
      hero.appendChild(heroImg);
      root.appendChild(hero);
    }

    /* Case study — rendered in place of a bare gallery when present. */
    if (project.caseStudy) {
      root.appendChild(caseStudy(project.caseStudy));
    }

    /* Gallery — omitted entirely when empty. */
    if (project.gallery && project.gallery.length) {
      var gallery = el('div', 'project-gallery');
      project.gallery.forEach(function (src, i) {
        gallery.appendChild(figure(src, project.title + ' — image ' + (i + 2)));
      });
      root.appendChild(gallery);
      revealFigures(gallery);
    } else {
      var spacer = el('div');
      spacer.style.height = 'clamp(40px, 7vh, 88px)';
      root.appendChild(spacer);
    }

    root.appendChild(prevNext(index));

    /* Footer */
    var foot = el('footer', 'site-foot');
    foot.appendChild(el('span', null, '© ' + new Date().getFullYear() + ' Amr Binniyaz'));
    var home = el('a', null, 'Back to home');
    home.href = '/';
    foot.appendChild(home);
    root.appendChild(foot);
  }

  function revealFigures(container) {
    if (observer) observer.cancel();
    var figures = container.querySelectorAll('.gallery-figure');

    observer = window.Reveal
      ? window.Reveal.watch(figures, { stagger: 70 })
      : (Array.prototype.forEach.call(figures, function (f) { f.classList.add('is-in'); }), null);
  }

  function wireNavigation() {
    root.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;

      e.preventDefault();

      var label = 'PROJECTS';
      if (link.dataset.slug) {
        var next = projects.find(function (p) { return p.slug === link.dataset.slug; });
        if (next) {
          label = next.title;
          sessionStorage.setItem('txCover', next.cover);
        }
      } else if (href === '/') {
        label = 'HOME';
      }

      if (window.Transition) {
        window.Transition.out(href, label, '#1a1614');
      } else {
        window.location.href = href;
      }
    });
  }

  function init() {
    root = document.getElementById('projectRoot');
    if (!root) return;

    var slug = getSlug();
    var index = projects.findIndex(function (p) { return p.slug === slug; });

    if (index === -1) renderMissing(slug);
    else render(projects[index], index);

    wireNavigation();

    if (window.Contours) window.Contours.init();
    if (window.Cursor) window.Cursor.init();
    if (window.CRTOverlay) window.CRTOverlay.init();
    if (window.Nav) window.Nav.init();
    if (window.Transition) window.Transition.enter();

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
})();
