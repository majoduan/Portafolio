import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'lodash.debounce': 'lodash-es/debounce'
    }
  },
  build: {
    // Optimización de chunks mejorada
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons': ['lucide-react'],
          'spline': ['@splinetool/react-spline']
        },
        // Optimizar nombres de archivos
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Optimización de tamaño mejorada
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2
      },
      mangle: {
        safari10: true
      }
    },
    // Chunks más pequeños y mejor compresión
    chunkSizeWarningLimit: 800,
    cssCodeSplit: true,
    sourcemap: false,
    // Mejor compresión
    reportCompressedSize: true,
    // Optimizar assets
    assetsInlineLimit: 4096
  },
  // Optimización de performance mejorada
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'lodash-es'],
    exclude: ['@splinetool/react-spline']
  },
  // Servidor de desarrollo optimizado
  server: {
    hmr: {
      overlay: false
    }
  }
})
