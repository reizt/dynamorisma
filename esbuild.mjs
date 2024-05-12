import { build } from 'esbuild';
import pkg from './package.json' assert { type: 'json' };

/** @type {import('esbuild').BuildOptions} */
const opts = {
	entryPoints: ['./index.ts'],
	target: 'es2022',
	platform: 'node',
	color: true,
	bundle: true,
	external: [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})],
};

const mode = process.argv[2];
if (mode === 'dev') {
	opts.outfile = './.build/dev.js';
	opts.minify = false;
	opts.sourcemap = true;
} else if (mode === 'cjs') {
	opts.outfile = './.pkg/cjs/index.js';
	opts.format = 'cjs';
	opts.minify = false;
	opts.sourcemap = false;
} else if (mode === 'esm') {
	opts.outfile = './.pkg/esm/index.js';
	opts.format = 'esm';
	opts.minify = false;
	opts.sourcemap = false;
} else if (mode === 'cli') {
	opts.outfile = './.build/cli.js';
	opts.format = 'cjs';
	opts.minify = true;
	opts.sourcemap = true;
	opts.external = undefined;
} else {
	throw new Error(`Unknown mode: ${mode}`);
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
