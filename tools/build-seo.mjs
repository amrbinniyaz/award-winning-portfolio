#!/usr/bin/env node
/**
 * SEO / AEO BUILD
 *
 *   node tools/build-seo.mjs
 *
 * The site renders projects client-side, which search engines handle late and
 * AI crawlers (GPTBot, ClaudeBot, PerplexityBot) mostly not at all. This
 * script writes everything a crawler needs as plain HTML/text:
 *
 *   - <head> metadata between <!-- seo:start --> / <!-- seo:end --> on every
 *     page: title, description, canonical, Open Graph, Twitter, JSON-LD
 *   - work/<slug>/index.html — one page per project, built from project.html.
 *     This is the only project-page renderer; project-detail.js adds behaviour.
 *   - the project list inside #workGrid on projects.html
 *   - the crawlable intro on index.html
 *   - sitemap.xml, robots.txt, llms.txt
 *
 * Re-run it after editing projects or anything in SITE below. It only rewrites
 * the marked regions, so the pages stay hand-editable everywhere else.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ── One source of truth for who this site is about ─────────── */
const SITE = {
  url: 'https://amrniyaz.com',
  name: 'Amr Binniyaz',
  jobTitle: 'QA Lead & Front-end Developer',
  tagline: 'QA lead and front-end developer — accessibility, test automation, web design and internal tooling.',
  summary:
    'Amr Binniyaz is a UK-based QA lead and front-end developer with 9+ years of experience: ' +
    'leading quality across a platform of 250+ school websites — accessibility (WCAG), Core Web Vitals, ' +
    'manual and automated testing — building internal QA tooling, and designing and developing websites for clients.',
  locality: 'High Wycombe',
  country: 'GB',
  email: 'amrbinniyaz@gmail.com',
  sameAs: ['https://github.com/amrbinniyaz'],
  knowsAbout: [
    'Quality assurance', 'Test automation', 'Web accessibility', 'WCAG', 'Core Web Vitals',
    'Front-end development', 'Web design', 'UI design', 'Branding', 'Illustration',
  ],
  image: '/assets/images/og-default.jpg',
  imageAlt: 'Illustrated portrait of Amr Binniyaz',
};

const PAGES = [
  {
    file: 'index.html', path: '/',
    title: `${SITE.name} — ${SITE.jobTitle}`,
    description: `${SITE.name} — ${SITE.tagline} Portfolio, résumé and case studies.`,
    type: 'ProfilePage',
  },
  {
    file: 'projects.html', path: '/projects.html',
    title: `Projects — ${SITE.name}`,
    description: `Selected work by ${SITE.name} — client websites, QA and accessibility tools, branding and illustration.`,
    type: 'CollectionPage',
  },
  {
    file: 'resume.html', path: '/resume.html',
    title: `Resume — ${SITE.name}, ${SITE.jobTitle}`,
    description: `${SITE.name} — QA lead and front-end developer. Work history, education and capabilities across QA, accessibility, test automation and AI engineering.`,
    type: 'ProfilePage',
  },
  {
    file: 'contact.html', path: '/contact.html',
    title: `Contact — ${SITE.name}`,
    description: `Get in touch with ${SITE.name}, QA lead and front-end developer based in the UK — for QA, accessibility and web projects.`,
    type: 'ContactPage',
  },
];

/* ── Helpers ────────────────────────────────────────────────── */
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const write = (f, s) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, f), s);
};
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => SITE.url + '/' + String(p).replace(/^\/+/, '').replace(/\?.*$/, '');
const pad = (n) => String(n).padStart(2, '0');

function replaceRegion(html, name, content, indent) {
  const re = new RegExp(`(<!-- seo:${name}start -->)[\\s\\S]*?(\\n[ \\t]*<!-- seo:${name}end -->)`);
  if (!re.test(html)) throw new Error(`missing <!-- seo:${name}start --> marker`);
  const body = content ? '\n' + content.split('\n').map((l) => (l ? indent + l : l)).join('\n') : '';
  return html.replace(re, (_, a, b) => a + body + b);
}

