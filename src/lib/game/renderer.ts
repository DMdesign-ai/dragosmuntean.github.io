import { COLORS } from '../gameConstants';
import { drawSprite, RUNNER_IDLE, RUNNER_RUN, COIN_SPRITE } from './sprites';
import type { Platform, Coin, Star, PlayerState } from './entities';

export function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, width, height);
}

export function drawStars(ctx: CanvasRenderingContext2D, stars: Star[]) {
  for (const star of stars) {
    ctx.globalAlpha = star.opacity;
    ctx.fillStyle = COLORS.star;
    ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
  }
  ctx.globalAlpha = 1;
}

export function drawPlatform(ctx: CanvasRenderingContext2D, platform: Platform, isGround: boolean) {
  const { x, y, width, height } = platform;

  if (isGround) {
    // Ground: grass top + dirt body
    ctx.fillStyle = COLORS.groundTop;
    ctx.fillRect(Math.floor(x), Math.floor(y), width, 4);
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(Math.floor(x), Math.floor(y) + 4, width, height - 4);
    // Add dirt texture lines
    ctx.fillStyle = COLORS.groundDirt;
    for (let i = 0; i < width; i += 12) {
      ctx.fillRect(Math.floor(x) + i, Math.floor(y) + 10, 6, 2);
      ctx.fillRect(Math.floor(x) + i + 3, Math.floor(y) + 20, 8, 2);
    }
  } else {
    // Floating platform
    ctx.fillStyle = COLORS.platformTop;
    ctx.fillRect(Math.floor(x), Math.floor(y), width, 4);
    ctx.fillStyle = COLORS.platformBody;
    ctx.fillRect(Math.floor(x), Math.floor(y) + 4, width, height - 4);
  }
}

export function drawCoin(ctx: CanvasRenderingContext2D, coin: Coin) {
  if (coin.collected) return;
  drawSprite(ctx, COIN_SPRITE, coin.x - 4, coin.y - 4, 1);
}

export function drawPlayer(ctx: CanvasRenderingContext2D, player: PlayerState) {
  const sprite = Math.abs(player.velocityX) > 0.5 ? RUNNER_RUN : RUNNER_IDLE;
  const scale = 2;

  if (player.facing === 'left') {
    ctx.save();
    ctx.translate(Math.floor(player.x) + player.width, 0);
    ctx.scale(-1, 1);
    drawSprite(ctx, sprite, 0, Math.floor(player.y), scale);
    ctx.restore();
  } else {
    drawSprite(ctx, sprite, Math.floor(player.x), Math.floor(player.y), scale);
  }
}

export function drawRunner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
) {
  // Simplified inline runner for the bottom-right of the scene
  drawSprite(ctx, RUNNER_RUN, x, y, 2);
}
