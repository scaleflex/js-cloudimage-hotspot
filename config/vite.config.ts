import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, '../src/index.ts'),
      name: 'CIHotspot',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'js-cloudimage-hotspot.esm.js';
        if (format === 'cjs') return 'js-cloudimage-hotspot.cjs.js';
        return 'js-cloudimage-hotspot.min.js';
      },
    },
    outDir: resolve(__dirname, '../dist'),
    emptyOutDir: false,
    sourcemap: true,
    minify: 'esbuild',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
  },
});
