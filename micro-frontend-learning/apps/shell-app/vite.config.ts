import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
const shared = {
  react: { singleton: true, requiredVersion: '^19.1.1' },
  'react-dom': { singleton: true, requiredVersion: '^19.1.1' },
  'react-router-dom': { singleton: true, requiredVersion: '^7.8.2' },
  '@mfe/shared-auth': { singleton: true, requiredVersion: '^1.0.0' },
};
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: 'http://localhost:3000/',
    plugins: [
      react(),
      federation({
        name: 'shell',
        remotes: {
          products: {
            type: 'module',
            name: 'products',
            entry: env.VITE_PRODUCTS_REMOTE_URL ?? 'http://localhost:3001/remoteEntry.js',
          },
          orders: {
            type: 'module',
            name: 'orders',
            entry: env.VITE_ORDERS_REMOTE_URL ?? 'http://localhost:3002/remoteEntry.js',
          },
        },
        shared,
      }),
    ],
    build: { target: 'chrome89', sourcemap: true },
    server: { port: 3000, strictPort: true, origin: 'http://localhost:3000' },
  };
});
