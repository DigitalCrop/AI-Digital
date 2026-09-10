import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
const shared = {
  react: { singleton: true, requiredVersion: '^19.1.1' },
  'react-dom': { singleton: true, requiredVersion: '^19.1.1' },
  'react-router-dom': { singleton: true, requiredVersion: '^7.8.2' },
  '@mfe/shared-auth': { singleton: true, requiredVersion: '^1.0.0' },
};
export default defineConfig({
  base: 'http://localhost:3001/',
  plugins: [
    react(),
    federation({
      name: 'products',
      filename: 'remoteEntry.js',
      exposes: { './Routes': './src/Routes.tsx' },
      shared,
    }),
  ],
  build: { target: 'chrome89', sourcemap: true },
  server: { port: 3001, strictPort: true, origin: 'http://localhost:3001', cors: true },
});