function loadProjects() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  for (const f of ['projects-data', 'melahah-project', 'integrated-project', 'apex-project', 'project-thumbnails']) {
    vm.runInContext(read(`assets/js/${f}.js`), ctx, { filename: f });
  }
  return ctx.window.Projects;
}

const projectUrl = (p) => `/work/${p.slug}/`;
const projectDescription = (p) => p.description ||
  `${p.title} — ${p.category.toLowerCase()} work by ${SITE.name}${p.year ? ` (${p.year})` : ''}.`;

/* ── <head> ─────────────────────────────────────────────────── */
const person = () => ({
  '@type': 'Person',
  '@id': SITE.url + '/#person',
  name: SITE.name,
  jobTitle: SITE.jobTitle,
  description: SITE.summary,
  url: SITE.url + '/',
  image: abs(SITE.image),
  email: 'mailto:' + SITE.email,
  address: { '@type': 'PostalAddress', addressLocality: SITE.locality, addressCountry: SITE.country },
  knowsAbout: SITE.knowsAbout,
  sameAs: SITE.sameAs,
});

const website = () => ({
  '@type': 'WebSite',
  '@id': SITE.url + '/#website',
  url: SITE.url + '/',
  name: SITE.name,
  description: SITE.tagline,
  publisher: { '@id': SITE.url + '/#person' },
});

function head({ title, description, url, image, imageAlt, ogType = 'website', robots, graph }) {
  const lines = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<meta name="author" content="${esc(SITE.name)}">`,
    robots ? `<meta name="robots" content="${robots}">` : null,
    url ? `<link rel="canonical" href="${url}">` : null,
    `<meta property="og:type" content="${ogType}">`,
    `<meta property="og:site_name" content="${esc(SITE.name)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    url ? `<meta property="og:url" content="${url}">` : null,
    `<meta property="og:image" content="${abs(image)}">`,
    `<meta property="og:image:alt" content="${esc(imageAlt)}">`,
    `<meta property="og:locale" content="en_GB">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    `<meta name="twitter:image" content="${abs(image)}">`,
  ];
  if (graph) {
    const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
      .replace(/</g, '\\u003c');
    lines.push('<script type="application/ld+json">', ...json.split('\n'), '</script>');
  }
  return lines.filter(Boolean).join('\n');
}

function pageGraph(page, projects) {
  const url = abs(page.path);
  const node = {
    '@type': page.type,
    '@id': url + '#webpage',
    url,
    name: page.title,
    description: page.description,
    isPartOf: { '@id': SITE.url + '/#website' },
    inLanguage: 'en-GB',
  };
  if (page.type === 'ProfilePage') node.mainEntity = { '@id': SITE.url + '/#person' };
  if (page.type === 'CollectionPage') {
    node.mainEntity = {
      '@type': 'ItemList',
      itemListElement: projects.map((p, i) => ({
        '@type': 'ListItem', position: i + 1, url: abs(projectUrl(p)), name: p.title,
      })),
    };
  }
  if (page.type === 'ContactPage') node.about = { '@id': SITE.url + '/#person' };
  return [person(), website(), node];
}

/* ── Project page renderer ──────────────────────────────────
   The single source of project-page markup. project-detail.js only adds
   behaviour (reveal, lightbox, contents highlighting, transitions). */
const sentences = (text) => String(text || '').match(/[^.!?]+[.!?]+(\s|$)/g)?.map((s) => s.trim()) || [String(text || '')];
// The overview card wants the one sentence that names the challenge.
const challengeOf = (problem) => {
  const all = sentences(problem);
  return all.find((s) => /challenge|needs? to|has to/i.test(s)) || all[0];
};
// "270 client sites under …" → a big "270" over the rest of the line.
const statOf = (line) => /^(\d[\d,.]*[%+]?)\s+(.+)$/.exec(line);

function figure(src, alt, caption, nr, cls = '') {
  return [
    `<figure class="gallery-figure${cls}">`,
    `  <button class="pd-zoom" type="button" data-zoom="${esc(src)}" aria-label="Enlarge image: ${esc(alt)}"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async"></button>`,
    caption ? `  <figcaption class="gallery-caption">${nr ? `<span class="pd-fig">Fig. ${pad(nr)}</span>` : ''}${esc(caption)}</figcaption>` : null,
    '</figure>',
  ].filter(Boolean).join('\n');
}

