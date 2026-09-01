import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@healthcare/auth': path.resolve(__dirname, '../../libs/auth/src'),
      '@healthcare/api': path.resolve(__dirname, '../../libs/api/src'),
      '@healthcare/ui': path.resolve(__dirname, '../../libs/ui/src')
    }
  },
  plugins: [
    react(),
    federation({
      name: 'mfe_auth',
      filename: 'remoteEntry.js',
      exposes: {
        './Login': './src/Login.tsx',
        './Register': './src/Register.tsx'
      },
      shared: ['react', 'react-dom']
    })
  ],
  build: {
    outDir: '../../dist/apps/mfe-auth'
  },
  server: {
    host: '0.0.0.0',
    port: 3101
  }
})
