export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Coin {
  x: number;
  y: number;
  collected: boolean;
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
  velocityX: number;
  velocityY: number;
  isGrounded: boolean;
  facing: 'left' | 'right';
  animFrame: number;
  animTimer: number;
}

export function createPlatforms(canvasWidth: number, canvasHeight: number): Platform[] {
  const groundY = canvasHeight - 40;
  const platforms: Platform[] = [
    // Ground
    { x: 0, y: groundY, width: canvasWidth, height: 40 },
  ];

  // Floating platforms at various heights
  const configs = [
    { xRatio: 0.15, yRatio: 0.78, w: 100 },
    { xRatio: 0.35, yRatio: 0.65, w: 90 },
    { xRatio: 0.55, yRatio: 0.55, w: 110 },
    { xRatio: 0.25, yRatio: 0.45, w: 80 },
    { xRatio: 0.65, yRatio: 0.38, w: 100 },
    { xRatio: 0.45, yRatio: 0.25, w: 90 },
  ];

  for (const cfg of configs) {
    platforms.push({
      x: cfg.xRatio * canvasWidth,
      y: cfg.yRatio * canvasHeight,
      width: cfg.w,
      height: 16,
    });
  }

  return platforms;
}

export function createCoins(platforms: Platform[]): Coin[] {
  const coins: Coin[] = [];
  // Place 2 coins on each floating platform
  for (let i = 1; i < platforms.length; i++) {
    const p = platforms[i];
    const spacing = p.width / 3;
    coins.push(
      { x: p.x + spacing, y: p.y - 14, collected: false },
      { x: p.x + spacing * 2, y: p.y - 14, collected: false },
    );
  }
  return coins;
}

export function createStars(canvasWidth: number, canvasHeight: number, count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * (canvasHeight - 60),
      size: Math.random() > 0.7 ? 2 : 1,
      opacity: 0.3 + Math.random() * 0.5,
    });
  }
  return stars;
}

export function createPlayer(canvasWidth: number, canvasHeight: number): PlayerState {
  return {
    x: canvasWidth * 0.75,
    y: canvasHeight - 40 - 36,
    width: 24,
    height: 36,
    velocityX: 0,
    velocityY: 0,
    isGrounded: true,
    facing: 'right',
    animFrame: 0,
    animTimer: 0,
  };
}
