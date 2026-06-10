import type { GameMode } from './modes';
import { MODE_CONFIGS } from './modes';

export type ObstacleType = string;

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  speed: number; // individual speed modifier (0.8 - 1.2)
}

export interface Coin {
  x: number;
  y: number;
  collected: boolean;
  speed: number;
}

export interface Door {
  x: number;
  y: number;
  width: number;
  height: number;
  projectSlug: string;
  projectName: string;
  speed: number;
  entered: boolean;
  glowPhase: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export interface PlayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  animFrame: number;
  animTimer: number;
  alive: boolean;
  invincibleTimer: number; // brief flash after respawn
}

// Obstacle dimensions per type (in pixels at 2x scale)
const OBSTACLE_SIZES: Record<string, { w: number; h: number }> = {
  // Road mode
  car: { w: 20, h: 16 },     // 10x8 sprite at 2x
  cone: { w: 12, h: 16 },    // 6x8 sprite at 2x
  manhole: { w: 16, h: 16 }, // 8x8 sprite at 2x
  // Trail mode
  bear: { w: 20, h: 20 },    // 10x10 sprite at 2x
  log: { w: 24, h: 8 },      // 12x4 sprite at 2x
  bush: { w: 20, h: 16 },    // 10x8 sprite at 2x
};

export function createObstacle(
  canvasWidth: number,
  scrollSpeed: number,
  mode: GameMode,
): Obstacle {
  const types = MODE_CONFIGS[mode].obstacleTypes;
  const type = types[Math.floor(Math.random() * types.length)];
  const size = OBSTACLE_SIZES[type] ?? { w: 16, h: 16 };

  // Random horizontal position with padding from edges
  const padding = 20;
  const x = padding + Math.random() * (canvasWidth - size.w - padding * 2);

  return {
    x,
    y: -size.h - 10, // spawn above screen
    width: size.w,
    height: size.h,
    type,
    speed: 0.85 + Math.random() * 0.3, // some variation
  };
}

export function createCoin(canvasWidth: number): Coin {
  const padding = 20;
  const x = padding + Math.random() * (canvasWidth - 16 - padding * 2);
  return {
    x,
    y: -20,
    collected: false,
    speed: 1,
  };
}

export function createStars(canvasWidth: number, canvasHeight: number, count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      size: Math.random() > 0.7 ? 2 : 1,
      opacity: 0.2 + Math.random() * 0.4,
    });
  }
  return stars;
}

export function createDoor(
  canvasWidth: number,
  projectSlug: string,
  projectName: string,
): Door {
  const width = 48;  // 24px sprite at 2x
  const height = 40; // 20px sprite at 2x
  // Position in center third of canvas for visibility
  const centerStart = canvasWidth / 3;
  const x = centerStart + Math.random() * (centerStart - width);
  return {
    x,
    y: -height - 20,
    width,
    height,
    projectSlug,
    projectName,
    speed: 0.7,
    entered: false,
    glowPhase: 0,
  };
}

export function createPlayer(canvasWidth: number, canvasHeight: number): PlayerState {
  return {
    x: canvasWidth / 2 - 16, // center horizontally (32px sprite width / 2)
    y: canvasHeight - 60,     // near bottom
    width: 32,                // 16px sprite at 2x scale
    height: 36,               // 18px sprite at 2x scale
    animFrame: 0,
    animTimer: 0,
    alive: true,
    invincibleTimer: 0,
  };
}
