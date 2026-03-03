import { PHYSICS } from '../gameConstants';
import { GAME } from '../gameConstants';
import type { InputHandler } from './input';
import {
  createPlatforms,
  createCoins,
  createStars,
  createPlayer,
  type Platform,
  type Coin,
  type Star,
  type PlayerState,
} from './entities';
import {
  drawBackground,
  drawStars,
  drawPlatform,
  drawCoin,
  drawPlayer,
} from './renderer';

interface GameState {
  platforms: Platform[];
  coins: Coin[];
  stars: Star[];
  player: PlayerState;
  score: number;
}

function initGameState(width: number, height: number): GameState {
  const platforms = createPlatforms(width, height);
  return {
    platforms,
    coins: createCoins(platforms),
    stars: createStars(width, height, GAME.starCount),
    player: createPlayer(width, height),
    score: 0,
  };
}

function update(state: GameState, input: InputHandler, width: number, height: number) {
  const { player, platforms, coins } = state;

  // Horizontal movement
  if (input.left) {
    player.velocityX = -PHYSICS.moveSpeed;
    player.facing = 'left';
  } else if (input.right) {
    player.velocityX = PHYSICS.moveSpeed;
    player.facing = 'right';
  } else {
    player.velocityX *= 0.8;
    if (Math.abs(player.velocityX) < 0.1) player.velocityX = 0;
  }

  // Jump
  if (input.jump && player.isGrounded) {
    player.velocityY = PHYSICS.jumpForce;
    player.isGrounded = false;
  }

  // Gravity
  player.velocityY += PHYSICS.gravity;
  if (player.velocityY > PHYSICS.maxFallSpeed) {
    player.velocityY = PHYSICS.maxFallSpeed;
  }

  // Apply velocity
  player.x += player.velocityX;
  player.y += player.velocityY;

  // Platform collision (only when falling)
  player.isGrounded = false;
  if (player.velocityY >= 0) {
    for (const platform of platforms) {
      if (
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.width &&
        player.y + player.height >= platform.y &&
        player.y + player.height <= platform.y + platform.height + player.velocityY + 2
      ) {
        player.y = platform.y - player.height;
        player.velocityY = 0;
        player.isGrounded = true;
        break;
      }
    }
  }

  // Screen bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > width) player.x = width - player.width;
  if (player.y > height) {
    // Fell off — reset to ground
    player.y = height - 40 - player.height;
    player.velocityY = 0;
    player.isGrounded = true;
  }

  // Coin collection
  for (const coin of coins) {
    if (coin.collected) continue;
    const dx = (player.x + player.width / 2) - coin.x;
    const dy = (player.y + player.height / 2) - coin.y;
    if (Math.sqrt(dx * dx + dy * dy) < 20) {
      coin.collected = true;
      state.score += 100;
    }
  }

  // Animation timer
  if (Math.abs(player.velocityX) > 0.5) {
    player.animTimer += 1;
    if (player.animTimer > 8) {
      player.animFrame = (player.animFrame + 1) % 2;
      player.animTimer = 0;
    }
  }
}

function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  width: number,
  height: number,
) {
  drawBackground(ctx, width, height);
  drawStars(ctx, state.stars);

  // Draw platforms
  state.platforms.forEach((p, i) => drawPlatform(ctx, p, i === 0));

  // Draw coins
  for (const coin of state.coins) {
    drawCoin(ctx, coin);
  }

  // Draw player
  drawPlayer(ctx, state.player);
}

export function createGameLoop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  input: InputHandler,
): () => void {
  const state = initGameState(width, height);
  let animId: number;
  let running = true;

  function tick() {
    if (!running) return;
    update(state, input, width, height);
    render(ctx, state, width, height);
    animId = requestAnimationFrame(tick);
  }

  animId = requestAnimationFrame(tick);

  return () => {
    running = false;
    cancelAnimationFrame(animId);
  };
}
