import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@healthcare/auth': path.resolve(__dirname, '../../libs/auth/src/index.tsx'),
      '@healthcare/api': path.resolve(__dirname, '../../libs/api/src/client.ts'),
      '@healthcare/ui': path.resolve(__dirname, '../../libs/ui/src/index.ts')
    }
  },
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        mfe_auth: 'http://localhost:3101/remoteEntry.js',
        mfe_policies: 'http://localhost:4174/remoteEntry.js',
        mfe_claims: 'http://localhost:4175/remoteEntry.js'
      },
      shared: ['react', 'react-dom', 'react-router-dom']
    })
  ],
  build: {
    outDir: '../../dist/apps/shell'
  },
  server: {
    host: '0.0.0.0',
    port: 3010
  }
})
