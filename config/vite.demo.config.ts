import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
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
});
