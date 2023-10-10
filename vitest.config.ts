/// <reference types="vitest" />
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const rel = (path: string) => resolve(__dirname, path);

export default defineConfig({
  test: {
    globals: true,
    include: [rel('./src/**/*.test.ts')],
    coverage: {
      provider: 'v8',
    },
  },
});
