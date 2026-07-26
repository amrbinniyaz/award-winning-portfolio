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
    "cover": "assets/images/work/sprxintel-01-dashboard.jpg",
    "gallery": [
      "assets/images/work/sprxintel-02-crawl-jobs.jpg",
      "assets/images/work/sprxintel-03-schools.jpg",
      "assets/images/work/sprxintel-04-school-detail.jpg",
      "assets/images/work/sprxintel-05-content-editor.jpg",
      "assets/images/work/sprxintel-06-sitemap-builder.jpg",
      "assets/images/work/sprxintel-07-ask-ai.jpg"
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
    "slug": "fixigate-uae",
    "title": "Fixigate UAE",
    "category": "Media",
    "year": "2019",
    "cover": "assets/images/work/fixigate-uae-cover-00.jpeg",
    "gallery": [
      "assets/images/work/fixigate-uae-01.jpeg",
      "assets/images/work/fixigate-uae-02.jpg",
      "assets/images/work/fixigate-uae-03.jpg",
      "assets/images/work/fixigate-uae-04.jpg"
    ],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/fixigate-uae/"
  },
  {
    "slug": "aura-luxury-lighting",
    "title": "Aura Luxury Lighting",
    "category": "Media",
    "year": "2019",
    "cover": "assets/images/work/aura-luxury-lighting-cover-00.jpeg",
    "gallery": [
      "assets/images/work/aura-luxury-lighting-01.jpeg",
      "assets/images/work/aura-luxury-lighting-02.jpg",
      "assets/images/work/aura-luxury-lighting-03.jpg"
    ],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/aura-luxury-lighting/"
  },
  {
    "slug": "portraits",
    "title": "Vegan Valley",
    "category": "Illustration",
    "year": "2019",
    "cover": "assets/images/work/portraits-cover-00.jpg",
    "gallery": [
      "assets/images/work/portraits-01.jpg",
      "assets/images/work/portraits-02.jpg",
      "assets/images/work/portraits-03.jpg",
      "assets/images/work/portraits-04.jpg",
      "assets/images/work/portraits-05.jpg",
      "assets/images/work/portraits-06.jpg",
      "assets/images/work/portraits-07.jpg",
      "assets/images/work/portraits-08.jpg"
    ],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/portraits/"
  },
  {
    "slug": "history-of-van",
    "title": "Lulu group",
    "category": "Media",
    "year": "2019",
    "cover": "assets/images/work/history-of-van-cover-00.png",
    "gallery": [],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/history-of-van/"
  },
  {
    "slug": "changes-lion",
    "title": "Leymoon Restaurant",
    "category": "Media",
    "year": "2019",
    "cover": "assets/images/work/changes-lion-cover-00.png",
    "gallery": [],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/changes-lion/"
  },
  {
    "slug": "bottle-logo-mockup-2",
    "title": "Bottle Logo Mockup",
    "category": "Illustration",
    "year": "2019",
    "cover": "assets/images/work/bottle-logo-mockup-2-cover-00.jpg",
    "gallery": [
      "assets/images/work/bottle-logo-mockup-2-01.jpg",
      "assets/images/work/bottle-logo-mockup-2-02.jpg",
      "assets/images/work/bottle-logo-mockup-2-03.jpg"
    ],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/bottle-logo-mockup-2/"
  },
  {
    "slug": "an-award-winning-architecture-and-interior-designing-firm-in-calicut",
    "title": "An award winning architecture and interior designing firm in Calicut.",
    "category": "Media",
    "year": "2019",
    "cover": "assets/images/work/an-award-winning-architecture-and-interior-designing-firm-in-calicut-cover-00.jpg",
    "gallery": [],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/an-award-winning-architecture-and-interior-designing-firm-in-calicut/"
  },
  {
    "slug": "branding-presentation-kit-2",
    "title": "Branding Presentation Kit",
    "category": "Illustration",
    "year": "2019",
    "cover": "assets/images/work/branding-presentation-kit-2-cover-00.jpg",
    "gallery": [
      "assets/images/work/branding-presentation-kit-2-01.jpg",
      "assets/images/work/branding-presentation-kit-2-02.jpg",
      "assets/images/work/branding-presentation-kit-2-03.jpg"
    ],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/branding-presentation-kit-2/"
  },
  {
    "slug": "branding-presentation-kit",
    "title": "Branding Presentation Kit",
    "category": "Illustration",
    "year": "2019",
    "cover": "assets/images/work/branding-presentation-kit-cover-00.jpg",
    "gallery": [
      "assets/images/work/branding-presentation-kit-01.jpg",
      "assets/images/work/branding-presentation-kit-02.jpg",
      "assets/images/work/branding-presentation-kit-03.jpg"
    ],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/branding-presentation-kit/"
  },
  {
    "slug": "portrait-sketch",
    "title": "Portrait Sketch",
    "category": "Illustration",
    "year": "2019",
    "cover": "assets/images/work/portrait-sketch-cover-00.jpg",
    "gallery": [],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/portrait-sketch/"
  },
  {
    "slug": "creatin-way-the-right-way",
    "title": "Creatin — Way The Right Way",
    "category": "Video",
    "year": "2019",
    "cover": "assets/images/work/creatin-way-the-right-way-cover-00.jpeg",
    "gallery": [],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/creatin-way-the-right-way/"
  },
  {
    "slug": "too-future-guest-mix-108-laxcity",
    "title": "Too Future. Guest Mix 108: Laxcity",
    "category": "Media",
    "year": "2019",
    "cover": "assets/images/work/too-future-guest-mix-108-laxcity-cover-00.jpg",
    "gallery": [],
    "description": "",
    "source": "https://amrniyaz.com/portfolio/too-future-guest-mix-108-laxcity/"
  }
];