function projectBody(p, i, projects) {
  const cs = p.caseStudy;
  const here = projectUrl(p);
  const gallery = (p.gallery || []).map((g, gi) => ({
    src: typeof g === 'string' ? g : g.src,
    alt: (g && g.alt) || `${p.title} — image ${gi + 2}`,
    caption: g && g.caption,
  }));
  const out = [];

  /* Header: what it is, in one glance */
  const chips = [cs ? 'Case study' : null, p.category, cs?.timeline || p.year].filter(Boolean);
  const facts = (cs
    ? [['Client', cs.client], ['Scope', cs.scope], ['Role', cs.role], ['Timeline', cs.timeline || p.year], ['Status', cs.status], ['Category', p.category]]
    : [['Client', p.client], ['Category', p.category], ['Year', p.year]]
  ).filter((f) => f[1]);
  const live = p.website || p.liveUrl;

  out.push('<header class="pd-head">');
  out.push('  <div class="pd-head-main">');
  out.push('    <a class="project-back" href="projects.html" data-back="true"><span aria-hidden="true">←</span><span>All work</span></a>');
  out.push(`    <p class="pd-eyebrow">${chips.map((c, ci) => `<span class="pd-chip${ci === 0 && cs ? ' pd-chip--solid' : ''}">${esc(c)}</span>`).join('')}</p>`);
  out.push(`    <h1 class="project-title">${esc(p.title)}</h1>`);
  if (p.description) out.push(`    <p class="pd-summary">${esc(p.description)}</p>`);
  if (p.video || live) {
    out.push('    <div class="project-actions">');
    if (live) out.push(`      <a class="project-action project-action--solid" href="${esc(live)}" target="_blank" rel="noopener noreferrer">Visit the website <span aria-hidden="true">↗</span></a>`);
    if (p.video) out.push(`      <a class="project-action" href="${here}#project-film">Watch the walkthrough <span aria-hidden="true">↓</span></a>`);
    out.push('    </div>');
  }
  out.push('  </div>');
  out.push(`  <dl class="pd-facts${facts.length % 2 ? ' pd-facts--odd' : ''}">`);
  facts.forEach(([k, v]) => out.push(`    <div class="pd-fact"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`));
  out.push('  </dl>');
  out.push('</header>');

  /* Hero. Image-only projects show their cover as the first tile of the
     gallery wall instead — those covers are usually tall posters. */
  const wall = !cs && gallery.length > 0;
  if (p.video) {
    out.push('<figure class="pd-hero project-hero--film" id="project-film">');
    out.push(`  <video class="project-film" src="${esc(p.video)}" poster="${esc(p.cover)}" controls playsinline preload="none" aria-label="${esc(p.title)} website walkthrough"></video>`);
    if (p.videoCaption) out.push(`  <figcaption class="gallery-caption">${esc(p.videoCaption)}</figcaption>`);
    out.push('</figure>');
  } else if (p.cover && !wall) {
    out.push(`<figure class="pd-hero${cs ? '' : ' pd-hero--solo'}">`);
    out.push(`  <img src="${esc(p.cover)}" alt="${esc(p.coverAlt || p.title)}" fetchpriority="high">`);
    out.push('</figure>');
  }

  if (cs) {
    /* Case study: sticky contents beside numbered sections */
    const sections = [];
    const add = (id, title, html) => sections.push({ id, title, html });

    const glance = [];
    if (cs.problem) glance.push(['The challenge', `<p>${esc(challengeOf(cs.problem))}</p>`]);
    if (cs.approach?.length) glance.push(['What I did', `<ul>${cs.approach.map((s) => `<li>${esc(s.title)}</li>`).join('')}</ul>`]);
    if (cs.outcome?.length) glance.push(['The result', `<p>${esc(cs.outcome[0])}</p>`]);
    add('overview', 'Overview', [
      cs.summary ? `<p class="pd-lede">${esc(cs.summary)}</p>` : '',
      glance.length ? `<div class="pd-glance">\n${glance.map(([h, b]) => `  <div class="pd-card"><h3 class="pd-label">${h}</h3>${b}</div>`).join('\n')}\n</div>` : '',
    ].filter(Boolean).join('\n'));

    if (cs.problem) add('problem', 'The problem', sentences(cs.problem).length > 3
      ? `<p class="pd-text">${esc(cs.problem)}</p>`
      : `<p class="pd-text pd-text--large">${esc(cs.problem)}</p>`);

    if (cs.approach?.length) add('approach', 'Approach', [
      '<ol class="pd-steps">',
      ...cs.approach.map((s, si) => `  <li class="pd-step"><span class="pd-step-nr" aria-hidden="true">${pad(si + 1)}</span><h3 class="pd-step-title">${esc(s.title)}</h3><p>${esc(s.body)}</p></li>`),
      '</ol>',
    ].join('\n'));

    if (gallery.length) add('screens', 'Screens', [
      '<div class="pd-shots">',
      ...gallery.map((g, gi) => figure(g.src, g.alt, g.caption, gi + 1)),
      '</div>',
    ].join('\n'));

    if (cs.outcome?.length) add('results', 'Results', [
      '<ul class="pd-results">',
      ...cs.outcome.map((line) => {
        const m = statOf(line);
        return m
          ? `  <li class="pd-result pd-result--stat"><span class="pd-stat">${esc(m[1])}</span><p>${esc(m[2])}</p></li>`
          : `  <li class="pd-result"><span class="pd-check" aria-hidden="true"></span><p>${esc(line)}</p></li>`;
      }),
      '</ul>',
      cs.note ? `<p class="pd-note"><span class="pd-label">Note</span>${esc(cs.note)}</p>` : '',
    ].filter(Boolean).join('\n'));

    if (cs.stack?.length) add('stack', 'Built with', [
      '<div class="pd-stack">',
      ...cs.stack.map((g) => `  <div class="pd-stack-row"><h3 class="pd-label">${esc(g.group)}</h3><div class="tag-list">${(g.items || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div></div>`),
      '</div>',
    ].join('\n'));

    out.push('<div class="pd-body">');
    out.push('  <nav class="pd-toc" aria-label="On this page">');
    out.push('    <p class="pd-label">On this page</p>');
    out.push('    <ol>');
    sections.forEach((s, si) => out.push(`      <li><a href="${here}#${s.id}"><span>${pad(si + 1)}</span>${esc(s.title)}</a></li>`));
    out.push('    </ol>');
    out.push('  </nav>');
    out.push('  <div class="pd-content">');
    sections.forEach((s, si) => {
      out.push(`    <section class="pd-section" id="${s.id}" aria-labelledby="${s.id}-title">`);
      out.push(`      <h2 class="pd-h2" id="${s.id}-title"><span class="pd-nr">${pad(si + 1)}</span>${esc(s.title)}</h2>`);
      s.html.split('\n').forEach((l) => out.push('      ' + l));
      out.push('    </section>');
    });
    out.push('  </div>');
    out.push('</div>');
  } else if (wall) {
    if (p.cover) gallery.unshift({ src: p.cover, alt: p.coverAlt || p.title });
    out.push('<div class="pd-gallery">');
    gallery.forEach((g) => out.push(figure(g.src, g.alt, g.caption, 0)));
    out.push('</div>');
  }

  /* Prev / next */
  out.push('<nav class="project-nav" aria-label="More projects">');
  [['prev', 'Previous project', projects[i - 1]], ['next', 'Next project', projects[i + 1] || projects[0]]].forEach(([key, label, item]) => {
    if (!item) { out.push(`  <span class="pnav pnav--${key} is-empty"></span>`); return; }
    out.push([
      `  <a class="pnav pnav--${key}" href="work/${item.slug}/" data-slug="${esc(item.slug)}">`,
      `    <span class="pnav-thumb"><img src="${esc(item.thumbnail?.src || item.cover)}" alt="" loading="lazy" decoding="async"></span>`,
      `    <span class="pnav-text"><span class="pnav-label">${key === 'next' && !projects[i + 1] ? 'Back to the first project' : label}</span><span class="pnav-title">${esc(item.title)}</span><span class="pnav-meta">${esc(item.category)}${item.year ? ' · ' + esc(item.year) : ''}</span></span>`,
      '  </a>',
    ].join('\n'));
  });
  out.push('</nav>');
  out.push(`<footer class="site-foot"><span>© ${new Date().getFullYear()} ${esc(SITE.name)}</span><a href="/">Back to home</a></footer>`);
  return out.join('\n');
}

