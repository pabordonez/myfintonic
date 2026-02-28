import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Environment Configuration', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    // Vitest caches modules. We need to reset them to re-run the env.ts script
    // with different process.env values for each test.
    vi.resetModules()
  })

  afterEach(() => {
    // Restore the original environment variables after each test
    process.env = originalEnv
  })

  it('should load environment variables correctly when all are set', async () => {
    // Set all required variables for a successful load
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
    process.env.JWT_SECRET = 'a-very-secret-key'
    process.env.ADMIN_EMAIL = 'admin@test.com'
    process.env.ADMIN_PASSWORD = 'password123'
    // ... add any other required env vars here

    const { env } = await import('../src/infrastructure/config/env')

    expect(env).toBeDefined()
    expect(env.PORT).toBeDefined() // Assuming PORT has a default
  })

  it('should exit the process if required environment variables are missing', async () => {
    // Mock console.error and process.exit to test the failure path without crashing
    vi.spyOn(process, 'exit').mockImplementation((code) => {
      // Throw an error to make the promise reject, so we can catch it.
      throw new Error(`process.exit called with code ${code}`)
    })

    // Intentionally unset a required variable
    delete process.env.DATABASE_URL

    await expect(import('../src/infrastructure/config/env')).rejects.toThrow(
      'Invalid environment variables'
    )
  })
})
