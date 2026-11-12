import vue from '@vitejs/plugin-vue';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

/**
 * The version the app is built from, from its git tags: 0.7.0 when built from
 * the v0.7.0 tag, 0.7.0-3-gd60ffd6 three commits after it, and only the commit
 * when there are no tags, such as in a shallow clone.
 */
function appVersion(): string {
  try {
    const described = execFileSync('git', ['describe', '--tags', '--always'], {
      encoding: 'utf8',
    });
    return described.trim().replace(/^v/, '');
  } catch {
    return 'unknown';
  }
}

// https://vite.dev/config/
export default defineConfig({
  // The app is served from https://stromland.github.io/piano/
  base: '/piano/',
  define: {
    __APP_VERSION__: JSON.stringify(appVersion()),
  },
  build: {
    // Lists every bundled package with its license, for the Licenses page.
    license: { fileName: 'licenses.json' },
  },
  plugins: [
    vue(),
    // Makes the app installable and lets it work offline: the build gets a web
    // app manifest and a service worker that caches every file of the app.
    VitePWA({
      registerType: 'autoUpdate',
      // The icons are cached by globPatterns below.
      includeManifestIcons: false,
      manifest: {
        name: 'Piano – scales and chords',
        short_name: 'Piano',
        description:
          'See scales, chords and chord inversions on a piano keyboard.',
        start_url: '/piano/',
        scope: '/piano/',
        display: 'standalone',
        theme_color: '#073b4c',
        background_color: '#073b4c',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // The fonts are bundled as woff2 files and have to be cached too, but
        // only the Latin ones: the app has no Greek, Cyrillic or Vietnamese
        // text, and the browser only downloads a subset when text needs it.
        // The mp3 files are the piano recordings, and licenses.json is read by
        // the Licenses page.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mp3,json}'],
        globIgnores: [
          '**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese}-*.woff2',
        ],
      },
    }),
  ],
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
