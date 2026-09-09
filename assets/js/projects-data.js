/**
 * PROJECTS
 *
 * Most entries were imported from the previous site (amrniyaz.com) and carry
 * only images — `description` is empty because no copy existed there to import.
 *
 * An entry may optionally carry a `caseStudy` object. When present, the detail
 * page renders full case-study sections instead of a bare gallery:
 *
 *   caseStudy: {
 *     role, timeline, status,      // spec strip
 *     summary,                     // lede paragraph
 *     problem,                     // one paragraph
 *     approach: [{ title, body }], // numbered steps
 *     stack:   [{ group, items }], // grouped tech tags
 *     outcome: [string],           // bullet list
 *     note                         // caveat / current-state line
 *   }
 *
 * Images live in assets/images/work/ (optimised: opaque PNGs converted to
 * JPEG, everything capped at 1600px).
 */
window.Projects = [
{
  "slug": "vegan-valley-3d",
  "title": "Vegan Valley — Rooted in Motion",
  "category": "Web Design",
  "year": "2026",
  "cover": "assets/images/work/vegan-valley-3d-cover.webp",
  "previewVideo": "assets/video/vegan-valley-preview.mp4",
  "video": "assets/video/vegan-valley-showcase.mp4",
  "videoCaption": "A walkthrough of the rotating bottle, product range and farm-to-bottle story.",
  "localPreview": "http://localhost:3003/",
  "gallery": [
    {
      "src": "assets/images/work/vegan-valley-3d-flavours.webp",
      "alt": "The 3D bottle showing the Classic Beet flavour and matching selection controls",
      "caption": "Flavour selection rotates the bottle and updates its label, colour and surrounding product copy."
    },
    {
      "src": "assets/images/work/vegan-valley-3d-range.webp",
      "alt": "Colour-coded Vegan Valley juice cards",
      "caption": "A colour-led product range connects the expressive introduction to practical browsing."
    },
    {
      "src": "assets/images/work/vegan-valley-3d-story.webp",
      "alt": "An illustrated chapter in the farm-to-bottle journey",
      "caption": "The farm-to-bottle story breaks the process into four navigable chapters."
    }
  ],
  "description": "An interactive plant-based brand website that brings the product into the page: a real-time 3D bottle, scroll-led storytelling and a colourful route from first impression to flavour discovery.",
  "source": "",
  "caseStudy": {
    "role": "Design & development",
    "timeline": "2026",
    "status": "Interactive prototype",
    "summary": "A bottle can do more than sit in a product photograph. For Vegan Valley, it becomes the thread through the experience: turning as the visitor scrolls, changing flavour on demand, and connecting a playful first impression to the ingredients inside.",
    "problem": "The design challenge was to give a plant-based food brand a distinctive digital presence while keeping its products easy to understand. The experience needed to communicate flavour, ingredients and character, then let people browse juices, explore bowls and discover meal plans without getting lost in the animation.",
    "approach": [
      {
        "title": "Build a recognisable visual world",
        "body": "Sage green, botanical illustrations and handwritten notes establish a natural, tactile setting. Tall condensed headlines sit beside expressive italic type, while individual product colours carry through the flavour selector and catalogue. The bottle stays the visual focus rather than competing with a separate decorative scene."
      },
      {
        "title": "Put the actual product in motion",
        "body": "The bottle is built in Three.js with shaped geometry, a curved label, a ridged cap and studio-style lighting. Scrolling drives a continuous turn. Choosing another featured flavour animates the rotation while updating the juice colour and label, keeping the object and the surrounding copy in sync."
      },
      {
        "title": "Give the scroll a purpose",
        "body": "The opening composition transitions into an ingredient view using GSAP ScrollTrigger. Lenis and the scroll timeline share a clock, while the bottle eases toward the scroll position. Movement reveals information: the visitor sees the product from another angle as the ingredient list comes into view."
      },
      {
        "title": "Make discovery useful",
        "body": "Six juices can be filtered by greens, roots and citrus. Product details reveal ingredients, bowl tabs switch the food photography and description, and the meal-plan flow gathers preferences before preparing an editable WhatsApp enquiry. These interactions turn the visual introduction into a usable brand website."
      },
      {
        "title": "Extend the story beyond the homepage",
        "body": "A four-chapter farm-to-bottle experience follows the farm, harvest, cold press and finished bottle. Chapter links, directional controls and keyboard navigation let visitors choose their own pace. A separate 3D journey explores the same story as a spatial scene."
      },
      {
        "title": "Keep the experience resilient",
        "body": "A product photograph remains available until the first 3D frame is ready and returns if WebGL becomes unavailable. Rendering pauses when the bottle is off-screen or the tab is hidden, the drawing buffer is capped, and reduced-motion preferences simplify the animation. Responsive layouts keep the content usable on smaller screens."
      }
    ],
    "stack": [
      {
        "group": "Website",
        "items": [
          "Vite",
          "JavaScript modules",
          "HTML & CSS"
        ]
      },
      {
        "group": "Motion & 3D",
        "items": [
          "Three.js",
          "GSAP ScrollTrigger",
          "Lenis"
        ]
      },
      {
        "group": "Delivery",
        "items": [
          "WebP imagery",
          "MP4 video",
          "Docker & Nginx"
        ]
      }
    ],
    "outcome": [
      "A working 3D product hero with three selectable featured flavours and a continuous scroll-driven bottle turn.",
      "Six filterable juices, three bowl selections and a meal-plan discovery flow within one consistent visual system.",
      "A four-chapter brand story with direct chapter navigation, plus an additional real-time 3D journey.",
      "Static-image and reduced-motion fallbacks keep the experience useful when animation is unavailable or unwanted."
    ],
    "note": "This case study documents the working prototype and its implemented features. The meal-plan flow prepares an enquiry; it does not place an order. Commercial performance and conversion results have not been measured."
  }
},
  {
    "slug": "content-migration-tool",
    "aliases": ["sprxintel"],
    "title": "Content Migration Tool",
    "category": "Product",
    "year": "2026",
    "cover": "assets/images/work/content-migration-06-sitemap-builder.webp",
    "coverAlt": "Content Migration Tool visual sitemap with page hierarchy and a Push to CMS action",
    "gallery": [
      "assets/images/work/content-migration-01-dashboard.webp",
      "assets/images/work/content-migration-02-crawl-jobs.webp",
      "assets/images/work/content-migration-03-schools.webp",
      "assets/images/work/content-migration-04-school-detail.webp",
      "assets/images/work/content-migration-05-content-editor.webp"
    ],
    "description": "A website content migration tool that captures existing pages, supports content review and editing, rebuilds the sitemap, and transfers the approved structure into a CMS.",
    "source": "",
    "caseStudy": {
      "role": "Design & Build",
      "timeline": "2026 — in progress",
      "status": "In development",
      "summary": "Rebuilding a school website normally starts with weeks of content archaeology — clicking through every page, copying it into a spreadsheet, arguing about structure in a sitemap tool, then re-typing all of it into a CMS. This content migration tool brings crawling, content review, sitemap planning and CMS transfer into one workflow.",
      "problem": "The slow part of a website rebuild is rarely the build. It is the audit that comes first: finding every page that exists, judging which of it is worth keeping, agreeing a new structure, and then moving it across. On a large site that is thousands of pages of manual work — and it starts from zero again on the next project.",
      "approach": [
        {
          "title": "Crawl",
          "body": "Point it at a domain and it walks the whole site, capturing pages, linked documents and the existing hierarchy. Runs are tracked as jobs with live progress and a failure breakdown, so a crawl that stalls on one section is visible rather than silent."
        },
        {
          "title": "Assess",
          "body": "Each property gets an automated read: a content and marketing score, a detected CMS platform, and a plain-English summary of what the site is and where it is weak. That turns a raw page dump into something you can actually prioritise against."
        },
        {
          "title": "Refine",
          "body": "Pages are rebuilt in a block editor with a fixed template library — rich text, split image and text layouts, video, carousels — plus dynamic blocks that render live from CMS data rather than being pasted in as static copy."
        },
        {
          "title": "Restructure",
          "body": "The refined inventory feeds a drag-and-drop sitemap where pages can be added, merged, included or dropped. It is the Slickplan stage, except the canvas arrives already populated with the real site instead of empty."
        },
        {
          "title": "Publish",
          "body": "The agreed structure pushes directly to the target CMS, with a dry-run option before committing. The re-typing step disappears entirely."
        },
        {
          "title": "Interrogate",
          "body": "Everything crawled becomes a queryable corpus — natural-language questions across the whole set, answered from retrieval over the captured pages rather than a general model's guesses."
        }
      ],
      "stack": [
        { "group": "Frontend", "items": ["Next.js (App Router)", "React", "TypeScript", "Tailwind CSS", "React Flow", "Turbopack"] },
        { "group": "Platform", "items": ["Supabase Auth", "Supabase (Postgres)"] },
        { "group": "Type", "items": ["Geist", "Geist Mono", "Source Serif 4"] }
      ],
      "outcome": [
        "17 schools crawled to date — 23,323 pages and 1,673 linked documents captured.",
        "One site alone accounted for 8,866 pages, an audit that is simply not viable by hand.",
        "Structure decisions get made against the real inventory rather than a guess at it.",
        "Content is captured once by the crawler instead of being re-typed into the CMS."
      ],
      "note": "Internal tool, in active development. One deliberate constraint worth naming: a re-crawl overwrites manual edits, so refinement happens after the crawl is settled rather than alongside it — the editor warns on this rather than silently losing work."
    }
  },
  {
    "slug": "accessibility-audit",
    "title": "Client A11y — Accessibility Monitoring",
    "category": "Product",
    "year": "2026",
    "cover": "assets/images/work/accessibility-audit-01-dashboard.webp",
    "gallery": [
      "assets/images/work/accessibility-audit-02-site-trends.webp",
      "assets/images/work/accessibility-audit-03-recommendations.webp"
    ],
    "description": "An internal dashboard that runs Lighthouse and axe-core against 270 client sites, keeps every score as history rather than a snapshot, and turns each failure into a recommendation someone can actually act on.",
    "source": "",
    "caseStudy": {
      "role": "Design & Build",
      "timeline": "2026",
      "status": "Live — internal",
      "summary": "Accessibility is not a state you arrive at, it is one you drift out of. A site that passed at launch fails three months later because someone uploaded an image with no alt text or a button with no accessible name. Across 270 client sites, nobody was going to catch that by hand.",
      "problem": "The tool this replaced was a static site with the audit data baked in at build time — 219 clients in one long table, no search, no history, no export, and no way to trigger a run. It could tell you a score today but not whether that score was better or worse than last month, and with hundreds of sites in the book there was no way to answer the only question that matters on a Monday morning: which of these needs attention this week?",
      "approach": [
        {
          "title": "Audit",
          "body": "Every page is run twice — mobile and desktop — through Lighthouse for performance, SEO and best practices, and through axe-core driven by Playwright for accessibility. Two engines rather than one, because Lighthouse's accessibility score is a summary and axe is the thing that names the actual violated rule."
        },
        {
          "title": "Track",
          "body": "Runs are stored rather than replaced, so each site carries a score history instead of a single current number. The useful signal is the slope: a site at 82 and climbing is in better shape than one at 88 and falling, and a trend line makes that obvious where a table of today's numbers never could."
        },
        {
          "title": "Explain",
          "body": "Findings land in a recommendations table with the rule, its impact, its WCAG criteria and — the field that decides who picks it up — whether it is fixable in the CMS or needs a developer. A missing alt attribute and a render-blocking bundle are both failures, but they belong to different people."
        },
        {
          "title": "Verify by hand",
          "body": "Automation catches perhaps a third of WCAG. The rest is a guided manual checklist across seven categories — keyboard and focus, screen reader, visual and cognitive, content, multimedia, forms, mobile — each with its criterion, level and a written how-to-test, so a manual pass is repeatable rather than dependent on who ran it."
        },
        {
          "title": "Oversee",
          "body": "The portfolio view puts the whole book on one screen: total sites, average performance and accessibility with week-on-week movement, and a count of what is critical right now. Sorting and filtering happen against live data instead of a rebuild."
        },
        {
          "title": "Report",
          "body": "Core Web Vitals are shown against their real thresholds — LCP, INP, CLS, FCP, TTFB — with per-page breakdowns and export, so an account manager can walk into a client meeting with the evidence rather than a screenshot of a gauge."
        }
      ],
      "stack": [
        { "group": "Frontend", "items": ["Next.js 14 (App Router)", "React", "TypeScript", "Tailwind CSS", "shadcn/ui", "Recharts"] },
        { "group": "Platform", "items": ["Supabase (Postgres)", "Docker"] },
        { "group": "Auditing", "items": ["Lighthouse", "axe-core", "Playwright"] }
      ],
      "outcome": [
        "270 client sites under continuous monitoring, mobile and desktop, up from 219 on the static predecessor.",
        "3,922 critical issues surfaced across the portfolio — ranked by impact rather than buried in per-site PDFs.",
        "12 sites sitting below 70 on accessibility are identifiable in a glance instead of by opening 270 reports.",
        "Portfolio health reads as a trend — 64.0 average performance, 86.0 average accessibility — so a regression shows up as a falling line rather than a surprise at the next manual audit."
      ],
      "note": "Internal tool. One constraint shaped the data model more than anything else: every re-audit overwrites machine-generated content, but the human-written explanation of what an issue is and why it matters has to survive that. Those fields are deliberately excluded from the audit write path — the automated pass is not allowed to flatten the part a person wrote."
    }
  },
  {
    "slug": "bugherd-dashboard",
    "title": "BugHerd Dashboard — Bug Trend Analytics",
    "category": "Product",
    "year": "2026",
    "cover": "assets/images/work/bugherd-dashboard-01-project-stats.webp",
    "gallery": [
      "assets/images/work/bugherd-dashboard-03-bug-trend.webp",
      "assets/images/work/bugherd-dashboard-02-distributions.webp"
    ],
    "description": "An analytics layer over BugHerd that mirrors 227 client projects into a local database, records every status change as it happens, and turns a bug board into a trend you can make a decision from.",
    "source": "",
    "caseStudy": {
      "role": "Design & Build",
      "timeline": "2024 — 2026",
      "status": "Live — internal",
      "summary": "A bug board tells you what is open right now. It does not tell you whether a project is converging or quietly filling up, which is the only thing worth knowing before a client call. This dashboard sits on top of BugHerd and answers the second question.",
      "problem": "227 client projects lived in BugHerd, each as its own board. Getting a read on one meant opening it and counting; getting a read across the account meant opening 227. Worse, the API only reports a task's current state — so nothing anywhere recorded that a bug moved from reported to review last Tuesday. Without that, a trend line is guesswork, and 'are we closing faster than they are reporting?' is unanswerable.",
      "approach": [
        {
          "title": "Mirror",
          "body": "A sync engine copies every project and task into local PostgreSQL rather than calling the API on each page view. Pages resolve to a single SQL query; a full sync runs in the background when the mirror goes stale, and only new or changed tasks hit the API. A webhook endpoint means a change on the board reaches the dashboard in seconds instead of at the next sync."
        },
        {
          "title": "Remember",
          "body": "Every status change is written to its own history table as the mirror sees it. That one table is what makes the rest possible — the trend charts are computed from recorded transitions rather than inferred from today's snapshot, so the lines describe what actually happened."
        },
        {
          "title": "Read the project",
          "body": "Each project resolves to its real shape: total tasks split into open, closed and non-development, then broken across the workflow columns — clarification, reported, revisit, in-progress, for review — with every column split again by severity. 117 sitting in review is a different problem from 31 newly reported, and the layout refuses to average them together."
        },
        {
          "title": "Trend",
          "body": "Creation is plotted against resolution over a selectable window, alongside a status trend for open, revisit and to-close-off. The gap between those lines is the decision: a project where new bugs outrun closed ones needs people, not a status update, and it shows up as divergence weeks before it shows up as a missed deadline."
        },
        {
          "title": "Distribute",
          "body": "Priority, status and browser breakdowns give the texture behind the totals — whether a backlog is genuinely critical or mostly unset, and whether an issue is universal or one browser's problem."
        },
        {
          "title": "Roll out",
          "body": "Getting BugHerd onto a client site had been a manual dev ticket per project, occasionally dropped. The handoff spec replaced it with a per-site CMS setting on the shared base template, mirroring how analytics is already injected: turning BugHerd on for a site becomes a value someone fills in, not a code change someone has to remember."
        }
      ],
      "stack": [
        { "group": "Frontend", "items": ["Next.js 14 (App Router)", "React", "TypeScript", "Tailwind CSS", "Radix UI", "Recharts"] },
        { "group": "Platform", "items": ["PostgreSQL", "Docker Compose"] },
        { "group": "Data", "items": ["BugHerd API v2", "Webhooks", "Status-history table"] }
      ],
      "outcome": [
        "227 client projects readable from one place instead of one board at a time.",
        "Page loads became a single query against a local mirror rather than a fan-out of API calls.",
        "Trend charts are computed from recorded status transitions, so history is real rather than estimated.",
        "A project's backlog resolves to something actionable — 210 tasks, 172 open, 117 waiting on review, 30 critical — which is a staffing decision rather than a number."
      ],
      "note": "Internal tool. The first sync of a whole account is genuinely slow — it walks every project and task before the dashboard is useful — so the design leans on that being a one-off: after it, incremental sync and webhooks keep the mirror current at a fraction of the cost."
    }
  },
  {
    "slug": "fixigate-uae",
    "title": "Fixigate UAE",
    "category": "Media",
    "year": "2019",
    "cover": "assets/images/work/fixigate-uae-cover-00.webp",
    "gallery": [
      "assets/images/work/fixigate-uae-01.webp",
      "assets/images/work/fixigate-uae-02.webp",
      "assets/images/work/fixigate-uae-03.webp",
      "assets/images/work/fixigate-uae-04.webp"
    ],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/fixigate-uae/"
  },
  {
    "slug": "aura-luxury-lighting",
    "title": "Aura Luxury Lighting",
    "category": "Media",
    "year": "2019",
    "cover": "assets/images/work/aura-luxury-lighting-cover-00.webp",
    "gallery": [
      "assets/images/work/aura-luxury-lighting-01.webp",
      "assets/images/work/aura-luxury-lighting-02.webp",
      "assets/images/work/aura-luxury-lighting-03.webp"
    ],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/aura-luxury-lighting/"
  },
  {
    "slug": "portraits",
    "title": "Vegan Valley",
    "category": "Illustration",
    "year": "2019",
    "cover": "assets/images/work/portraits-cover-00.webp",
    "gallery": [
      "assets/images/work/portraits-01.webp",
      "assets/images/work/portraits-02.webp",
      "assets/images/work/portraits-03.webp",
      "assets/images/work/portraits-04.webp",
      "assets/images/work/portraits-05.webp",
      "assets/images/work/portraits-06.webp",
      "assets/images/work/portraits-07.webp",
      "assets/images/work/portraits-08.webp"
    ],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/portraits/"
  },
  {
    "slug": "history-of-van",
    "title": "Lulu group",
    "category": "Media",
    "year": "2019",
    "cover": "assets/images/work/history-of-van-cover-00.webp",
    "gallery": [],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/history-of-van/"
  },
  {
    "slug": "changes-lion",
    "title": "Leymoon Restaurant",
    "category": "Media",
    "year": "2019",
    "cover": "assets/images/work/changes-lion-cover-00.webp",
    "gallery": [],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/changes-lion/"
  },
  {
    "slug": "bottle-logo-mockup-2",
    "title": "Bottle Logo Mockup",
    "category": "Illustration",
    "year": "2019",
    "cover": "assets/images/work/bottle-logo-mockup-2-cover-00.webp",
    "gallery": [
      "assets/images/work/bottle-logo-mockup-2-01.webp",
      "assets/images/work/bottle-logo-mockup-2-02.webp",
      "assets/images/work/bottle-logo-mockup-2-03.webp"
    ],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/bottle-logo-mockup-2/"
  },
  {
    "slug": "an-award-winning-architecture-and-interior-designing-firm-in-calicut",
    "title": "An award winning architecture and interior designing firm in Calicut.",
    "category": "Media",
    "year": "2019",
    "cover": "assets/images/work/an-award-winning-architecture-and-interior-designing-firm-in-calicut-cover-00.webp",
    "gallery": [],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/an-award-winning-architecture-and-interior-designing-firm-in-calicut/"
  },
  {
    "slug": "branding-presentation-kit-2",
    "title": "Branding Presentation Kit",
    "category": "Illustration",
    "year": "2019",
    "cover": "assets/images/work/branding-presentation-kit-2-cover-00.webp",
    "gallery": [
      "assets/images/work/branding-presentation-kit-2-01.webp",
      "assets/images/work/branding-presentation-kit-2-02.webp",
      "assets/images/work/branding-presentation-kit-2-03.webp"
    ],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/branding-presentation-kit-2/"
  },
  {
    "slug": "branding-presentation-kit",
    "title": "Branding Presentation Kit",
    "category": "Illustration",
    "year": "2019",
    "cover": "assets/images/work/branding-presentation-kit-cover-00.webp",
    "gallery": [
      "assets/images/work/branding-presentation-kit-01.webp",
      "assets/images/work/branding-presentation-kit-02.webp",
      "assets/images/work/branding-presentation-kit-03.webp"
    ],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/branding-presentation-kit/"
  },
  {
    "slug": "portrait-sketch",
    "title": "Portrait Sketch",
    "category": "Illustration",
    "year": "2019",
    "cover": "assets/images/work/portrait-sketch-cover-00.webp",
    "gallery": [],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/portrait-sketch/"
  },
  {
    "slug": "creatin-way-the-right-way",
    "title": "Creatin — Way The Right Way",
    "category": "Video",
    "year": "2019",
    "cover": "assets/images/work/creatin-way-the-right-way-cover-00.webp",
    "gallery": [],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/creatin-way-the-right-way/"
  },
  {
    "slug": "too-future-guest-mix-108-laxcity",
    "title": "Too Future. Guest Mix 108: Laxcity",
    "category": "Media",
    "year": "2019",
    "cover": "assets/images/work/too-future-guest-mix-108-laxcity-cover-00.webp",
    "gallery": [],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/too-future-guest-mix-108-laxcity/"
  }
];
