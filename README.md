# Portfolio — CRT / fluid landing page

A single-page portfolio landing built as static files. No framework, no build
step, no dependencies — open `index.html` and it runs.

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

A server is needed (not `file://`) because WebGL refuses to load the background
texture cross-origin from the filesystem.

---

## Making it yours

Everything you'd normally want to change lives in **`assets/js/config.js`**:

```js
window.SiteConfig = {
  names: { left: 'AMR', right: 'BINNIYAZ' },   // the giant nameplate
  nav: { left: {…}, right: {…} },              // side labels + transition tint
  preloader: { message: […], skipAfterVisits: 2 },
  easing: { mouse, ring, slide, mask },        // motion feel
  fluid: { r, g, b, edgeLow, edgeHigh },       // fluid tint + edge hardness
};
```

**Images** — the three in `assets/images/` are procedurally generated
placeholders. Drop your own over them at the same paths and nothing else needs
to change:

| File | Role |
|---|---|
| `portrait.png` | the base photo |
| `portrait-illustration.png` | the version revealed *through* the fluid — needs to look clearly different from the base, that contrast is the effect |
| `fluid-bg.png` | texture the fluid blob reveals |

Regenerate them at any time with `node tools/generate-assets.mjs`.

---

## How it's put together

```
index.html
assets/css/   style.css · nav.css
assets/js/    config · fluid · contours · liquid-mask · nameplate
              cursor · preloader · crt-overlay · transition · nav · main
tools/        generate-assets.mjs
```

`main.js` owns the **single** requestAnimationFrame loop and the shared pointer
state. No other module runs its own loop, so frame ordering is explicit and
there's one place to profile:

```
pointer smoothing → contours → fluid → liquid mask
→ slide/parallax → cursor → nav probe → grain
```

### The effects

| Module | What it does |
|---|---|
| `contours.js` | Marching squares over a field of drifting Gaussian peaks. Contour *levels* are fixed and the terrain moves — scrolling the levels instead makes lines pop in and out at the extremes. |
| `fluid.js` | GPU Navier–Stokes. The display pass uses dye density as a **mask** over a background plate rather than rendering coloured dye, which is what gives the metallic blob instead of a rainbow smear. |
| `liquid-mask.js` | Six SVG circles through a heavy blur and a steep alpha ramp, so they fuse into one metaball. Plus a canvas `destination-in` composite that clips the illustration to the live fluid. |
| `nameplate.js` | Per-letter reels. Each lands on an exact multiple of glyph-height, then collapses back to a single glyph — without that reset the DOM grows every swap and letters drift off-baseline. |
| `preloader.js` | SMPTE bars, chaos blocks, two glitch bursts, grain, segmented progress, BIOS handoff, then a tube-warmup flicker reveal. |
| `crt-overlay.js` | Barrel viewport via `clip-path: path()`. The frame uses an evenodd path (rect *minus* barrel) so it paints only the corners. |
| `transition.js` | Three-panel wipe. Label and tint cross the navigation boundary through `sessionStorage`, since the outgoing page's JS dies on unload. |

### Performance notes

- The fluid sim scales itself down under 1200px wide (sim resolution 128 → 64
  on phones); the full-resolution solver will pin a mobile GPU.
- Contours draw **once** on mobile and then stop — the animation costs battery
  and barely reads at that size.
- Grain redraws every 4th–5th frame. Full-rate noise is both wasteful and reads
  as harsh flicker.
- `Fluid.getAlphaAt()` does a GPU readback, which stalls the pipeline. It's
  called once per frame for one element. Don't put it in a loop.

### Accessibility

- `prefers-reduced-motion` skips the boot sequence entirely and holds the
  static composition — the glitch, shake and grain are genuinely uncomfortable
  for motion-sensitive and vestibular users.
- Real `<h1>`, keyboard skip link, focus trap in the mobile menu.
- The custom cursor only replaces the system one on fine pointers.

---

---

## Pages

| File | What it is |
|---|---|
| `index.html` | Landing page — CRT boot, fluid, nameplate |
| `projects.html` | Work grid with category filter |
| `project.html` | Project detail / case study, rendered from `?slug=` |
| `resume.html` | CV as a CRT system readout |

### Case studies

A project entry may carry an optional `caseStudy` object. When present,
`project.html` renders full case-study sections instead of a bare gallery, and
the spec strip switches from category/year/index to role/timeline/status:

