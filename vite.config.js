import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimización de chunks
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons': ['lucide-react'],
          'spline': ['@splinetool/react-spline']
        }
      }
    },
    // Optimización de tamaño
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Chunks más pequeños
    chunkSizeWarningLimit: 1000
  },
  // Optimización de performance
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react']
  }
})
