// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Ensure this is a leading slash
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // This helps prevent the "index-By5dJxsy.js" mismatch after new deploys
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
