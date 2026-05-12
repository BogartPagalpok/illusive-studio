import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', 
  build: {
    outDir: 'dist',
    // Standardizing helps Vercel's crawler find the assets
    chunkSizeWarningLimit: 1000,
  }
});
