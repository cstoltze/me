// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        'shiki',
        '@ai-sdk/svelte',
        'lucide-svelte',
        'lucide-astro',
        'marked'
      ]
    }
  },

  adapter: node({
    mode: 'standalone'
  })
});