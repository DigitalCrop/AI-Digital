import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
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
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
        '@healthcare/ui': { singleton: true, requiredVersion: false }
      }
    })
  ],
  server: { port: 5174, proxy: { '/api': 'http://localhost:4000' } }
})

