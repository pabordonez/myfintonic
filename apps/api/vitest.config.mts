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
      exclude: [
        'src/infrastructure/persistence/prisma/repository/prismaClient.ts',
        'src/infrastructure/persistence/prisma/seed.ts', 
        '**/*.d.ts',
        '**/node_modules/**',
        '**/dist/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, './src/domain'),
      '@application': path.resolve(__dirname, './src/application'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure')
    },
  },
})
