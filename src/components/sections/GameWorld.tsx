import { useRef, useEffect } from 'react';
import { createGameLoop } from '../../lib/game/loop';
import { InputHandler } from '../../lib/game/input';

export default function GameWorld() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement!;

    const resize = () => {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resize();

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const input = new InputHandler();
    let cleanup = createGameLoop(ctx, canvas.width, canvas.height, input);

    const handleResize = () => {
      resize();
      ctx.imageSmoothingEnabled = false;
      cleanup();
      cleanup = createGameLoop(ctx, canvas.width, canvas.height, input);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cleanup();
      input.destroy();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block cursor-crosshair"
      tabIndex={0}
      aria-label="Side-scrolling platformer game"
    />
  );
}
