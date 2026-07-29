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
    "slug": "sprxintel",
    "title": "SprXintel — School Intelligence",
    "category": "Product",
    "year": "2026",
    "cover": "assets/images/work/sprxintel-01-dashboard.webp",
    "gallery": [
      "assets/images/work/sprxintel-02-crawl-jobs.webp",
      "assets/images/work/sprxintel-03-schools.webp",
      "assets/images/work/sprxintel-04-school-detail.webp",
      "assets/images/work/sprxintel-05-content-editor.webp",
      "assets/images/work/sprxintel-06-sitemap-builder.webp",
      "assets/images/work/sprxintel-07-ask-ai.webp"
    ],
    "description": "A content pipeline that crawls a school website, scores and refines what it finds, rebuilds the structure in a visual sitemap, and pushes the result straight into a CMS.",
    "source": "",
    "caseStudy": {
      "role": "Design & Build",
      "timeline": "2026 — in progress",
      "status": "In development",
      "summary": "Rebuilding a school website normally starts with weeks of content archaeology — clicking through every page, copying it into a spreadsheet, arguing about structure in a sitemap tool, then re-typing all of it into a CMS. SprXintel collapses that into one pipeline.",
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
