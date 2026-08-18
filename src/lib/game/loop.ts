import { PHYSICS, GAME } from '../gameConstants';
import type { InputHandler } from './input';
import type { GameMode } from './modes';
import {
  createObstacle,
  createCoin,
  createDoor,
  createStars,
  createPlayer,
  type Obstacle,
  type Coin,
  type Door,
  type Star,
  type PlayerState,
} from './entities';
import {
  drawBackground,
  drawStars,
  drawLaneLines,
  drawObstacle,
  drawCoin,
  drawDoor,
  drawPlayer,
  drawSpeechBubble,
  drawGameOver,
  drawScoreHUD,
  drawDoorTransition,
  drawCharacterSelect,
} from './renderer';

// --- Public types for GameWorld.tsx ---

export interface DoorProjectData {
  slug: string;
  name: string;
}

export interface GameCallbacks {
  onDoorEnter: (projectSlug: string) => void;
  onGameStart?: () => void;
}

export interface GameHandle {
  cleanup: () => void;
  showSelection: () => void;
}

// --- Session persistence helpers ---

const STORAGE_KEY = 'runner_game_state';

interface SavedGameState {
  mode: GameMode;
  score: number;
  highScore: number;
  scrollSpeed: number;
  frameCount: number;
}

function saveGameState(state: GameState) {
  try {
    const saved: SavedGameState = {
      mode: state.selectedMode,
      score: state.score,
      highScore: state.highScore,
      scrollSpeed: state.scrollSpeed,
      frameCount: state.frameCount,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch { /* silently fail in SSR / private browsing */ }
}

function loadGameState(): SavedGameState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY); // consume once
    return JSON.parse(raw) as SavedGameState;
  } catch { return null; }
}

// --- Internal game state ---

type GamePhase = 'selecting' | 'playing';

interface GameState {
  phase: GamePhase;
  selectedMode: GameMode;
  selectIndex: number; // 0 = road, 1 = trail
  selectFrameCount: number;
  selectDebounce: number; // prevent rapid toggling

  obstacles: Obstacle[];
  coins: Coin[];
  doors: Door[];
  stars: Star[];
  player: PlayerState;
  score: number;
  highScore: number;
  scrollSpeed: number;
  scrollOffset: number;
  spawnTimer: number;
  coinSpawnTimer: number;
  doorSpawnTimer: number;
  doorProjectQueue: DoorProjectData[];
  frameCount: number;
  gameOver: boolean;
  started: boolean;
  navigating: boolean;
  navigateStartFrame: number;
}

function initGameState(
  width: number,
  height: number,
  projects: DoorProjectData[],
  prevHighScore: number = 0,
): GameState {
  return {
    phase: 'selecting',
    selectedMode: 'road',
    selectIndex: 0,
    selectFrameCount: 0,
    selectDebounce: 0,

    obstacles: [],
    coins: [],
    doors: [],
    stars: createStars(width, height, GAME.starCount),
    player: createPlayer(width, height),
    score: 0,
    highScore: prevHighScore,
    scrollSpeed: PHYSICS.baseScrollSpeed,
    scrollOffset: 0,
    spawnTimer: 0,
    coinSpawnTimer: 0,
    doorSpawnTimer: 0,
    doorProjectQueue: [...projects],
    frameCount: 0,
    gameOver: false,
    started: false,
    navigating: false,
    navigateStartFrame: 0,
  };
}

