import { COLORS, GAME } from '../gameConstants';
import {
  drawSprite,
  RUNNER_UP,
  RUNNER_UP_RUN,
  ROCK_SPRITE,
  SPIKE_SPRITE,
  BARRIER_SPRITE,
  COIN_SPRITE,
  DOOR_SPRITE,
} from './sprites';
import type { Obstacle, Coin, Star, PlayerState, Door } from './entities';

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

/**
 * Draw scrolling lane lines — vertical dashes that scroll downward
 * to create the visual effect of forward movement.
 */
export function drawLaneLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scrollOffset: number,
) {
  const laneCount = 3;
  const laneWidth = width / (laneCount + 1);

  for (let lane = 1; lane <= laneCount; lane++) {
    const x = Math.floor(lane * laneWidth);

    // Draw dashes along this lane line
    for (
      let y = (scrollOffset % GAME.laneLineSpacing) - GAME.laneLineDashLength;
      y < height;
      y += GAME.laneLineSpacing
    ) {
      ctx.fillStyle = COLORS.laneLine;
      ctx.fillRect(x, Math.floor(y), GAME.laneLineWidth, GAME.laneLineDashLength);
    }
  }

  // Side borders (subtle)
  ctx.fillStyle = COLORS.laneLineBright;
  ctx.fillRect(4, 0, 1, height);
  ctx.fillRect(width - 5, 0, 1, height);
}

/**
 * Draw a single obstacle based on its type.
 */
export function drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
  const scale = 2;
  switch (obstacle.type) {
    case 'rock':
      drawSprite(ctx, ROCK_SPRITE, obstacle.x, obstacle.y, scale);
      break;
    case 'spike':
      drawSprite(ctx, SPIKE_SPRITE, obstacle.x, obstacle.y, scale);
      break;
    case 'barrier':
      drawSprite(ctx, BARRIER_SPRITE, obstacle.x, obstacle.y, scale);
      break;
  }
}

/**
 * Draw a coin collectible.
 */
export function drawCoin(ctx: CanvasRenderingContext2D, coin: Coin) {
  if (coin.collected) return;
  drawSprite(ctx, COIN_SPRITE, coin.x, coin.y, 2);
}

/**
 * Draw the player character (top-down runner).
 */
export function drawPlayer(ctx: CanvasRenderingContext2D, player: PlayerState) {
  if (!player.alive && Math.floor(player.invincibleTimer) % 4 < 2) return; // death flash

  // Invincibility flash after respawn
  if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer) % 6 < 3) {
    ctx.globalAlpha = 0.5;
  }

  const sprite = player.animFrame === 0 ? RUNNER_UP : RUNNER_UP_RUN;
  drawSprite(ctx, sprite, Math.floor(player.x), Math.floor(player.y), 2);

  ctx.globalAlpha = 1;
}

/**
 * Draw the GAME OVER overlay.
 */
export function drawGameOver(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  score: number,
  highScore: number,
) {
  // Dim overlay
  ctx.fillStyle = 'rgba(10, 14, 10, 0.75)';
  ctx.fillRect(0, 0, width, height);

  // GAME OVER text
  ctx.fillStyle = COLORS.gameOverText;
  ctx.font = '16px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', width / 2, height / 2 - 30);

  // Score
  ctx.fillStyle = COLORS.scoreText;
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.fillText(`SCORE: ${score}`, width / 2, height / 2 + 10);

  // High score
  if (highScore > 0) {
    ctx.fillStyle = COLORS.coin;
    ctx.fillText(`BEST: ${highScore}`, width / 2, height / 2 + 30);
  }

  // Restart prompt
  ctx.fillStyle = COLORS.scoreText;
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillText('[SPACE] TO RETRY', width / 2, height / 2 + 60);

  ctx.textAlign = 'start';
}

/**
 * Draw in-game score HUD.
 */
export function drawScoreHUD(
  ctx: CanvasRenderingContext2D,
  width: number,
  score: number,
  scrollSpeed: number,
) {
  // Score (top left)
  ctx.fillStyle = COLORS.scoreText;
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`${score}m`, 10, 18);

  // Speed indicator (top right)
  const speedPct = Math.floor((scrollSpeed / 8) * 100);
  ctx.textAlign = 'right';
  ctx.fillStyle = speedPct > 70 ? COLORS.gameOverText : COLORS.scoreText;
  ctx.fillText(`SPD:${speedPct}%`, width - 10, 18);

  ctx.textAlign = 'start';
}

/**
 * Draw a door portal with pulsing glow effect and project name label.
 */
export function drawDoor(
  ctx: CanvasRenderingContext2D,
  door: Door,
  frameCount: number,
) {
  if (door.entered) return;

  // Pulsing glow behind the portal
  const glowIntensity = 0.15 + Math.sin(frameCount * 0.08) * 0.1;
  ctx.save();
  ctx.globalAlpha = glowIntensity;
  ctx.fillStyle = COLORS.doorCyanGlow;
  ctx.fillRect(door.x - 6, door.y - 6, door.width + 12, door.height + 12);
  ctx.restore();

  // Draw the portal sprite
  drawSprite(ctx, DOOR_SPRITE, door.x, door.y, 2);

  // Draw project name label below the portal
  ctx.fillStyle = COLORS.doorCyan;
  ctx.font = '6px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(door.projectName, door.x + door.width / 2, door.y + door.height + 12);
  ctx.textAlign = 'start';
}

/**
 * Draw the door-enter transition: expanding cyan circle with loading text.
 */
export function drawDoorTransition(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number, // 0 to 1
) {
  const maxRadius = Math.sqrt(width * width + height * height) / 2;
  const radius = maxRadius * progress;

  ctx.save();
  ctx.globalAlpha = 0.5 + progress * 0.5;
  ctx.fillStyle = COLORS.doorCyan;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
  ctx.fill();

  // Loading text appears after initial flash
  if (progress > 0.25) {
    ctx.fillStyle = '#0a0e0a';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ENTERING...', width / 2, height / 2);
    ctx.textAlign = 'start';
  }
  ctx.restore();
}
