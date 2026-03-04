import { useRef, useEffect, useCallback } from 'react';
import { createGameLoop } from '../../lib/game/loop';
import type { DoorProjectData, GameHandle } from '../../lib/game/loop';
import { InputHandler } from '../../lib/game/input';

// Project data for door portals (inlined because client:only can't import server modules)
const DOOR_PROJECTS: DoorProjectData[] = [
  { slug: 'warranty-claims-process-optimization', name: 'WARRANTY CLAIMS' },
  { slug: 'hybrid-explorer', name: 'HYBRID EXPLORER' },
  { slug: 'help-center-improvements', name: 'HELP CENTER' },
];

// Base path from Astro config
const BASE_PATH = '/dragosmuntean.github.io';

export default function GameWorld() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameHandleRef = useRef<GameHandle | null>(null);

  const handleDoorEnter = useCallback((projectSlug: string) => {
    setTimeout(() => {
      window.location.href = `${BASE_PATH}/projects/${projectSlug}`;
    }, 800);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const input = new InputHandler();

    const startGame = (width: number, height: number) => {
      if (gameHandleRef.current) gameHandleRef.current.cleanup();
      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = false;
      gameHandleRef.current = createGameLoop(ctx, width, height, input, DOOR_PROJECTS, {
        onDoorEnter: handleDoorEnter,
      });
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          startGame(Math.floor(width), Math.floor(height));
        }
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (gameHandleRef.current) gameHandleRef.current.cleanup();
      input.destroy();
    };
  }, [handleDoorEnter]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
        tabIndex={0}
        aria-label="Vertical runner game — select a mode, dodge obstacles, and enter portals to view projects"
      />
    </div>
  );
}
