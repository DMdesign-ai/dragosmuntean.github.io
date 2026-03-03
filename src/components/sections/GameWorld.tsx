import { useRef, useEffect } from 'react';
import { createGameLoop } from '../../lib/game/loop';
import { InputHandler } from '../../lib/game/input';

export default function GameWorld() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const input = new InputHandler();
    let gameCleanup: (() => void) | null = null;

    const startGame = (width: number, height: number) => {
      if (gameCleanup) gameCleanup();
      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = false;
      gameCleanup = createGameLoop(ctx, width, height, input);
    };

    // Use ResizeObserver to track the container size reliably
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
      if (gameCleanup) gameCleanup();
      input.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
        tabIndex={0}
        aria-label="Side-scrolling platformer game"
      />
    </div>
  );
}
