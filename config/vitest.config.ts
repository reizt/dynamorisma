/// <reference types="vitest" />
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    exclude: ['**/node_modules/**', '**/.pkg/**'],
    coverage: {
      provider: 'v8',
    },
  },
  resolve: {
    alias: {
      '#': resolve(__dirname, '../src'),
    },
  },
});
