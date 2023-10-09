import { build } from 'esbuild';
import { resolve } from 'path';
import pkg from './package.json' assert { type: 'json' };

const parentDir = new URL('.', import.meta.url).pathname;
const rel = (path) => resolve(parentDir, path);

/** @type {import('esbuild').BuildOptions} */
const opts = {
  entryPoints: [rel('./index.ts')],
  target: 'es2022',
  platform: 'node',
  color: true,
  bundle: true,
  external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})],
};

const mode = process.argv[2];
if (mode === 'dev') {
  opts.outfile = rel('./.build/dev.js');
  opts.minify = false;
  opts.sourcemap = true;
} else if (mode === 'cjs') {
  opts.outfile = rel('./.pkg/cjs/index.js');
  opts.format = 'cjs';
  opts.minify = false;
  opts.sourcemap = false;
} else if (mode === 'esm') {
  opts.outfile = rel('./.pkg/esm/index.js');
  opts.format = 'esm';
  opts.minify = false;
  opts.sourcemap = false;
} else {
  throw new Error(`Invalid mode: ${mode}`);
}

try {
  const start = Date.now();
  console.log(`Building... (mode: ${mode})`);
  await build(opts);
  console.log(`Done! (${Date.now() - start}ms)`);
  process.exit(0);
} catch (err) {
  console.log('Build failed!');
  console.error(err);
  process.exit(1);
}
