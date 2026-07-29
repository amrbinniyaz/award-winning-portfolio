/**
 * SITE CONFIG
 * Everything you'd realistically want to change lives here.
 * Edit this file, not the effect modules.
 */
window.SiteConfig = {
  /* The two words the nameplate swaps between as the cursor crosses halves. */
  names: { left: 'AMR', right: 'BINNIYAZ' },

  /* Side navigation. `color` tints the page-transition overlay. */
  /* `color` drives both the numeral's glow and the transition tint. */
  nav: {
    left:  { label: 'PROJECTS',     href: 'projects.html',                     index: '01', color: '#ef4444' },
    right: { label: 'ILLUSTRATION', href: 'projects.html?filter=Illustration', index: '02', color: '#22c55e' },
  },

  /* Boot sequence.
     Retimed to ~2.2s total. The old 3.7s wasn't richer — 1.2s of it was dead
     air (a pause, a fade, and a 700ms hold on a finished BIOS screen). Every
     element still plays; nothing idles between them. Content held behind the
     boot doesn't count as painted, so this duration sets LCP directly. */
  preloader: {
    message: ['STREAM', 'STARTING', 'SOON'],
    skipAfterVisits: 2,      // show "press space to skip" from the Nth visit on
    // Both bursts have to land inside the (now shorter) progress bar.
    glitchBurstsAt: [240, 660],
    glitchBurstMs: 200,
    barTickMs: 26,           // progress bar tick interval
    barStep: [4, 5],         // percent added per tick (random between)
    biosLineMs: 55,          // per-line typing speed
    biosHoldMs: 260,         // pause after the caret appears
  },

  /* Motion feel. Lower = heavier / more lag. */
  easing: {
    mouse: 0.08,   // normalized pointer smoothing
    ring:  0.12,   // cursor ring chasing the dot
    slide: 0.045,  // content group sliding left/right
    mask:  0.012,  // liquid metaball — deliberately very slow, this is the effect
  },

  slidePx: 250,    // how far the content group travels per side
  idleMs:  2200,   // stillness before the fluid starts orbiting on its own

  /* Fluid tint — the colour the fluid resolves toward. */
  fluid: { r: 194, g: 194, b: 194, edgeLow: 0.08, edgeHigh: 0.09 },

  /* Analytics — self-hosted Umami.
     `websiteId` is issued by the Umami dashboard when the site is added there.
     Until it's filled in, analytics.js loads nothing and sends nothing, so
     this is safe to ship ahead of the server being up.
     `domains` is enforced by the tracker itself: events from any other host
     are dropped, which is what keeps localhost out of the numbers. */
  analytics: {
    src: 'https://analytics.amrniyaz.com/script.js',
    websiteId: '797448ab-23fc-4348-994d-87bc46f3a7f4',
    domains: 'amrniyaz.com,www.amrniyaz.com',
  },
};
