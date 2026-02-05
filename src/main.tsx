import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer'
import './style.css'
import App from './App.tsx'

// Polyfill Buffer for @react-pdf/renderer
;(window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer
;(globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

