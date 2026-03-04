import { COLORS, GAME } from '../gameConstants';
import {
  drawSprite,
  COIN_SPRITE,
  DOOR_SPRITE,
  OBSTACLE_SPRITES,
  PLAYER_SPRITES,
} from './sprites';
import type { Obstacle, Coin, Star, PlayerState, Door } from './entities';
import type { GameMode } from './modes';
import { MODE_CONFIGS } from './modes';

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
 * Draw scrolling lane lines with mode-specific colors.
 */
export function drawLaneLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scrollOffset: number,
  mode: GameMode,
) {
  const config = MODE_CONFIGS[mode];
  const laneCount = 3;
  const laneWidth = width / (laneCount + 1);

  for (let lane = 1; lane <= laneCount; lane++) {
    const x = Math.floor(lane * laneWidth);

    for (
      let y = (scrollOffset % GAME.laneLineSpacing) - GAME.laneLineDashLength;
      y < height;
      y += GAME.laneLineSpacing
    ) {
      ctx.fillStyle = config.laneLineColor;
      ctx.fillRect(x, Math.floor(y), GAME.laneLineWidth, GAME.laneLineDashLength);
    }
  }

  // Side borders
  ctx.fillStyle = config.laneLineBrightColor;
  ctx.fillRect(4, 0, 1, height);
  ctx.fillRect(width - 5, 0, 1, height);
}

/**
 * Draw a single obstacle using mode-specific sprite lookup.
 */
export function drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle, mode: GameMode) {
  const sprite = OBSTACLE_SPRITES[mode]?.[obstacle.type];
  if (sprite) {
    drawSprite(ctx, sprite, obstacle.x, obstacle.y, 2);
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
 * Draw the player character using mode-specific sprites.
 */
export function drawPlayer(ctx: CanvasRenderingContext2D, player: PlayerState, mode: GameMode) {
  if (!player.alive && Math.floor(player.invincibleTimer) % 4 < 2) return; // death flash

  // Invincibility flash after respawn
  if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer) % 6 < 3) {
    ctx.globalAlpha = 0.5;
  }

  const sprites = PLAYER_SPRITES[mode];
  const sprite = player.animFrame === 0 ? sprites.idle : sprites.run;
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
  ctx.fillStyle = 'rgba(10, 14, 10, 0.75)';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = COLORS.gameOverText;
  ctx.font = '16px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', width / 2, height / 2 - 30);

  ctx.fillStyle = COLORS.scoreText;
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.fillText(`SCORE: ${score}`, width / 2, height / 2 + 10);

  if (highScore > 0) {
    ctx.fillStyle = COLORS.coin;
    ctx.fillText(`BEST: ${highScore}`, width / 2, height / 2 + 30);
  }

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
  ctx.fillStyle = COLORS.scoreText;
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`${score}m`, 10, 18);

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

  const glowIntensity = 0.15 + Math.sin(frameCount * 0.08) * 0.1;
  ctx.save();
  ctx.globalAlpha = glowIntensity;
  ctx.fillStyle = COLORS.doorCyanGlow;
  ctx.fillRect(door.x - 6, door.y - 6, door.width + 12, door.height + 12);
  ctx.restore();

  drawSprite(ctx, DOOR_SPRITE, door.x, door.y, 2);

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
  progress: number,
) {
  const maxRadius = Math.sqrt(width * width + height * height) / 2;
  const radius = maxRadius * progress;

  ctx.save();
  ctx.globalAlpha = 0.5 + progress * 0.5;
  ctx.fillStyle = COLORS.doorCyan;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
  ctx.fill();

  if (progress > 0.25) {
    ctx.fillStyle = '#0a0e0a';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ENTERING...', width / 2, height / 2);
    ctx.textAlign = 'start';
  }
  ctx.restore();
}

/**
 * Draw the character/mode selection screen.
 */
export function drawCharacterSelect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  selectedIndex: number,
  frameCount: number,
) {
  drawBackground(ctx, width, height);

  // Title
  ctx.fillStyle = '#00ff41';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SELECT YOUR MODE', width / 2, height * 0.18);

  // Two selection boxes
  const boxW = Math.min(90, width * 0.38);
  const boxH = 110;
  const gap = 12;
  const totalW = boxW * 2 + gap;
  const startX = (width - totalW) / 2;
  const boxY = height * 0.26;

  const modes: GameMode[] = ['road', 'trail'];
  modes.forEach((mode, i) => {
    const config = MODE_CONFIGS[mode];
    const bx = startX + i * (boxW + gap);
    const isSelected = i === selectedIndex;

    // Box background
    ctx.fillStyle = isSelected ? 'rgba(0, 255, 65, 0.05)' : 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(bx, boxY, boxW, boxH);

    // Selection border (pulsing when selected)
    if (isSelected) {
      const pulse = 0.6 + Math.sin(frameCount * 0.1) * 0.4;
      ctx.globalAlpha = pulse;
    }
    ctx.strokeStyle = isSelected ? '#00ff41' : '#1a2a1a';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeRect(bx, boxY, boxW, boxH);
    ctx.globalAlpha = 1;

    // Mode label
    ctx.fillStyle = isSelected ? '#00ff41' : '#4a4a4a';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText(config.label, bx + boxW / 2, boxY + 18);

    // Draw sample obstacle sprite centered in box
    const sampleSprite = OBSTACLE_SPRITES[mode][config.obstacleTypes[0]];
    if (sampleSprite) {
      const spriteW = sampleSprite[0].length * 2;
      const spriteH = sampleSprite.length * 2;
      drawSprite(ctx, sampleSprite, bx + (boxW - spriteW) / 2, boxY + 32, 2);

      // Draw second obstacle below
      const sprite2 = OBSTACLE_SPRITES[mode][config.obstacleTypes[1]];
      if (sprite2) {
        const s2W = sprite2[0].length * 2;
        drawSprite(ctx, sprite2, bx + (boxW - s2W) / 2, boxY + 32 + spriteH + 6, 2);
      }
    }

    // Description
    ctx.fillStyle = isSelected ? '#00cc33' : '#3a3a3a';
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.fillText(config.description, bx + boxW / 2, boxY + boxH - 8);
  });

  // Blinking prompt
  if (Math.floor(frameCount / 30) % 2 === 0) {
    ctx.fillStyle = '#00ff41';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText('[LEFT/RIGHT] SELECT', width / 2, height * 0.82);
    ctx.fillText('[SPACE] START', width / 2, height * 0.82 + 14);
  }

  ctx.textAlign = 'start';
}
