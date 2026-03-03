export const COLORS = {
  bg: '#0a0e0a',
  star: '#4a4a4a',
  platformTop: '#5a7a2a',
  platformBody: '#8B6914',
  platformDark: '#6b4f10',
  coin: '#ffd700',
  coinShadow: '#b8960f',
  ground: '#8B6914',
  groundTop: '#5a7a2a',
  groundDirt: '#6b4f10',
} as const;

export const PHYSICS = {
  gravity: 0.5,
  jumpForce: -10,
  moveSpeed: 3,
  maxFallSpeed: 8,
} as const;

export const GAME = {
  starCount: 40,
  platformCount: 6,
  coinSize: 8,
  playerSize: 24,
  groundHeight: 40,
} as const;
