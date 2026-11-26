import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/index.ts'],
      // Branches are lower because of fallbacks that only exist to satisfy
      // noUncheckedIndexedAccess and can never be taken.
      thresholds: { statements: 95, branches: 80, functions: 95, lines: 95 },
    },
  },
});
