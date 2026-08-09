import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/smarttrade/',
  server: {
    port: 5173,
    proxy: {
      '/smarttrade/api': { target: 'http://localhost:4000', changeOrigin: true, rewrite: (path) => path.replace(/^\/smarttrade\/api/, '/api') },
      '/smarttrade/ws': { target: 'ws://localhost:4000', ws: true, rewrite: (path) => path.replace(/^\/smarttrade\/ws/, '/ws') },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
