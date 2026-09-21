// @ts-check
import { defineConfig } from "astro/config";

import svelte from "@astrojs/svelte";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://coleman.stoltze.family",

  integrations: [svelte()],

  // Every page is prerendered. Only `/api/chat` opts into the Worker runtime,
  // via `export const prerender = false`.
  output: "static",

  // Nothing on the site stores per-visitor state, so skip sessions rather than
  // let the adapter auto-provision a KV namespace we would never read.
  session: false,

  adapter: cloudflare({
    // There are no raster images to transform -- only SVGs in public/. This
    // avoids requiring the Cloudflare Images binding.
    imageService: "passthrough",
  }),

  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // lucide-svelte ships raw .svelte files, which esbuild's dependency
      // optimizer cannot load ("No loader is configured for .svelte files").
      // Vite compiles them through the Svelte plugin instead.
      exclude: ["lucide-svelte"],
    },
  },
});
