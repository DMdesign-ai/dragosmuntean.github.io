// Pixel art sprite data as 2D arrays
// Each cell is a hex color string or '' for transparent

const _ = '';
const G = '#00ff41'; // green
const D = '#00cc33'; // dark green
const K = '#008822'; // darker green
const Y = '#ffd700'; // gold/yellow
const B = '#0a0e0a'; // black (bg)
const R = '#ff0040'; // red
const Rd = '#cc0033'; // dark red
const Br = '#8B6914'; // brown
const Bd = '#6b4f10'; // dark brown
const Lg = '#5a7a2a'; // light green
const Dg = '#3a5a3a'; // dim green
const C = '#00ffff'; // cyan (door portal)
const Cd = '#009999'; // dark cyan

// 16x18 runner character - facing camera (top-down "running up" view)
export const RUNNER_UP: (string | '')[][] = [
  // Head
  [_, _, _, _, _, G, G, G, G, G, G, _, _, _, _, _],
  [_, _, _, _, _, G, G, G, G, G, G, _, _, _, _, _],
  [_, _, _, _, _, G, B, G, G, B, G, _, _, _, _, _],
  [_, _, _, _, _, G, G, G, G, G, G, _, _, _, _, _],
  [_, _, _, _, _, G, G, G, G, G, G, _, _, _, _, _],
  // Body
  [_, _, _, _, D, D, D, D, D, D, D, D, _, _, _, _],
  [_, _, D, D, D, D, D, D, D, D, D, D, D, D, _, _],
  [_, _, D, D, D, D, D, D, D, D, D, D, D, D, _, _],
  [_, _, _, _, D, D, D, D, D, D, D, D, _, _, _, _],
  [_, _, _, _, D, D, D, D, D, D, D, D, _, _, _, _],
  [_, _, _, _, D, D, D, D, D, D, D, D, _, _, _, _],
  // Legs
  [_, _, _, _, _, K, K, K, _, K, K, K, _, _, _, _],
  [_, _, _, _, _, K, K, K, _, K, K, K, _, _, _, _],
  [_, _, _, _, _, K, K, K, _, K, K, K, _, _, _, _],
  [_, _, _, _, _, K, K, K, _, K, K, K, _, _, _, _],
  [_, _, _, _, _, K, K, K, _, K, K, K, _, _, _, _],
  // Shoes
  [_, _, _, _, Y, Y, Y, Y, _, Y, Y, Y, Y, _, _, _],
  [_, _, _, _, Y, Y, Y, Y, _, Y, Y, Y, Y, _, _, _],
];

// 16x18 runner - running frame 2 (legs spread)
export const RUNNER_UP_RUN: (string | '')[][] = [
  // Head
  [_, _, _, _, _, G, G, G, G, G, G, _, _, _, _, _],
  [_, _, _, _, _, G, G, G, G, G, G, _, _, _, _, _],
  [_, _, _, _, _, G, B, G, G, B, G, _, _, _, _, _],
  [_, _, _, _, _, G, G, G, G, G, G, _, _, _, _, _],
  [_, _, _, _, _, G, G, G, G, G, G, _, _, _, _, _],
  // Body with arms pumping
  [_, _, _, D, D, D, D, D, D, D, D, D, D, _, _, _],
  [_, D, D, D, D, D, D, D, D, D, D, D, D, D, D, _],
  [_, D, D, _, D, D, D, D, D, D, D, D, _, D, D, _],
  [_, _, _, _, D, D, D, D, D, D, D, D, _, _, _, _],
  [_, _, _, _, D, D, D, D, D, D, D, D, _, _, _, _],
  [_, _, _, _, D, D, D, D, D, D, D, D, _, _, _, _],
  // Legs spread
  [_, _, _, _, K, K, K, _, _, _, K, K, K, _, _, _],
  [_, _, _, K, K, K, _, _, _, _, _, K, K, K, _, _],
  [_, _, K, K, K, _, _, _, _, _, _, _, K, K, K, _],
  [_, _, K, K, _, _, _, _, _, _, _, _, _, K, K, _],
  [_, _, K, K, _, _, _, _, _, _, _, _, _, K, K, _],
  // Shoes spread
  [_, Y, Y, Y, _, _, _, _, _, _, _, _, _, Y, Y, Y],
  [_, Y, Y, Y, _, _, _, _, _, _, _, _, _, Y, Y, Y],
];