function projectGraph(p, i) {
  const url = abs(projectUrl(p));
  const images = [p.cover, ...(p.gallery || []).map((g) => (typeof g === 'string' ? g : g.src))].filter(Boolean).map(abs);
  const work = {
    '@type': 'CreativeWork',
    '@id': url + '#work',
    name: p.title,
    description: projectDescription(p),
    url,
    image: images,
    genre: p.category,
    creator: { '@id': SITE.url + '/#person' },
  };
  if (p.year) work.dateCreated = p.year;
  if (p.liveUrl || p.website) work.sameAs = p.liveUrl || p.website;
  if (p.caseStudy?.stack) work.keywords = p.caseStudy.stack.flatMap((g) => g.items || []).join(', ');
  if (p.video) {
    work.video = {
      '@type': 'VideoObject',
      name: `${p.title} — walkthrough`,
      description: p.videoCaption || projectDescription(p),
      contentUrl: abs(p.video),
      thumbnailUrl: abs(p.cover),
      uploadDate: `${p.year || new Date().getFullYear()}-01-01`,
    };
  }
  return [
    person(),
    website(),
    {
      '@type': 'WebPage',
      '@id': url + '#webpage',
      url,
      name: `${p.title} — ${SITE.name}`,
      description: projectDescription(p),
      isPartOf: { '@id': SITE.url + '/#website' },
      mainEntity: { '@id': url + '#work' },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url + '/' },
          { '@type': 'ListItem', position: 2, name: 'Projects', item: abs('/projects.html') },
          { '@type': 'ListItem', position: 3, name: p.title, item: url },
        ],
      },
    },
    work,
  ];
}

