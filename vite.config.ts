import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/pdf': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  define: {
    'global': 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Form libraries
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // UI libraries
          'ui-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          // Supabase
          'supabase-vendor': ['@supabase/supabase-js'],
          // Note: @react-pdf/renderer is not included here - it will be code-split
          // automatically when lazy-loaded pages (like FormWizardPage) are accessed
        },
      },
    },
    chunkSizeWarningLimit: 2000, // Increased to accommodate @react-pdf/renderer (~1.8MB) which is lazy-loaded
  },
})