// 8x8 rock obstacle
export const ROCK_SPRITE: (string | '')[][] = [
  [_, _, Br, Br, Br, Br, _, _],
  [_, Br, Br, Br, Br, Br, Br, _],
  [Br, Br, Br, Bd, Br, Br, Br, Br],
  [Br, Br, Bd, Bd, Bd, Br, Br, Br],
  [Br, Bd, Bd, Bd, Bd, Bd, Br, Br],
  [Br, Br, Bd, Bd, Br, Br, Br, Br],
  [_, Br, Br, Br, Br, Br, Br, _],
  [_, _, Br, Br, Br, Br, _, _],
];

// 10x8 spike obstacle (red warning triangle)
export const SPIKE_SPRITE: (string | '')[][] = [
  [_, _, _, _, R, R, _, _, _, _],
  [_, _, _, R, R, R, R, _, _, _],
  [_, _, _, R, R, R, R, _, _, _],
  [_, _, R, R, Rd, Rd, R, R, _, _],
  [_, _, R, Rd, Rd, Rd, Rd, R, _, _],
  [_, R, R, Rd, Rd, Rd, Rd, R, R, _],
  [_, R, Rd, Rd, Rd, Rd, Rd, Rd, R, _],
  [R, R, R, R, R, R, R, R, R, R],
];

// 12x6 barrier obstacle (green terminal barrier)
export const BARRIER_SPRITE: (string | '')[][] = [
  [Dg, Lg, Dg, Lg, Dg, Lg, Dg, Lg, Dg, Lg, Dg, Lg],
  [Lg, Dg, Lg, Dg, Lg, Dg, Lg, Dg, Lg, Dg, Lg, Dg],
  [Dg, Dg, Dg, Dg, Dg, Dg, Dg, Dg, Dg, Dg, Dg, Dg],
  [Dg, Dg, Dg, Dg, Dg, Dg, Dg, Dg, Dg, Dg, Dg, Dg],
  [Lg, Dg, Lg, Dg, Lg, Dg, Lg, Dg, Lg, Dg, Lg, Dg],
  [Dg, Lg, Dg, Lg, Dg, Lg, Dg, Lg, Dg, Lg, Dg, Lg],
];

// 8x8 coin sprite
export const COIN_SPRITE: (string | '')[][] = [
  [_, _, Y, Y, Y, Y, _, _],
  [_, Y, Y, Y, Y, Y, Y, _],
  [Y, Y, Y, '#b8960f', '#b8960f', Y, Y, Y],
  [Y, Y, '#b8960f', '#b8960f', '#b8960f', '#b8960f', Y, Y],
  [Y, Y, '#b8960f', '#b8960f', '#b8960f', '#b8960f', Y, Y],
  [Y, Y, Y, '#b8960f', '#b8960f', Y, Y, Y],
  [_, Y, Y, Y, Y, Y, Y, _],
  [_, _, Y, Y, Y, Y, _, _],
];

// 24x20 door portal (archway with open center)
export const DOOR_SPRITE: (string | '')[][] = [
  // Top arch
  [_, _, _, _, _, C, C, C, C, C, C, C, C, C, C, C, C, C, C, _, _, _, _, _],
  [_, _, _, _, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, _, _, _, _],
  [_, _, _, C, C, Cd, Cd, Cd, Cd, Cd, Cd, Cd, Cd, Cd, Cd, Cd, Cd, Cd, Cd, C, C, _, _, _],
  [_, _, C, C, Cd, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, Cd, C, C, _],
  // Pillars with open center
  [_, _, C, C, Cd, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, Cd, C, C, _],
  [_, _, C, C, Cd, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, Cd, C, C, _],
  [_, _, C, C, Cd, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, Cd, C, C, _],
  [_, _, C, C, Cd, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, Cd, C, C, _],
  [_, _, C, C, Cd, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, Cd, C, C, _],
  [_, _, C, C, Cd, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, Cd, C, C, _],
  [_, _, C, C, Cd, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, Cd, C, C, _],
  [_, _, C, C, Cd, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, Cd, C, C, _],
  [_, _, C, C, Cd, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, Cd, C, C, _],
  [_, _, C, C, Cd, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, Cd, C, C, _],
  [_, _, C, C, Cd, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, Cd, C, C, _],
  [_, _, C, C, Cd, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, Cd, C, C, _],
  // Base
  [_, _, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, _],
  [_, _, C, C, Cd, Cd, Cd, Cd, Cd, Cd, Cd, Cd, Cd, Cd, Cd, Cd, Cd, Cd, Cd, Cd, C, C, _],
  [_, _, _, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, _, _],
  [_, _, _, _, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, _, _, _, _],
];

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: (string | '')[][],
  x: number,
  y: number,
  scale: number = 1,
) {
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const color = sprite[row][col];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(
          Math.floor(x + col * scale),
          Math.floor(y + row * scale),
          scale,
          scale,
        );
      }
    }
  }
}
