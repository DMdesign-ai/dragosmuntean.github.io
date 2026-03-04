import type { Project, BlogArticle, AIBoss, SocialLink } from './types';

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

export const blogArticles: BlogArticle[] = [
  {
    id: 'figma-plugins',
    slug: 'from-zero-to-figma-plugins',
    title: 'From 0 to Figma Plugins and SVG Transform Tools',
    description: '43 commits, 4 rewrites. A Figma plugin + web tool for SVG icon normalization, built with Claude Code.',
    date: 'MAR 2026',
    tags: ['Claude Code', 'Figma Plugin', 'SVG'],
    image: '/images/blog/figma-plugins.png',
  },
  {
    id: 'agent-2-ui',
    slug: 'agent-2-ui',
    title: 'Agent 2 UI',
    description: "We're about to stop designing interfaces. Google's A2UI and Disco show where we're headed.",
    date: 'JAN 2026',
    tags: ['AI', 'UX Design', 'A2UI'],
    image: '/images/blog/agent-2-ui.png',
  },
  {
    id: 'calisthenics-figma',
    slug: 'beginner-calisthenics-figma-make',
    title: 'Beginner Calisthenics Program — in Figma Make',
    description: 'Design systems + Make automation = AI-assisted dev that doesn\'t sacrifice design quality.',
    date: 'AUG 2025',
    tags: ['Figma', 'Design Systems', 'AI'],
    image: '/images/blog/calisthenics.png',
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
