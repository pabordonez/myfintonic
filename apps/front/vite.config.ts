// apps/front/vite.config.ts
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react() as any],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  server: {
    host: true, // Escuchar en todas las interfaces (0.0.0.0)
    port: 5173,
    watch: {
      usePolling: true, // Necesario para que HMR funcione bien con volúmenes de Docker
    },
  },
})
