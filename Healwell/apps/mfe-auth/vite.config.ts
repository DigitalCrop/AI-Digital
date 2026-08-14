import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
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
  server: {
    port: 3001
  }
})
