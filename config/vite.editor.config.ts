import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, '../src/editor/index.ts'),
      name: 'CIHotspotEditor',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'js-cloudimage-hotspot-editor.esm.js';
        if (format === 'cjs') return 'js-cloudimage-hotspot-editor.cjs.js';
        return 'js-cloudimage-hotspot-editor.min.js';
      },
    },
    outDir: resolve(__dirname, '../dist/editor'),
    emptyOutDir: true,
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
