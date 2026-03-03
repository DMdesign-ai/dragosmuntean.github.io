import { PHYSICS, GAME } from '../gameConstants';
import type { InputHandler } from './input';
import {
  createObstacle,
  createCoin,
  createStars,
  createPlayer,
  type Obstacle,
  type Coin,
  type Star,
  type PlayerState,
} from './entities';
import {
  drawBackground,
  drawStars,
  drawLaneLines,
  drawObstacle,
  drawCoin,
  drawPlayer,
  drawGameOver,
  drawScoreHUD,
} from './renderer';

interface GameState {
  obstacles: Obstacle[];
  coins: Coin[];
  stars: Star[];
  player: PlayerState;
  score: number;
  highScore: number;
  scrollSpeed: number;
  scrollOffset: number;
  spawnTimer: number;
  coinSpawnTimer: number;
  frameCount: number;
  gameOver: boolean;
  started: boolean;
}

function initGameState(width: number, height: number, prevHighScore: number = 0): GameState {
  return {
    obstacles: [],
    coins: [],
    stars: createStars(width, height, GAME.starCount),
    player: createPlayer(width, height),
    score: 0,
    highScore: prevHighScore,
    scrollSpeed: PHYSICS.baseScrollSpeed,
    scrollOffset: 0,
    spawnTimer: 0,
    coinSpawnTimer: 0,
    frameCount: 0,
    gameOver: false,
    started: false,
  };
}

function update(state: GameState, input: InputHandler, width: number, height: number) {
  // Wait for first input to start the game
  if (!state.started) {
    if (input.left || input.right || input.up || input.down) {
      state.started = true;
    }
    return;
  }

  // Game over — wait for restart
  if (state.gameOver) {
    if (input.restart) {
      // Reset but keep high score
      const hs = state.highScore;
      const stars = state.stars;
      Object.assign(state, initGameState(width, height, hs));
      state.stars = stars; // reuse stars
      state.started = true;
    }
    return;
  }

  state.frameCount++;

  // Gradually increase speed
  state.scrollSpeed = Math.min(
    PHYSICS.maxScrollSpeed,
    PHYSICS.baseScrollSpeed + state.frameCount * PHYSICS.speedIncreaseRate,
  );

  // Update scroll offset for lane line animation
  state.scrollOffset += state.scrollSpeed;

  // Score = distance in meters
  state.score = Math.floor(state.frameCount / 6);

  // --- Player movement ---
  const p = state.player;

  // Invincibility countdown
  if (p.invincibleTimer > 0) {
    p.invincibleTimer -= 1;
  }

  if (input.left) {
    p.x -= PHYSICS.playerSpeed;
  }
  if (input.right) {
    p.x += PHYSICS.playerSpeed;
  }
  if (input.up) {
    p.y -= PHYSICS.playerVerticalSpeed;
  }
  if (input.down) {
    p.y += PHYSICS.playerVerticalSpeed;
  }

  // Clamp player to screen bounds
  if (p.x < 6) p.x = 6;
  if (p.x + p.width > width - 6) p.x = width - 6 - p.width;
  if (p.y < 30) p.y = 30; // leave room for HUD
  if (p.y + p.height > height - 4) p.y = height - 4 - p.height;

  // Run animation
  p.animTimer += 1;
  if (p.animTimer > 6) {
    p.animFrame = (p.animFrame + 1) % 2;
    p.animTimer = 0;
  }

  // --- Spawn obstacles ---
  state.spawnTimer++;
  const currentSpawnInterval = Math.max(
    GAME.minSpawnInterval,
    GAME.spawnInterval - Math.floor(state.frameCount / 120),
  );

  if (state.spawnTimer >= currentSpawnInterval) {
    state.spawnTimer = 0;
    const newObs = createObstacle(width, state.scrollSpeed);

    // Make sure new obstacle doesn't overlap existing ones near the top
    const tooClose = state.obstacles.some(
      (o) =>
        o.y < GAME.obstacleMinGap &&
        Math.abs(o.x - newObs.x) < o.width + 10,
    );

    if (!tooClose) {
      state.obstacles.push(newObs);
    }
  }

  // --- Spawn coins ---
  state.coinSpawnTimer++;
  if (state.coinSpawnTimer > currentSpawnInterval * 2 && Math.random() < GAME.coinChance) {
    state.coinSpawnTimer = 0;
    state.coins.push(createCoin(width));
  }

  // --- Move obstacles downward ---
  for (const obs of state.obstacles) {
    obs.y += state.scrollSpeed * obs.speed;
  }

  // --- Move coins downward ---
  for (const coin of state.coins) {
    coin.y += state.scrollSpeed * coin.speed;
  }

  // --- Remove off-screen obstacles and coins ---
  state.obstacles = state.obstacles.filter((o) => o.y < height + 20);
  state.coins = state.coins.filter((c) => c.y < height + 20 && !c.collected);

  // --- Move stars slowly for parallax ---
  for (const star of state.stars) {
    star.y += state.scrollSpeed * 0.15;
    if (star.y > height) {
      star.y = -2;
      star.x = Math.random() * width;
    }
  }

  // --- Collision detection (AABB with shrunk hitbox for fairness) ---
  if (p.invincibleTimer <= 0) {
    const hitboxShrink = 6; // pixels of forgiveness on each side
    const px1 = p.x + hitboxShrink;
    const py1 = p.y + hitboxShrink;
    const px2 = p.x + p.width - hitboxShrink;
    const py2 = p.y + p.height - hitboxShrink;

    for (const obs of state.obstacles) {
      const ox1 = obs.x + 2;
      const oy1 = obs.y + 2;
      const ox2 = obs.x + obs.width - 2;
      const oy2 = obs.y + obs.height - 2;

      if (px1 < ox2 && px2 > ox1 && py1 < oy2 && py2 > oy1) {
        // Collision!
        state.gameOver = true;
        p.alive = false;
        if (state.score > state.highScore) {
          state.highScore = state.score;
        }
        break;
      }
    }
  }

  // --- Coin collection ---
  if (p.alive) {
    for (const coin of state.coins) {
      if (coin.collected) continue;
      const dx = p.x + p.width / 2 - (coin.x + 8);
      const dy = p.y + p.height / 2 - (coin.y + 8);
      if (Math.sqrt(dx * dx + dy * dy) < 24) {
        coin.collected = true;
        state.score += 50;
      }
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
  drawLaneLines(ctx, width, height, state.scrollOffset);

  // Draw obstacles
  for (const obs of state.obstacles) {
    drawObstacle(ctx, obs);
  }

  // Draw coins
  for (const coin of state.coins) {
    drawCoin(ctx, coin);
  }

  // Draw player
  drawPlayer(ctx, state.player);

  // Draw HUD
  drawScoreHUD(ctx, width, state.score, state.scrollSpeed);

  // Pre-start prompt
  if (!state.started) {
    ctx.fillStyle = '#00ff41';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[ARROWS] TO RUN', width / 2, height / 2);
    ctx.textAlign = 'start';
  }

  // Game over overlay
  if (state.gameOver) {
    drawGameOver(ctx, width, height, state.score, state.highScore);
  }
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
