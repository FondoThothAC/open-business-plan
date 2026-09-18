import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Base path: /obp/ para producción (fondothoth.com/obp)
// En desarrollo local, se sobreescribe con VITE_BASE_PATH=/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/obp/',
  plugins: [react()],
  build: {
    minify: 'terser',
    sourcemap: false, // Prevenir extracción de código fuente original
    terserOptions: {
      compress: {
        drop_console: true,     // Elimina todos los console.log/info/warn
        drop_debugger: true,    // Elimina breakpoints debugger
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2               // Múltiples pasadas de optimización y ofuscación
      },
      mangle: {
        toplevel: true          // Ofusca identificadores y variables de nivel superior
      },
      format: {
        comments: false         // Remueve todos los comentarios del bundle
      }
    },
    rollupOptions: {
      output: {
        // Nombres aleatorizados e indeterminados para dificultar scraping y mapeo
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]'
      }
    }
  }
})

