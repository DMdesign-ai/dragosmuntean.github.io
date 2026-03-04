export const COLORS = {
  bg: '#0a0e0a',
  star: '#4a4a4a',
  // Road / lane colors
  roadBg: '#0f150f',
  laneLine: '#1a2a1a',
  laneLineBright: '#2a3a2a',
  // Obstacle colors
  obstacleRock: '#8B6914',
  obstacleRockDark: '#6b4f10',
  obstacleSpike: '#ff0040',
  obstacleSpikeDark: '#cc0033',
  obstacleBarrier: '#3a5a3a',
  obstacleBarrierBright: '#5a7a2a',
  // Collectible
  coin: '#ffd700',
  coinShadow: '#b8960f',
  // HUD
  scoreText: '#00ff41',
  gameOverText: '#ff0040',
  // Door portals
  doorCyan: '#00ffff',
  doorCyanDark: '#009999',
  doorCyanGlow: '#00ffff',
} as const;

export const PHYSICS = {
  playerSpeed: 4,
  playerVerticalSpeed: 3,
  baseScrollSpeed: 2.5,
  maxScrollSpeed: 8,
  speedIncreaseRate: 0.0005, // per frame
} as const;

export const GAME = {
  starCount: 50,
  playerSize: 24,
  obstacleMinGap: 60,       // min vertical gap between obstacles
  spawnInterval: 45,         // frames between obstacle spawns (decreases over time)
  minSpawnInterval: 18,      // fastest spawn rate
  coinChance: 0.3,           // chance to spawn a coin between obstacles
  laneLineSpacing: 32,       // vertical spacing of lane dashes
  laneLineWidth: 2,
  laneLineDashLength: 12,
  // Door portals
  doorSpawnInterval: 900,  // frames between door spawns (~150m)
  doorWidth: 48,
  doorHeight: 40,
  doorSpeed: 0.7,          // slower than obstacles so player can reach them
  doorTransitionFrames: 48, // ~800ms at 60fps
} as const;
