import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  // The app is served from https://stromland.github.io/piano/
  base: '/piano/',
  plugins: [vue()],
  resolve: {
    alias: {
      // Use the library's source directly, so the app can be developed, tested
      // and built without building the library first.
      '@stromland/piano-lib': fileURLToPath(
        new URL('../piano-lib/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'happy-dom',
    coverage: {
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/*.test.ts', 'src/main.ts', 'src/env.d.ts'],
    },
  },
});
