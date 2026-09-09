/** Melahah: client website, with a captured page that scrolls inside its card. */
(function () {
  'use strict';

  window.Projects = window.Projects || [];
  window.Projects.splice(1, 0, {
    slug: 'melahah',
    title: 'Melahah — Marine Consulting',
    category: 'Web Design',
    year: '',
    client: 'Melahah · Saudi Arabia',
    cover: 'assets/images/work/melahah-cover.webp',
    coverAlt: 'Melahah website with an ocean film hero and the headline A clearer course. A stronger future.',
    scrollPreview: 'assets/images/work/melahah-scroll.webp',
    gallery: [
      { src: 'assets/images/work/melahah-company.webp', alt: 'Melahah company introduction and large photograph of a vessel at sea.', caption: 'Company — Saudi expertise, an international perspective, and a maritime visual identity.' },
      { src: 'assets/images/work/melahah-expertise.webp', alt: 'Four Melahah expertise tabs with the Strategy panel selected.', caption: 'Expertise — four service areas organised into one focused tabbed interface.' },
      { src: 'assets/images/work/melahah-approach.webp', alt: 'Melahah approach section showing the Excellence, Partnership, Accountability and Safety accordions.', caption: 'Approach — a compact accordion introduces the principles behind the partnership.' },
      { src: 'assets/images/work/melahah-contact.webp', alt: 'Melahah enquiry section with offshore installation photography, email and telephone links.', caption: 'Contact — a direct invitation to discuss the next marine business challenge.' }
    ],
    description: 'A marine consulting website for a client in Saudi Arabia, pairing maritime imagery with a clear route through expertise, company values and enquiries.',
    source: 'https://melahah.boombaangh.co.uk/',
    liveUrl: 'https://melahah.boombaangh.co.uk/',
    caseStudy: {
      client: 'Melahah · Saudi Arabia',
      scope: 'Corporate website',
      status: 'Website preview',
      summary: 'Melahah is a Saudi marine consulting firm based in Dammam, with expertise in offshore oil and gas and a regional focus across the Middle East. The website presents that specialist knowledge through a confident maritime identity: an ocean film, spacious editorial typography and a service structure that moves from the company story to the right conversation.',
      problem: 'Marine consulting covers several different kinds of decisions, from business strategy and operational performance to offshore work and assurance. The design challenge is to make that breadth understandable without turning the homepage into a dense catalogue. A prospective client needs to recognise the firm’s specialism, find a relevant service and see how to get in touch within one coherent journey.',
      approach: [
        {
          title: 'Establish the marine context immediately',
          body: 'The opening screen pairs vessel footage with a concise positioning statement. Deep navy overlays keep the white headline legible, while orange accents identify the main enquiry action. The marine imagery establishes the sector before the visitor reaches the service descriptions.'
        },
        {
          title: 'Connect Saudi roots with a wider perspective',
          body: 'The company section introduces the Dammam base, offshore experience and Middle East focus together. A large vessel photograph gives the page a visual pause between the introduction and service detail. The copy keeps the local identity visible without losing the wider business context.'
        },
        {
          title: 'Turn four disciplines into a navigable system',
          body: 'Strategy, Operations, Offshore and Assurance are presented as four tabs. Each selection gives a service area its own headline, explanation, supporting list and contact route. This lets visitors explore the offer in manageable sections while keeping the full range of expertise easy to find.'
        },
        {
          title: 'Make the working relationship tangible',
          body: 'An accordion groups the firm’s approach around Excellence, Partnership, Accountability, and Safety & environment. Expanding one principle reveals its supporting explanation. The interaction gives these values space in the story while preserving a concise layout.'
        },
        {
          title: 'Bring the journey back to a conversation',
          body: 'The closing enquiry section uses offshore imagery alongside a direct invitation to talk. Email and telephone links are followed by the Dammam office address, working hours and directions. Visitors can move from understanding the offer to choosing a practical contact method.'
        },
        {
          title: 'Keep motion considerate',
          body: 'The hero includes a video playback control, and the styles provide a reduced-motion treatment for the intro, film and reveal effects. Motion supports the atmosphere; the written content and navigation continue to carry the page.'
        }
      ],
      stack: [
        { group: 'Frontend', items: ['Next.js', 'React', 'CSS'] },
        { group: 'Experience', items: ['HTML video', 'Service tabs', 'Values accordion', 'Responsive layouts', 'Reduced-motion styles'] }
      ],
      outcome: [
        'A consistent marine identity carries through the opening film, vessel imagery, colour palette and contact section.',
        'Four distinct consulting disciplines are available from a single, focused service interface.',
        'The firm’s Saudi base and regional context are visible in both the company story and office details.',
        'Enquiry links appear at relevant points in the journey, with email, telephone and directions available near the close.'
      ]
    }
  });
}());
