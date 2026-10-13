/** Apex International School: a school website built to bring in admissions. */
(function () {
  'use strict';

  window.Projects = window.Projects || [];
  window.Projects.splice(0, 0, {
    slug: 'apex-international-school',
    title: 'Apex — School Admissions Website',
    category: 'Web Design',
    year: '2026',
    client: 'Apex International School · Kozhikode, India',
    cover: 'assets/images/work/apex-cover.webp',
    coverAlt: 'Apex International School homepage: pupils doing a science experiment under the headline Find your spark. Make it shine.',
    scrollPreview: 'assets/images/work/apex-scroll.webp',
    gallery: [
      { src: 'assets/images/work/apex-learning.webp', alt: 'Learning at Apex section with the headline Big ideas. Bright futures. beside illustrated pupils carrying a pencil and books.', caption: 'Learning at Apex — illustrated characters and handwritten notes give classroom stories a warm, approachable voice.' },
      { src: 'assets/images/work/apex-life.webp', alt: 'Life at Apex section with a photograph of pupils holding medals and links to Taekwondo, Art and Craft, Skating, Chess and School Radio.', caption: 'Life at Apex — every activity opens its own page, from Taekwondo to School Radio.' },
      { src: 'assets/images/work/apex-results.webp', alt: 'Results page showing 100% Class X results for 2025–26 with a link to the school’s announcement PDF.', caption: 'Results — the 100% Class X result leads the page, with the school’s original announcements one click away.' },
      { src: 'assets/images/work/apex-enquiry.webp', alt: 'Admissions enquiry form, step one of three, asking for parent name, email and phone, beside the school phone number.', caption: 'Admissions enquiry — three short steps, with a phone number for families who would rather talk.' },
      { src: 'assets/images/work/apex-process.webp', alt: 'The admissions process in three numbered steps: enquire about a place, explore the details, complete your application.', caption: 'Admissions process — three steps that tell families exactly what happens after they enquire.' },
      { src: 'assets/images/work/apex-visit.webp', alt: 'Visit Apex section headed Come and see what’s possible, with an Arrange a visit button and a photograph of pupils and a teacher.', caption: 'Visit Apex — pages close with an invitation to see the campus in person.' }
    ],
    description: 'A school website for Apex International School in Kozhikode, built to turn interest into admissions: a warm first impression of school life, clear proof of results, and an easy route to enquire or book a visit.',
    source: 'https://apexinternationalschool.org/',
    liveUrl: 'https://apexinternationalschool.org/',
    caseStudy: {
      client: 'Apex International School · Kozhikode, India',
      scope: 'School website & admissions journey',
      role: 'Design & development',
      timeline: '2026',
      status: 'Live website',
      summary: 'Apex International School is a CBSE school in Kozhikode, Kerala, established in 2005. The new website is built around one goal: helping more families choose Apex. Every page takes a parent from a first impression of school life to the evidence they need, and then to a simple next step — enquire about a place or arrange a visit.',
      problem: 'Parents choosing a school compare several options, often on a phone, and they want answers to the same questions: what is daily life like, how do pupils perform, and how do we apply? The challenge was to show the school’s character, prove its results and make starting a conversation easy, without overwhelming families or losing them in a long form.',
      approach: [
        {
          title: 'Lead with real school life',
          body: 'The homepage opens with full-screen photography and film of Apex pupils under the line “Find your spark. Make it shine.” Handwritten accents and illustrated doodles give the school a warm personality, while Apply now and Visit us stay in the header on every page.'
        },
        {
          title: 'Turn results into confidence',
          body: 'A dedicated Results & Achievements page leads with the 100% CBSE Class X result for 2025–26, then the school toppers, perfect subject scores and the original announcements as downloadable PDFs — evidence a parent can check for themselves.'
        },
        {
          title: 'Show life beyond lessons',
          body: 'Life at Apex gives each activity — Taekwondo, School Radio, Art and Craft, Skating and Chess — its own page, with what pupils practise, archive photography and answers to the questions families usually ask.'
        },
        {
          title: 'Make enquiring feel easy',
          body: 'Admissions and visit enquiries use a short three-step form: your details, your plans, review. It asks only what the school needs to reply, says clearly that it is an enquiry rather than a full application, and offers a phone number for families who prefer to talk.'
        },
        {
          title: 'Explain what happens next',
          body: 'The admissions page sets out the process in three steps — enquire, explore the details, complete your application — with answers on fees and entry requirements, so families know what to expect before they get in touch.'
        },
        {
          title: 'Help local families find it',
          body: 'Pages are written around what parents search for, such as a CBSE school or activities in Kozhikode, with descriptive titles and a clear page structure, alongside the mandatory public disclosure CBSE requires.'
        }
      ],
      stack: [
        { group: 'Framework', items: ['Next.js', 'React'] },
        { group: 'Interface', items: ['Full-screen video hero', 'Carousels', 'Multi-step enquiry forms', 'Photo galleries', 'FAQ accordions'] }
      ],
      outcome: [
        'Every page leads to one of two clear actions — Apply now or Visit us — which stay in view across the site.',
        '3 short steps replace one long form for admissions and visit enquiries.',
        '100% Class X results for 2025–26 are presented as proof, backed by the school’s original announcements.',
        '5 activities each have a dedicated page that answers parents’ questions and supports local search.'
      ]
    }
  });
}());
