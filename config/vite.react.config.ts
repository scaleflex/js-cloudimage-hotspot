import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, '../src/react/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'es') return 'index.js';
        return 'index.cjs';
      },
    },
    outDir: resolve(__dirname, '../dist/react'),
    emptyOutDir: false,
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