```js
caseStudy: {
  role, timeline, status,       // spec strip
  summary,                      // display-size lede
  problem,                      // one paragraph
  approach: [{ title, body }],  // auto-numbered steps
  stack:   [{ group, items }],  // grouped tech tags
  outcome: [string],            // bullet list
  note                          // caveat / current-state line
}
```

Every block is skipped individually when its data is missing, so a
half-written case study degrades to what's actually there rather than leaving
empty headings behind. The twelve imported projects have no `caseStudy` and
keep the original gallery layout untouched.

Section numbers and approach-step numbers are both generated (CSS
`counter` for the steps), so reordering or removing a block renumbers the rest
automatically.

### Resume

Content is authored **directly in `resume.html`** as semantic HTML, not rendered
from a data file the way projects are. A CV should be crawlable and readable
without JavaScript, and it has no filtering or routing to justify client-side
rendering. `resume.js` only animates.

The design reads the CV as a machine spec sheet: career history as a signal
trace with nodes on a rail, and capability levels as segmented meters using the
same dash rhythm as the boot screen's loading bar, so the page reads as part of
the same machine.

Skill percentages are the real values from the old site. Infrastructure
(Google Cloud, AWS, Digital Ocean) had no levels there, so it renders as tags
rather than invented numbers.

### Content

`assets/js/projects-data.js` holds 12 projects imported from the previous
WordPress site (amrniyaz.com) via its REST API — titles, categories, years and
images. Images live in `assets/images/work/`.

**Every project's `description` is empty**, because no descriptive copy existed
on the old site to import. The detail page is built to look deliberate without
it. Write one into any project and it renders automatically:

```js
{ slug: 'fixigate-uae', description: 'Brand identity and web...' }
```

Six of the twelve projects also have no gallery — only a cover. Those detail
pages omit the gallery section entirely rather than leave a gap.

Images were optimised on import: opaque PNGs converted to JPEG, everything
capped at 1600px. That took the set from 36MB to 13MB. Two covers with genuine
transparency stayed PNG.

### Deep links

`projects.html?filter=Illustration` opens pre-filtered. An unrecognised value
falls back to showing everything.

---

## Status

All three pages are complete and verified — boot sequence, nameplate swap,
parallax, fluid, grid filtering, deep links, detail rendering, prev/next
boundaries, unknown-slug handling, cross-page transitions, mobile at 375px,
reduced motion. Console clean on every page.

### SprXintel screenshots — check before publishing

The seven interior screenshots show **real crawled client data**: named schools
(Emanuel, Friends Seminary, Madeira, St David's College, Head Royce and
others), HubSpot record IDs, and an internal staging CMS hostname.

This is an internal tool built inside an employer. Putting live client names and
internal infrastructure on a public portfolio is a call worth making
deliberately rather than by default. If any of it should not be public, the
options are to blur the school column, swap in demo data before re-shooting, or
keep the case study text and drop the gallery — the page renders correctly with
an empty `gallery` array.

### Verify before publishing

The resume content came from a site last updated around 2023. Two things are
worth confirming rather than assuming:

- **"Mar 2022 — Present"** on the Interactive Schools role is what the old site
  said. If that has changed, update the date in `resume.html` and remove the
  `is-current` class from that entry.
- **`assets/files/amr-binniyaz-cv.pdf`** is the June 2023 file from the old
  site. Replace it with a current one at the same path.

### Known follow-ups

- One project title is a full sentence (*"An award winning architecture and
  interior designing firm in Calicut."*) — inherited from the old site, and long
  enough to wrap awkwardly in the grid. Worth shortening in
  `projects-data.js`.
- Two projects are both titled *"Branding Presentation Kit"*. Distinct slugs, so
  they work fine, but they read as duplicates in the grid.
- Several slugs don't match their titles (*Vegan Valley* lives at
  `portraits`, *Lulu group* at `history-of-van`) — leftovers from the old
  theme. Harmless, since slugs are only identifiers.

## Credits

The fluid solver follows the approach in Pavel Dobryakov's
[WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation)
(MIT), with a different display pass.

Design and interaction direction is modelled on the CRT/fluid genre of portfolio
sites — the boot-screen reveal, topographic backdrop, and metaball portrait
reveal are reimplementations of those techniques, written from scratch here.