/* ── Build ──────────────────────────────────────────────────── */
const projects = loadProjects();
const today = new Date().toISOString().slice(0, 10);

for (const page of PAGES) {
  let html = read(page.file);
  html = replaceRegion(html, '', head({
    title: page.title,
    description: page.description,
    url: abs(page.path),
    image: SITE.image,
    imageAlt: SITE.imageAlt,
    ogType: page.type === 'ProfilePage' ? 'profile' : 'website',
    graph: pageGraph(page, projects),
  }), '  ');

  if (page.file === 'projects.html') {
    // Plain links for crawlers; projects.js replaces this with the interactive grid.
    html = replaceRegion(html, 'list:', projects.map((p, i) => [
      `<article class="work-card is-in" data-category="${esc(p.category)}" data-slug="${esc(p.slug)}">`,
      `  <a class="work-card-link" href="work/${p.slug}/">`,
      `    <div class="work-media"><img src="${esc(p.thumbnail?.src || p.cover)}" alt="${esc(p.coverAlt || p.title)}" loading="lazy" decoding="async"></div>`,
      `    <div class="work-meta"><h2 class="work-title">${esc(p.title)}</h2><span class="work-tag">${esc(p.category)}${p.year ? ' · ' + esc(p.year) : ''}</span></div>`,
      '  </a>',
      '</article>',
    ].join('\n')).join('\n'), '        ');
  }

  if (page.file === 'index.html') {
    html = replaceRegion(html, 'intro:', [
      '<div class="sr-only">',
      `  <h1>${esc(SITE.name)} — ${esc(SITE.jobTitle)}</h1>`,
      `  <p>${esc(SITE.summary)}</p>`,
      '  <ul>',
      '    <li><a href="projects.html">Projects and case studies</a></li>',
      '    <li><a href="resume.html">Resume</a></li>',
      '    <li><a href="contact.html">Contact</a></li>',
      '  </ul>',
      '</div>',
    ].join('\n'), '    ');
  }

  write(page.file, html);
}

