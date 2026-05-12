import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', 
  build: {
    outDir: 'dist',
    assetsDir: '', // This keeps JS/CSS in the root of 'dist'
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Simple naming to ensure Vercel can't miss the files
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]',
      },
    },
  },
});
