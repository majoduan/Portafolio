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
  // Configuración de preload para recursos críticos
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
      }
    }
  },
  build: {
    // Optimización de chunks mejorada con mejor estrategia de splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks optimizados - sin agrupar componentes
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('@splinetool')) {
              return 'spline';
            }
            // Otros vendors en un chunk separado
            return 'vendor';
          }
          // Dejar que Vite maneje automáticamente los componentes
        },
        // Optimizar nombres de archivos con hash largo para mejor caching
        chunkFileNames: 'assets/js/[name]-[hash:16].js',
        entryFileNames: 'assets/js/[name]-[hash:16].js',
        assetFileNames: (assetInfo) => {
          // Organizar assets por tipo
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return 'assets/images/[name]-[hash:8][extname]';
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return 'assets/fonts/[name]-[hash:8][extname]';
          }
          return 'assets/[name]-[hash:8][extname]';
        }
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
    // Optimizar assets con mejor threshold
    assetsInlineLimit: 4096,
    // Configuración de target para mejor compatibilidad y optimización
    target: 'es2020',
    // Habilitar CSS modules
    cssMinify: 'lightningcss'
  },
  // Optimización de performance mejorada
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'lodash-es'],
    exclude: ['@splinetool/react-spline'],
    // Force pre-bundling de dependencias críticas
    esbuildOptions: {
      target: 'es2020',
      supported: {
        'top-level-await': true
      }
    }
  },
  // Servidor de desarrollo optimizado
  server: {
    hmr: {
      overlay: false
    },
    // Configuración de headers para mejor caching
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  },
  // Preview server con configuración similar
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  }
})
