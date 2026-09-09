/** Integrated Technical Trading: an industrial supplier website in Saudi Arabia. */
(function () {
  'use strict';

  window.Projects = window.Projects || [];
  window.Projects.splice(2, 0, {
    slug: 'integrated-ksa',
    title: 'Integrated — Industrial Supply',
    category: 'Web Design',
    year: '',
    client: 'Integrated Technical Trading · Saudi Arabia',
    cover: 'assets/images/work/integrated-cover.webp',
    coverAlt: 'Integrated Technical Trading homepage with excavator photography, a white navigation bar and a red enquiry button.',
    scrollPreview: 'assets/images/work/integrated-scroll.webp',
    gallery: [
      { src: 'assets/images/work/integrated-industries.webp', alt: 'Integrated industry carousel with photography for mining, trucks, power plants, marine and oil and gas.', caption: 'Industries — photography and numbered cards introduce the different operating environments.' },
      { src: 'assets/images/work/integrated-products.webp', alt: 'Eight product categories, including cranes, construction equipment, generators, safety items, starter parts, meters, lubricants and batteries.', caption: 'Product range — isolated equipment imagery makes a varied catalogue easy to scan.' },
      { src: 'assets/images/work/integrated-partners.webp', alt: 'Supplier logo strip on the Integrated website, including Donaldson, Deutz, Detroit, Cummins and Caterpillar.', caption: 'Brands — a dedicated logo strip presents the suppliers named on the website.' },
      { src: 'assets/images/work/integrated-enquiry.webp', alt: 'Integrated enquiry form with fields for name, email, phone, product interest and message.', caption: 'Enquiries — a compact form gives visitors space to describe their requirements.' }
    ],
    description: 'An industrial supplier website for Integrated Technical Trading in Saudi Arabia, connecting heavy equipment imagery, sector expertise and a clear product catalogue.',
    source: 'https://integratedksa.com/',
    liveUrl: 'https://integratedksa.com/',
    caseStudy: {
      client: 'Integrated Technical Trading · Saudi Arabia',
      scope: 'Corporate website & product catalogue',
      status: 'Live website',
      summary: 'Integrated Technical Trading is based in Dammam and supplies heavy equipment parts and workshop consumables across Saudi Arabia. The website brings a broad industrial offer into one visual journey, moving from large equipment photography to the industries served, product categories, supplier brands and an enquiry form.',
      problem: 'A supplier spanning machinery, spare parts and consumables needs to make its range understandable to visitors with very different requirements. The website has to establish the industrial context quickly, separate the sectors served from the products offered, and give each part of the range a recognisable place on the page.',
      approach: [
        {
          title: 'Lead with the working environment',
          body: 'The hero uses full-width excavator photography and a dark gradient behind a large white headline. It makes the equipment focus immediately visible. A white navigation bar provides a steady frame, while the red enquiry block introduces the main accent colour and a clear point of emphasis.'
        },
        {
          title: 'Give the business story a clear place',
          body: 'The company introduction sits directly after the opening image. Separate business, vision and mission passages provide context before the product range appears. Bold headings, generous margins and restrained background patterning distinguish this text-led section from the photography around it.'
        },
        {
          title: 'Organise by sector before product',
          body: 'A horizontal carousel introduces operating environments such as construction, mining, marine and power generation. Tall photographic cards use short labels, visible numbering and coloured lower edges. The sector view gives the catalogue a practical context without adding long descriptions to every card.'
        },
        {
          title: 'Make a mixed catalogue easy to recognise',
          body: 'Eight product categories sit in a consistent grid. Isolated images of cranes, generators, safety equipment and smaller components share the same open background. This balances very different object sizes and lets the imagery do much of the work of identifying each category.'
        },
        {
          title: 'Carry the visual hierarchy through to enquiry',
          body: 'A supplier logo strip follows the catalogue, then a centred enquiry form closes the main content. Thin field rules keep the form visually light, while the red message button repeats the navigation accent. The sequence moves from company context to product recognition and then to a place to describe a requirement.'
        }
      ],
      stack: [
        { group: 'Frontend', items: ['HTML', 'CSS', 'JavaScript', 'jQuery'] },
        { group: 'Interface', items: ['Slick carousels', 'Fixed navigation', 'Product category grid', 'Enquiry form layout'] }
      ],
      outcome: [
        'One homepage presents the company introduction, industry coverage, product range, supplier logos and enquiry form in a clear sequence.',
        'Eight product categories have distinct imagery and labels within a consistent catalogue layout.',
        'The red, charcoal and white palette connects the navigation, section headings and form controls.',
        'Sector photography and supplier logos give the product range additional visual context.'
      ]
    }
  });
}());
