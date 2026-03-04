export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  points: number;
  techTag: string;
  icon: 'code' | 'box' | 'terminal';
  category: 'work' | 'personal';
}

export interface LinkedInPost {
  id: string;
  scrollNumber: number;
  title: string;
  description: string;
  points: number;
  likes: string;
  comments: number;
}

export interface AIBoss {
  id: string;
  bossNumber: number;
  name: string;
  description: string;
  techStack: string;
  xp: number;
  hpPercent: number;
  isFinalBoss: boolean;
  barColor: 'gold' | 'red';
}

export interface SocialLink {
  name: string;
  url: string;
}
