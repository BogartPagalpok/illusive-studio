import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // This removes the warning by raising the limit to 1MB
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // This splits your heavy libraries into a separate file 
        // so the main site loads faster
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
