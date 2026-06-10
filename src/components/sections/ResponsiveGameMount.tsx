import { useState, useEffect } from 'react';
import GameWorld from './GameWorld';

/**
 * Wrapper that conditionally mounts GameWorld based on viewport width.
 * Prevents two game canvases from running simultaneously when using
 * separate desktop/mobile layout blocks in the HTML.
 */
export default function ResponsiveGameMount({ layout }: { layout: 'desktop' | 'mobile' }) {
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const check = () => {
      setShouldMount(layout === 'desktop' ? mql.matches : !mql.matches);
    };
    check();
    mql.addEventListener('change', check);
    return () => mql.removeEventListener('change', check);
  }, [layout]);

  if (!shouldMount) return null;
  return <GameWorld />;
}
