/**
 * Employment history, as stated on LinkedIn.
 *
 * The freelance engagements between 2018 and 2021 ran under `dragos.is`, so
 * they are nested as clients rather than listed as separate jobs — a flat list
 * would read as eleven overlapping roles instead of one practice with clients.
 */

export interface Client {
  org: string;
  logo?: string;
  from: string;
  to: string;
  span: string;
}

export interface Role {
  org: string;
  /** Path to a logo in public/images/logos/. Falls back to a monogram tile. */
  logo?: string;
  title: string;
  kind?: string;
  from: string;
  to: string;
  span: string;
  place?: string;
  note?: string;
  current?: boolean;
  clients?: Client[];
}

export const roles: Role[] = [
  {
    org: 'TWINT',
    logo: '/images/logos/twint.webp',
    title: 'UX Designer',
    kind: 'Full-time',
    from: 'Sep 2025',
    to: 'Present',
    span: '1 yr',
    place: 'Zurich, CH',
    note: 'Swiss payments. The work is under NDA and does not appear on this site.',
    current: true,
  },
  {
    org: 'On',
    logo: '/images/logos/on.webp',
    title: 'Sr. UX/UI Designer',
    kind: 'Full-time',
    from: 'May 2022',
    to: 'Jun 2025',
    span: '3 yr 2 mo',
    place: 'Zurich, CH',
    note: 'Everything after the order: returns and exchanges, the help centre, warranty claims. Making the post-purchase experience as smooth as the buying.',
  },
  {
    org: 'dragos.is',
    title: 'Product Designer UI/UX',
    kind: 'Self-employed',
    from: 'Jun 2017',
    to: 'May 2022',
    span: '5 yr',
    place: 'Berlin, DE',
    note: 'Five years running my own practice, with engagements ranging from three months to nearly a year.',
    clients: [
      { org: 'not less but better',    from: 'Aug 2021', to: 'Oct 2021', span: '3 mo'  },
      { org: 'wefox', logo: '/images/logos/wefox.webp', from: 'Oct 2020', to: 'Feb 2021', span: '5 mo'  },
      { org: 'Marktplatz Mittelstand', logo: '/images/logos/marktplatz.webp', from: 'Jan 2020', to: 'Mar 2020', span: '3 mo'  },
      { org: 'freelancermap', logo: '/images/logos/freelancermap.webp', from: 'Oct 2019', to: 'Dec 2019', span: '3 mo'  },
      { org: 'CoachHub', logo: '/images/logos/coachhub.webp', from: 'Nov 2018', to: 'Aug 2019', span: '10 mo' },
    ],
  },
  {
    org: 'Flying.com',
    title: 'Design Lead',
    from: 'Nov 2014',
    to: 'Jun 2017',
    span: '2 yr 8 mo',
    note: 'Built the whole UX and design. Sat on the decision-making board and the strategy team, which meant shaping how the product developed rather than only how it looked.',
  },
  {
    org: 'KeepCalling',
    /* Rebranded as Tello. Their site blocks automated requests and serves an
       empty favicon, so this role keeps the monogram tile. */
    title: 'Design Lead and Manager',
    from: 'Feb 2009',
    to: 'Nov 2014',
    span: '5 yr 10 mo',
    note: 'Responsible for the brand and its visual identity. My team and I built the brand, the website, collateral, newsletters, ad formats, and the web app for iOS and Android. The company is now Tello.',
  },
  {
    org: 'Sibiu100%',
    logo: '/images/logos/sibiu100.webp',
    title: 'Graphic Designer',
    from: 'Mar 2008',
    to: 'Dec 2008',
    span: '10 mo',
    note: 'Newspaper.',
  },
];

/**
 * Initials for the monogram tile shown when a role has no logo file.
 * Two letters for multi-word names, otherwise the first two characters.
 */
export function initials(org: string): string {
  const words = org.replace(/[.]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
  return org.slice(0, 2).toUpperCase();
}

/** Earliest role now listed: Sibiu100%, Mar 2008. */
export const DESIGN_SINCE = 2008;
