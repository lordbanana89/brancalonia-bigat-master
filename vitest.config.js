import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        'scripts/',
        'packs/',
        'database/'
      ]
    },
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
    mockReset: true,
    restoreMocks: true
  }
});