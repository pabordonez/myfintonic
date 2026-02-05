import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      // Añade el archivo de cliente de prisma a las exclusiones
      exclude: [
        'src/infrastructure/persistence/prisma/client.ts',
        'src/infrastructure/persistence/prisma/seed.ts', // Si tienes seeds
        '**/*.d.ts',
        '**/node_modules/**',
        '**/dist/**',
      ],
    }
  },
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, './src/domain'),
      '@application': path.resolve(__dirname, './src/application'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@config': path.resolve(__dirname, './src/config'),
    },
  },
})
