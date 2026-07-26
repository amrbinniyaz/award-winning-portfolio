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

  /* Boot sequence. */
  preloader: {
    message: ['STREAM', 'STARTING', 'SOON'],
    skipAfterVisits: 2,      // show "press space to skip" from the Nth visit on
    glitchBurstsAt: [400, 1100],
    glitchBurstMs: 220,
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
};
