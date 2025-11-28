import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Compresión Brotli y Gzip para assets
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024,
      compressionOptions: { level: 11 }
    }),
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024
    })
  ],
  resolve: {
    alias: {
      'lodash.debounce': 'lodash-es/debounce'
    },
    dedupe: ['react', 'react-dom']
  },
  build: {
    // Copiar Service Worker a dist - Fase 2 optimization
    copyPublicDir: true,
    // Optimización de chunks mejorada con mejor estrategia de splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks optimizados - sin agrupar componentes
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react') || id.includes('react-icons')) {
              return 'icons';
            }
            if (id.includes('@splinetool')) {
              return 'spline';
            }
            if (id.includes('animejs')) {
              return 'animations';
            }
            if (id.includes('lodash')) {
              return 'utils';
            }
            // Otros vendors en un chunk separado
            return 'vendor';
          }
          // Split componentes grandes en chunks separados
          if (id.includes('src/components/HUDBootScreen')) {
            return 'boot-screen';
          }
          if (id.includes('src/components/ContactForm')) {
            return 'contact-form';
          }
          if (id.includes('src/data/')) {
            return 'data';
          }
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
    chunkSizeWarningLimit: 500,
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
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'lucide-react', 'lodash-es', '@splinetool/react-spline'],
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