function update(
  state: GameState,
  input: InputHandler,
  width: number,
  height: number,
  projects: DoorProjectData[],
  callbacks: GameCallbacks,
) {
  // Freeze everything during door transition
  if (state.navigating) return;

  // ========== CHARACTER SELECTION PHASE ==========
  if (state.phase === 'selecting') {
    state.selectFrameCount++;

    // Debounce counter
    if (state.selectDebounce > 0) {
      state.selectDebounce--;
    }

    // Left/right to toggle selection (keyboard / swipe)
    if (state.selectDebounce === 0) {
      if (input.left && state.selectIndex > 0) {
        state.selectIndex = 0;
        state.selectDebounce = 10;
      }
      if (input.right && state.selectIndex < 1) {
        state.selectIndex = 1;
        state.selectDebounce = 10;
      }
    }

    // Tap-to-select: detect which mode box was tapped and start immediately
    const tap = input.consumeTap();
    if (tap) {
      // Recompute box bounds (must match drawCharacterSelect in renderer.ts)
      const gap = Math.max(24, Math.floor(width * 0.06));
      const boxW = Math.max(120, Math.floor((width - gap * 3) / 2));
      const boxH = Math.max(140, Math.floor(height * 0.48));
      const totalW = boxW * 2 + gap;
      const startX = (width - totalW) / 2;
      const boxY = Math.floor(height * 0.22);

      const box0x = startX;
      const box1x = startX + boxW + gap;

      let tappedIndex = -1;
      if (tap.x >= box0x && tap.x <= box0x + boxW && tap.y >= boxY && tap.y <= boxY + boxH) {
        tappedIndex = 0;
      } else if (tap.x >= box1x && tap.x <= box1x + boxW && tap.y >= boxY && tap.y <= boxY + boxH) {
        tappedIndex = 1;
      }

      if (tappedIndex >= 0) {
        state.selectIndex = tappedIndex;
        state.selectedMode = tappedIndex === 0 ? 'road' : 'trail';
        state.phase = 'playing';
        state.started = true;
        input.keys['Enter'] = false;
        input.keys[' '] = false;
        callbacks.onGameStart?.();
        return;
      }
    }

    // Confirm selection (keyboard: Space/Enter)
    if (input.confirm) {
      state.selectedMode = state.selectIndex === 0 ? 'road' : 'trail';
      state.phase = 'playing';
      state.started = true;
      // Clear keys to prevent immediate movement
      input.keys['Enter'] = false;
      input.keys[' '] = false;
      callbacks.onGameStart?.();
    }
    return;
  }

  // ========== PLAYING PHASE ==========

  // Escape → back to selection screen
  if (input.escape) {
    const hs = state.highScore;
    const stars = state.stars;
    Object.assign(state, initGameState(width, height, projects, hs));
    state.stars = stars;
    input.keys['Escape'] = false; // consume the key
    return;
  }

  // Game over — wait for restart → back to selection
  if (state.gameOver) {
    if (input.restart) {
      const hs = state.highScore;
      const stars = state.stars;
      Object.assign(state, initGameState(width, height, projects, hs));
      state.stars = stars;
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

  if (p.invincibleTimer > 0) {
    p.invincibleTimer -= 1;
  }

  if (input.left) p.x -= PHYSICS.playerSpeed;
  if (input.right) p.x += PHYSICS.playerSpeed;
  if (input.up) p.y -= PHYSICS.playerVerticalSpeed;
  if (input.down) p.y += PHYSICS.playerVerticalSpeed;

  // Clamp player to screen bounds
  if (p.x < 6) p.x = 6;
  if (p.x + p.width > width - 6) p.x = width - 6 - p.width;
  if (p.y < 30) p.y = 30;
  if (p.y + p.height > height - 4) p.y = height - 4 - p.height;

  // Run animation
  p.animTimer += 1;
  if (p.animTimer > 6) {
    p.animFrame = (p.animFrame + 1) % 2;
    p.animTimer = 0;
  }

  // --- Spawn obstacles (mode-aware) ---
  state.spawnTimer++;
  const currentSpawnInterval = Math.max(
    GAME.minSpawnInterval,
    GAME.spawnInterval - Math.floor(state.frameCount / 120),
  );

  if (state.spawnTimer >= currentSpawnInterval) {
    state.spawnTimer = 0;
    const newObs = createObstacle(width, state.scrollSpeed, state.selectedMode);

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

  // --- Spawn doors ---
  state.doorSpawnTimer++;
  if (
    state.doorSpawnTimer >= GAME.doorSpawnInterval &&
    state.doorProjectQueue.length > 0
  ) {
    state.doorSpawnTimer = 0;
    const next = state.doorProjectQueue.shift()!;
    state.doors.push(createDoor(width, next.slug, next.name));

    if (state.doorProjectQueue.length === 0) {
      state.doorProjectQueue = [...projects];
    }
  }

  // --- Move entities downward ---
  for (const obs of state.obstacles) {
    obs.y += state.scrollSpeed * obs.speed;
  }
  for (const coin of state.coins) {
    coin.y += state.scrollSpeed * coin.speed;
  }
  for (const door of state.doors) {
    door.y += state.scrollSpeed * door.speed;
    door.glowPhase += 0.05;
  }

  // --- Remove off-screen entities ---
  state.obstacles = state.obstacles.filter((o) => o.y < height + 20);
  state.coins = state.coins.filter((c) => c.y < height + 20 && !c.collected);
  state.doors = state.doors.filter((d) => d.y < height + 20 && !d.entered);

  // --- Move stars for parallax ---
  for (const star of state.stars) {
    star.y += state.scrollSpeed * 0.15;
    if (star.y > height) {
      star.y = -2;
      star.x = Math.random() * width;
    }
  }

  // --- Collision detection ---
  if (p.invincibleTimer <= 0) {
    const hitboxShrink = 6;
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

  // --- Door collision ---
  if (p.alive) {
    for (const door of state.doors) {
      if (door.entered) continue;
      const pcx = p.x + p.width / 2;
      const pcy = p.y + p.height / 2;
      if (
        pcx > door.x &&
        pcx < door.x + door.width &&
        pcy > door.y &&
        pcy < door.y + door.height
      ) {
        door.entered = true;
        state.navigating = true;
        state.navigateStartFrame = state.frameCount;
        // Persist game state so the game resumes when the user returns
        saveGameState(state);
        callbacks.onDoorEnter(door.projectSlug);
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
  // Character selection screen
  if (state.phase === 'selecting') {
    drawCharacterSelect(ctx, width, height, state.selectIndex, state.selectFrameCount);
    return;
  }

  // Playing phase
  const mode = state.selectedMode;

  drawBackground(ctx, width, height);
  drawStars(ctx, state.stars);
  drawLaneLines(ctx, width, height, state.scrollOffset, mode);

  for (const obs of state.obstacles) {
    drawObstacle(ctx, obs, mode);
  }
  for (const coin of state.coins) {
    drawCoin(ctx, coin);
  }
  for (const door of state.doors) {
    drawDoor(ctx, door, state.frameCount);
  }

  drawPlayer(ctx, state.player, mode);

  // Trail runner sings running-themed phrases
  if (mode === 'trail' && state.player.alive && !state.gameOver) {
    drawSpeechBubble(ctx, state.player, state.frameCount);
  }

  drawScoreHUD(ctx, width, state.score, state.scrollSpeed);

  if (state.gameOver) {
    drawGameOver(ctx, width, height, state.score, state.highScore);
  }

  if (state.navigating) {
    const elapsed = state.frameCount - state.navigateStartFrame;
    const progress = Math.min(elapsed / GAME.doorTransitionFrames, 1);
    drawDoorTransition(ctx, width, height, progress);
  }
}

export function createGameLoop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  input: InputHandler,
  projects: DoorProjectData[] = [],
  callbacks: GameCallbacks = { onDoorEnter: () => {} },
): GameHandle {
  // Check for saved state (returning from a project page)
  const saved = loadGameState();
  const state = initGameState(width, height, projects, saved?.highScore ?? 0);

  if (saved) {
    // Resume directly into playing phase with the same mode
    state.phase = 'playing';
    state.selectedMode = saved.mode;
    state.selectIndex = saved.mode === 'trail' ? 1 : 0;
    state.started = true;
    state.scrollSpeed = Math.min(saved.scrollSpeed, PHYSICS.maxScrollSpeed);
    state.frameCount = saved.frameCount;
    state.score = saved.score;
  }

  let animId: number;
  let running = true;

  // Fixed-timestep loop: always tick at 60fps regardless of monitor refresh rate.
  // High-refresh-rate monitors (120Hz, 144Hz) would otherwise run the game 2x+ faster
  // because all movement is frame-based, not time-based.
  const TARGET_FPS = 60;
  const FRAME_DURATION = 1000 / TARGET_FPS; // ~16.67ms
  let lastTime = 0;
  let accumulator = 0;

  function tick(timestamp: number) {
    if (!running) return;

    if (lastTime === 0) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    // Cap accumulated time to prevent spiral of death after tab-switch
    accumulator += Math.min(delta, 200);

    // Run fixed-step updates for each ~16.67ms that has elapsed
    while (accumulator >= FRAME_DURATION) {
      update(state, input, width, height, projects, callbacks);
      if (state.navigating) {
        state.frameCount++;
      }
      accumulator -= FRAME_DURATION;
    }

    render(ctx, state, width, height);
    animId = requestAnimationFrame(tick);
  }

  animId = requestAnimationFrame(tick);

  return {
    cleanup: () => {
      running = false;
      cancelAnimationFrame(animId);
    },
    showSelection: () => {
      // Reset to selection screen, preserving high score and stars
      const hs = state.highScore;
      const stars = state.stars;
      Object.assign(state, initGameState(width, height, projects, hs));
      state.stars = stars;
    },
  };
}
