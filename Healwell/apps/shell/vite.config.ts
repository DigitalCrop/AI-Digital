import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        mfe_auth: 'http://localhost:3001/remoteEntry.js'
        ,mfe_policies: 'http://localhost:5174/remoteEntry.js'
        ,mfe_claims: 'http://localhost:5175/remoteEntry.js'
      },
      shared: ['react', 'react-dom', 'react-router-dom', '@healthcare/ui']
    })
  ],
  server: {
    port: 3000
  }
})
