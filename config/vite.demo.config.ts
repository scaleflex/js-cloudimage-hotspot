import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/js-cloudimage-hotspot/' : '/',
  root: resolve(__dirname, '../demo'),
  build: {
    outDir: resolve(__dirname, '../dist-demo'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      'js-cloudimage-hotspot': resolve(__dirname, '../src/index.ts'),
    },
  },
}));
