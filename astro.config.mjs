// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://dragosmuntean.com',
  output: 'static',

  /* The site moved from the arcade build to the document build in 2026.
     These keep the old URLs working instead of 404ing anyone who linked them.
     Astro emits meta-refresh pages for these in a static build. */
  redirects: {
    '/projects': '/work',
    '/blog': '/notes',
    '/contact': '/about',
    '/projects/help-center-improvements': '/work/help-center-improvements',
    '/projects/hybrid-explorer': '/work/hybrid-explorer',
    '/projects/warranty-claims-process-optimization': '/work/warranty-claims-process-optimization',
    '/blog/agent-2-ui': '/notes/agent-2-ui',
    '/blog/beginner-calisthenics-figma-make': '/notes/beginner-calisthenics-figma-make',
    '/blog/from-zero-to-figma-plugins': '/notes/from-zero-to-figma-plugins',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react(), mdx()],
});
