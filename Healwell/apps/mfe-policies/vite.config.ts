import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: { '@healthcare/ui': path.resolve(__dirname, '../../libs/ui/src/index.ts') }
  },
  plugins: [
    react(),
    federation({
      name: 'mfe_policies',
      filename: 'remoteEntry.js',
      exposes: {
        './Policies': './src/App.tsx'
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' }
      }
    })
  ],
  server: { host: '0.0.0.0', port: 4174, proxy: { '/api': 'http://localhost:4000' } }
})

