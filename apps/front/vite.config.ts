// apps/front/vite.config.ts
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_URL = env.VITE_API_URL || 'http://127.0.0.1:3000'

  return {
    plugins: [
      react() as any,
      {
        name: 'html-env-replacement',
        transformIndexHtml(html) {
          return html.replace(/%VITE_API_URL%/g, API_URL)
        },
      },
    ],
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
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
      exclude: ['**/*.d.ts', '**/node_modules/**', '**/dist/**'],
    },
    server: {
      host: true,
      port: 5173,
      watch: {
        usePolling: true,
      },
    },
  }
})
