import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Base path: /obp/ para producción (fondothoth.com/obp)
// En desarrollo local, se sobreescribe con VITE_BASE_PATH=/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/obp/',
  plugins: [react()],
})

