import typescript from '@rollup/plugin-typescript';

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'index.ts',
  output: [
    {
      file: '.pkg/cjs/index.js',
      format: 'cjs',
      sourcemap: false,
      exports: 'named',
    },
    {
      file: '.pkg/esm/index.js',
      format: 'esm',
      sourcemap: false,
      exports: 'named',
    },
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.rollup.json',
      sourceMap: false,
      noEmit: true,
      emitDeclarationOnly: false,
      noForceEmit: true,
    }),
  ],
};
