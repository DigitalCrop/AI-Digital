import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
const shared = {
  react: { singleton: true, requiredVersion: '^19.1.1' },
  'react-dom': { singleton: true, requiredVersion: '^19.1.1' },
  'react-router-dom': { singleton: true, requiredVersion: '^7.8.2' },
  '@mfe/shared-auth': { singleton: true, requiredVersion: '^1.0.0' },
};
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const productsEnabled = env.VITE_ENABLE_PRODUCTS !== 'false';
  const ordersEnabled = env.VITE_ENABLE_ORDERS !== 'false';
  return {
    base: 'http://localhost:3000/',
    resolve:
      productsEnabled && ordersEnabled
        ? undefined
        : {
            alias: {
              ...(!productsEnabled && { 'products/Routes': resolve('src/disabled-remote.tsx') }),
              ...(!ordersEnabled && { 'orders/Routes': resolve('src/disabled-remote.tsx') }),
            },
          },
    plugins: [
      react(),
      federation({
        name: 'shell',
        remotes: {
          ...(productsEnabled
            ? {
                products: {
                  type: 'module' as const,
                  name: 'products',
                  entry: env.VITE_PRODUCTS_REMOTE_URL ?? 'http://localhost:3001/remoteEntry.js',
                },
              }
            : {}),
          ...(ordersEnabled
            ? {
                orders: {
                  type: 'module' as const,
                  name: 'orders',
                  entry: env.VITE_ORDERS_REMOTE_URL ?? 'http://localhost:3002/remoteEntry.js',
                },
              }
            : {}),
        },
        shared,
      }),
    ],
    build: { target: 'chrome89', sourcemap: true },
    server: { port: 3000, strictPort: true, origin: 'http://localhost:3000' },
  };
});
