import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const root = createRoot(document.getElementById('root') || document.body.appendChild(document.createElement('div')))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
