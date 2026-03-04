import type { Project, LinkedInPost, AIBoss, SocialLink } from './types';

export const projects: Project[] = [
  {
    id: 'warranty-claims',
    slug: 'warranty-claims-process-optimization',
    name: 'Warranty Claims',
    description: 'Streamlined warranty claim UX with automated data validation — 230% faster processing',
    points: 2300,
    techTag: 'UX RESEARCH',
    icon: 'code',
    category: 'work',
  },
  {
    id: 'hybrid-explorer',
    slug: 'hybrid-explorer',
    name: 'Hybrid Explorer',
    description: 'Interactive in-store table for shoe comparison and discovery at On',
    points: 2800,
    techTag: 'PROTOTYPING',
    icon: 'box',
    category: 'work',
  },
  {
    id: 'help-center',
    slug: 'help-center-improvements',
    name: 'Help Center',
    description: 'Restructured help center layout with mobile-first redesign and improved self-service',
    points: 1900,
    techTag: 'UI DESIGN',
    icon: 'terminal',
    category: 'work',
  },
];

export const linkedInPosts: LinkedInPost[] = [
  {
    id: 'scroll-01',
    scrollNumber: 1,
    title: 'Why I Build Software Like I Train for Marathons',
    description:
      'Consistency beats intensity. Small daily commits compound into something extraordinary.',
    points: 2400,
    likes: '2.4K',
    comments: 186,
  },
  {
    id: 'scroll-02',
    scrollNumber: 2,
    title: 'The Unexpected Lesson From My First DNF',
    description:
      'Did Not Finish. Three words that taught me more about product development than any sprint retro.',
    points: 1800,
    likes: '1.8K',
    comments: 94,
  },
  {
    id: 'scroll-03',
    scrollNumber: 3,
    title: 'I Shipped an App at Mile 26 of a Marathon',
    description:
      'The CI/CD pipeline was green. I hit merge from my Apple Watch at the 26-mile mark.',
    points: 5100,
    likes: '5.1K',
    comments: 312,
  },
];

export const aiBosses: AIBoss[] = [
  {
    id: 'boss-01',
    bossNumber: 1,
    name: 'RunVision',
    description: 'AI running form analysis',
    techStack: 'GPT-4 + Vision',
    xp: 5008,
    hpPercent: 75,
    isFinalBoss: false,
    barColor: 'gold',
  },
  {
    id: 'boss-02',
    bossNumber: 2,
    name: 'TrailGen',
    description: 'AI art from GPS routes',
    techStack: 'Stable Diffusion',
    xp: 4200,
    hpPercent: 85,
    isFinalBoss: false,
    barColor: 'gold',
  },
  {
    id: 'boss-03',
    bossNumber: 3,
    name: 'PaceBot',
    description: 'Chat with running data',
    techStack: 'LLM + RAG',
    xp: 3800,
    hpPercent: 95,
    isFinalBoss: false,
    barColor: 'red',
  },
  {
    id: 'final-boss',
    bossNumber: 4,
    name: 'StrideAgent',
    description: 'Autonomous training AI',
    techStack: 'Claude + Agents',
    xp: 9999,
    hpPercent: 100,
    isFinalBoss: true,
    barColor: 'red',
  },
];

export const socialLinks: SocialLink[] = [
  { name: 'GITHUB', url: 'https://github.com/DMdesign-ai' },
  { name: 'LINKEDIN', url: 'https://linkedin.com/in/dragosmuntean' },
  { name: 'X', url: 'https://x.com/' },
  { name: 'STRAVA', url: 'https://strava.com/' },
];

export const stats = {
  totalScore: 99999,
  distance: '42.2 KM',
  items: '10/10',
};
