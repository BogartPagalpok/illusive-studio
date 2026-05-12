import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', 
  build: {
    // Let Vite handle the hashes and directory structure automatically
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // We remove manualChunks to ensure a single, reliable entry point
        // and let Rollup optimize the vendor code naturally.
      },
    },
  },
});
