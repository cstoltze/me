import { getViteConfig } from "astro/config";
import type { ViteUserConfig } from "astro";

/**
 * Reuses Astro's Vite config so the Svelte plugin, Tailwind and aliases stay in
 * sync with the real build instead of being duplicated here.
 *
 * `astro:content` and `cloudflare:workers` are stubbed because they are virtual
 * modules that only exist inside an Astro build and the Workers runtime.
 */
export default getViteConfig({
  resolve: {
    conditions: ["browser"],
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/test-setup.ts"],
    globals: true,
    include: ["src/**/*.{test,spec}.{js,ts}"],
    alias: {
      "astro:content": new URL(
        "./src/test-mocks/astro-content.ts",
        import.meta.url,
      ).pathname,
      "cloudflare:workers": new URL(
        "./src/test-mocks/cloudflare-workers.ts",
        import.meta.url,
      ).pathname,
    },
  },
  // `getViteConfig` types its argument as Vite's own config, which has no
  // knowledge of Vitest's `test` key.
} as ViteUserConfig);