// project.html only exists to forward old ?slug= links to work/<slug>/.
write('project.html', replaceRegion(read('project.html'), '', head({
  title: `Project — ${SITE.name}`,
  description: `Project detail — ${SITE.name}.`,
  image: SITE.image,
  imageAlt: SITE.imageAlt,
  robots: 'noindex, follow',
}), '  '));

const template = read('project.html');
const workDir = path.join(ROOT, 'work');
fs.rmSync(workDir, { recursive: true, force: true });

projects.forEach((p, i) => {
  const url = abs(projectUrl(p));
  let html = template
    // Relative asset and page links in the template keep resolving from the site root.
    .replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n  <base href="/">')
    .replace('href="#mainContent"', `href="${projectUrl(p)}#mainContent"`)
    .replace('<div class="wrap" id="projectRoot">', `<div class="wrap" id="projectRoot" data-slug="${esc(p.slug)}">`)
    .replace(/\n\s*<!-- rendered by project-detail\.js from \?slug= -->/,
      '\n' + projectBody(p, i, projects).split('\n').map((l) => '      ' + l).join('\n'));
  html = replaceRegion(html, '', head({
    title: `${p.title} — ${SITE.name}`,
    description: projectDescription(p),
    url,
    image: p.cover || SITE.image,
    imageAlt: p.coverAlt || p.title,
    ogType: 'article',
    graph: projectGraph(p, i),
  }), '  ');
  write(`work/${p.slug}/index.html`, html);
});

/* ── sitemap.xml / robots.txt / llms.txt ────────────────────── */
const urls = [
  ...PAGES.map((p) => ({ loc: abs(p.path), priority: p.path === '/' ? '1.0' : '0.8' })),
  ...projects.map((p) => ({ loc: abs(projectUrl(p)), priority: p.caseStudy ? '0.7' : '0.5' })),
];
write('sitemap.xml', [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`),
  '</urlset>',
  '',
].join('\n'));

write('robots.txt', [
  '# Search engines and AI answer engines are welcome.',
  'User-agent: *',
  'Allow: /',
  'Disallow: /project.html',
  '',
  `Sitemap: ${SITE.url}/sitemap.xml`,
  '',
].join('\n'));

const caseStudies = projects.filter((p) => p.caseStudy);
const others = projects.filter((p) => !p.caseStudy);
write('llms.txt', [
  `# ${SITE.name}`,
  '',
  `> ${SITE.summary}`,
  '',
  `- Role: ${SITE.jobTitle}`,
  `- Based: ${SITE.locality}, United Kingdom`,
  `- Focus: ${SITE.knowsAbout.join(', ')}`,
  `- Contact: ${SITE.email}`,
  ...SITE.sameAs.map((u) => `- Profile: ${u}`),
  '',
  '## Pages',
  '',
  ...PAGES.map((p) => `- [${p.title}](${abs(p.path)}): ${p.description}`),
  '',
  '## Case studies',
  '',
  ...caseStudies.map((p) => `- [${p.title}](${abs(projectUrl(p))}): ${projectDescription(p)}`),
  '',
  '## Other work',
  '',
  ...others.map((p) => `- [${p.title}](${abs(projectUrl(p))}): ${p.category}${p.year ? ', ' + p.year : ''}`),
  '',
].join('\n'));

console.log(`SEO build: ${PAGES.length} pages, ${projects.length} project pages, sitemap with ${urls.length} URLs.`);
