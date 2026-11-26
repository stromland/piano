import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  // The app will be served from https://stromland.github.io/piano/accordion/
  base: '/piano/accordion/',
  // Next to the piano app, which takes 5173.
  server: { port: 5174 },
  plugins: [vue()],
  resolve: {
    alias: {
      // Use the library's source directly, so the app can be developed, tested
      // and built without building the library first.
      '@stromland/music-theory': fileURLToPath(
        new URL('../music-theory/src/index.ts', import.meta.url),
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
