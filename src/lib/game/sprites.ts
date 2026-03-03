// Pixel art sprite data as 2D arrays
// Each cell is a hex color string or '' for transparent

const _ = '';
const G = '#00ff41'; // green
const D = '#00cc33'; // dark green
const K = '#008822'; // darker green
const Y = '#ffd700'; // gold/yellow
const B = '#0a0e0a'; // black (bg)

// 16x20 runner character - standing pose
export const RUNNER_IDLE: (string | '')[][] = [
  // Row 0-4: Head
  [_, _, _, _, _, G, G, G, G, G, G, _, _, _, _, _],
  [_, _, _, _, _, G, G, G, G, G, G, _, _, _, _, _],
  [_, _, _, _, _, G, B, G, G, B, G, _, _, _, _, _],
  [_, _, _, _, _, G, G, G, G, G, G, _, _, _, _, _],
  [_, _, _, _, _, G, G, G, G, G, G, _, _, _, _, _],
  // Row 5-10: Body
  [_, _, _, _, D, D, D, D, D, D, D, D, _, _, _, _],
  [_, _, D, D, D, D, D, D, D, D, D, D, D, D, _, _],
  [_, _, D, D, D, D, D, D, D, D, D, D, D, D, _, _],
  [_, _, _, _, D, D, D, D, D, D, D, D, _, _, _, _],
  [_, _, _, _, D, D, D, D, D, D, D, D, _, _, _, _],
  [_, _, _, _, D, D, D, D, D, D, D, D, _, _, _, _],
  // Row 11-15: Legs
  [_, _, _, _, _, K, K, K, _, K, K, K, _, _, _, _],
  [_, _, _, _, _, K, K, K, _, K, K, K, _, _, _, _],
  [_, _, _, _, _, K, K, K, _, K, K, K, _, _, _, _],
  [_, _, _, _, _, K, K, K, _, K, K, K, _, _, _, _],
  [_, _, _, _, _, K, K, K, _, K, K, K, _, _, _, _],
  // Row 16-17: Shoes
  [_, _, _, _, Y, Y, Y, Y, _, Y, Y, Y, Y, _, _, _],
  [_, _, _, _, Y, Y, Y, Y, _, Y, Y, Y, Y, _, _, _],
];

// 16x20 runner character - running pose (arms/legs shifted)
export const RUNNER_RUN: (string | '')[][] = [
  // Head
  [_, _, _, _, _, G, G, G, G, G, G, _, _, _, _, _],
  [_, _, _, _, _, G, G, G, G, G, G, _, _, _, _, _],
  [_, _, _, _, _, G, B, G, G, B, G, _, _, _, _, _],
  [_, _, _, _, _, G, G, G, G, G, G, _, _, _, _, _],
  [_, _, _, _, _, G, G, G, G, G, G, _, _, _, _, _],
  // Body with arms out
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
  // Shoes
  [_, Y, Y, Y, _, _, _, _, _, _, _, _, _, Y, Y, Y],
  [_, Y, Y, Y, _, _, _, _, _, _, _, _, _, Y, Y, Y],
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
