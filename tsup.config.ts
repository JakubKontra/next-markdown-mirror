import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    nextjs: 'src/nextjs.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  clean: true,
  sourcemap: true,
  external: ['next'],
});
