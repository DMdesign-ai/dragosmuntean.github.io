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

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  image?: string;
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
