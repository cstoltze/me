import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte({ hot: !process.env.VITEST })],
    resolve: {
        conditions: ['browser'],
        alias: {
            'astro:content': '/src/test-mocks/astro-content.ts',
        },
    },
    test: {
        environment: 'happy-dom',
        setupFiles: ['./src/test-setup.ts'],
        globals: true,
        include: ['src/**/*.{test,spec}.{js,ts}'],
    },
});
