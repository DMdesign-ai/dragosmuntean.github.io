/**
 * THE SHIP LOG
 * ----------------------------------------------------------------
 * Hand-kept. No API, no token, no build-time fetch — every figure
 * here is a static fact, so nothing can break and there is no
 * empty state. Add an entry when something ships.
 *
 * `figure` is the one number the entry is judged on. Keep it a
 * real, checkable quantity — not a vibe. If there isn't one, use an
 * honest status word ("Parked", "Blocked on API") rather than
 * inventing a number or implying something shipped that didn't.
 */

export type LogKind = 'work' | 'lab' | 'note';

export interface LogEntry {
  n: number;
  title: string;
  meta: string;
  figure: string;
  date: string;      // ISO, for sorting and <time>
  kind: LogKind;
  href?: string;
}

export const shiplog: LogEntry[] = [
  {
    n: 14, title: 'svg-normalize', meta: 'Figma plugin + web tool',
    figure: '43 commits', date: '2026-03-01', kind: 'lab',
    href: '/v3/labs/svg-normalize/',
  },
  {
    n: 13, title: 'Runner portfolio', meta: 'Canvas game · Astro',
    figure: '1 685 lines', date: '2026-03-01', kind: 'lab',
    href: '/v3/labs/runner/',
  },
  {
    n: 12, title: 'Agent 2 UI', meta: 'Note · A2UI, Disco',
    figure: 'Published', date: '2026-01-01', kind: 'note',
    href: '/v3/notes/agent-2-ui/',
  },
  {
    n: 11, title: 'RIMWARD', meta: 'Colony ARPG · one HTML file',
    figure: '675 KB', date: '2025-09-01', kind: 'lab',
    href: '/v3/labs/rimward/',
  },
  {
    n: 10, title: 'Calisthenics program', meta: 'Figma Make · design systems',
    figure: 'Parked', date: '2025-08-01', kind: 'lab',
    href: '/v3/labs/calisthenics/',
  },
  {
    n: 9, title: 'Corippo Village Stays', meta: 'Booking site · AI-built',
    figure: 'Parked', date: '2025-05-01', kind: 'lab',
    href: '/v3/labs/corippo/',
  },
  {
    n: 8, title: 'EduTube', meta: 'Chrome extension',
    figure: 'Blocked on API', date: '2025-05-01', kind: 'lab',
    href: '/v3/labs/edutube/',
  },
  {
    n: 7, title: 'Warranty Claims', meta: 'On · UX research',
    figure: '2.3× faster', date: '2024-06-01', kind: 'work',
    href: '/v3/work/warranty-claims-process-optimization/',
  },
  {
    n: 6, title: 'Hybrid Explorer', meta: 'On · in-store retail',
    figure: 'In stores', date: '2024-03-01', kind: 'work',
    href: '/v3/work/hybrid-explorer/',
  },
  {
    n: 5, title: 'Help Center', meta: 'On · information architecture',
    figure: 'Mobile-first', date: '2024-01-01', kind: 'work',
    href: '/v3/work/help-center-improvements/',
  },
];

export const byDateDesc = (a: LogEntry, b: LogEntry) =>
  b.date.localeCompare(a.date) || b.n - a.n;
