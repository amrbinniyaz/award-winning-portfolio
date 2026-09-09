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
  easing: { mouse, ring, slide },        // motion feel
  fluid: { r, g, b, edgeLow, edgeHigh },       // fluid tint + edge hardness
};
```

**Images** — the landing uses your existing `assets/images/portrait.webp`
cutout. Outside the fluid it is rendered in warm graphite; inside the fluid it
returns to its original colour. Both states use the same image coordinates,
so the face stays aligned as the composition moves.

`assets/images/fluid-landscape.svg` is the original rose-and-ochre ribbon
background revealed by the fluid. The old `portrait-illustration.webp` and
`fluid-bg.webp` remain available, but are no longer used on the landing page.

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
pointer smoothing → cached contours → slide/parallax
→ cached portrait bounds → GPU fluid + portrait composition → cursor
```

### The effects

| Module | What it does |
|---|---|
| `contours.js` | Marching squares over a Gaussian field. The landing caches the plate and moves it with a slow CSS transform; inner pages use a throttled, separable field calculation. |
| `fluid.js` | GPU Navier–Stokes with elapsed-time dissipation, bounded pointer strokes, smooth density edges, and a single premultiplied display pass for both portrait and background. |
| `liquid-mask.js` | Passes the responsive portrait bounds to the GPU. No SVG blur or cross-canvas image copy. |
| `nameplate.js` | Per-letter reels. Each lands on an exact multiple of glyph-height, then collapses back to a single glyph — without that reset the DOM grows every swap and letters drift off-baseline. |
| `preloader.js` | SMPTE bars, chaos blocks, two glitch bursts, grain, segmented progress, BIOS handoff, then a tube-warmup flicker reveal. |
| `crt-overlay.js` | Barrel viewport via `clip-path: path()`. The frame uses an evenodd path (rect *minus* barrel) so it paints only the corners. |
| `transition.js` | Three-panel wipe. Label and tint cross the navigation boundary through `sessionStorage`, since the outgoing page's JS dies on unload. |

### Performance notes

- Pointer events update a target; the shared animation loop injects a bounded,
  interpolated stroke. The first event never draws a streak from the corner.
- Easing and fluid dissipation use elapsed time, so refresh rate does not change
  their speed. The paper grain is drawn once on the landing. Slow frames use a capped step, with no catch-up loop.
- The landing's contours draw once per resize and drift on the compositor.
  Gaussian field evaluation is separable, avoiding per-cell trig calculations.
- Portrait, colour reveal and background stay in one WebGL context. There are
  no GPU readbacks and no per-frame copies into a 2D canvas.
- Rendering resolution is capped; smaller devices use a cheaper solver.
  Resize releases old framebuffer attachments, and context recovery reloads art.
- Hidden tabs pause the landing loop. Reduced motion skips the simulation,
  parallax and animated reveal. The DOM portrait also works without WebGL.
- Shared CSS and changed scripts have a version query in all page entry points
  so returning visitors receive the matching files after deployment.

### Checking the animation

Serve the site locally, then open `http://localhost:8000/tools/check-motion.html`.
The browser harness exercises desktop pointer motion, mobile touch, reduced
motion and unavailable WebGL. It checks runtime errors, GPU readbacks, renderer
fallback, portrait bounds, overflow and touch slide behaviour, and reports frame
timings. Timing figures depend on the browser, machine load and refresh rate;
compare them in the same environment. The test overrides stay inside its iframe.

### Analytics

Self-hosted [Umami](https://umami.is) at `analytics.amrniyaz.com`, running as a
Dokploy compose service (`umami` + its own Postgres) next to the site. Chosen
over GA because a ~2kB cookieless tracker doesn't undo the work in the section
above, and because much of this site's audience blocks Google's.

Configured in `config.js` under `analytics`:

| Key | Meaning |
|---|---|
| `src` | tracker URL |
| `websiteId` | issued by the Umami dashboard when the site is added |
| `domains` | hosts the tracker accepts events from — keeps localhost out |

`analytics.js` loads nothing while `websiteId` is empty, so the site runs fine
with analytics switched off, and dev traffic never reaches the server.

Two events beyond pageviews: `cv-download` (the PDF link on the resume) and
`contact-submit` (fired after the compose form validates, not on every submit).
Add more with `Analytics.track('name')` — it's a no-op if the tracker was
blocked or never loaded.

Links posted anywhere should carry UTM params, or the referrer arrives stripped
by LinkedIn's in-app browser and mail clients and lands under Direct:
`amrniyaz.com/?utm_source=linkedin&utm_medium=profile`.

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
`project.html` renders full case-study sections instead of a bare gallery. The
spec strip shows the available client, scope, role, timeline and status fields:

```js
caseStudy: {
  client, scope,                // optional project context
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

### Portfolio previews

The grid uses uncropped, aspect-preserving WebP thumbnails in aligned 16:9
frames. Regenerate them after adding or changing cover images:

```bash
python3 tools/generate-thumbnails.py
```

This maintenance script needs Pillow and Node; the website still has no runtime
dependencies. Originals remain available for the full case-study galleries.
Load `project-thumbnails.js` after the project data and `melahah-project.js`.

Vegan Valley includes a muted 218 KB looping preview and an on-demand full
walkthrough. Previews pause outside the viewport, in hidden tabs, or when
explicitly paused; reduced-motion and data-saving preferences prevent automatic
playback. Its localhost link appears only when this portfolio is viewed locally.
Melahah uses a full-page screenshot that scrolls on hover or keyboard focus,
with a static view for reduced motion. Gallery entries accept either a path or
an object with `src`, `alt` and `caption`.

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

All images are WebP, quality 84, capped at 1600px. The set went 36MB raw to
5MB. WebP keeps alpha, so the two covers with real transparency no longer need
to stay as 1.4MB PNGs.

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
