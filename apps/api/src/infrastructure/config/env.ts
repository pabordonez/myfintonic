import 'dotenv/config'
import { z } from 'zod'

const isProduction = process.env.NODE_ENV === 'production'

// Reusable schema: Comma-separated string -> Array of URLs
const corsOriginSchema = z
  .string()
  .transform((val) => {
    return val.split(',').map((v) => v.trim())
  })
  .pipe(z.array(z.string().url()))

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),

  // Database Credentials
  DB_ROOT_PASSWORD: z.string().min(1, 'DB_ROOT_PASSWORD is required'),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),

  // Connection URL (Prisma)
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // JWT (Future use)
  JWT_SECRET: z.string().min(10, 'JWT_SECRET is required and must be secure'),

  // Admin Seed
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),

  // Mandatory in Production. Has a default value in Development.
  CORS_ORIGIN: isProduction
    ? corsOriginSchema
    : corsOriginSchema.optional().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000), // 15 minutes (900000 ms)
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(1000),

  // Rate Limiting Specifics
  RATE_LIMIT_LOGIN_WINDOW_MS: z.coerce.number().int().positive().default(60000), // 1 minute
  RATE_LIMIT_LOGIN_MAX_REQUESTS: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_PRODUCTS_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(900000), // 15 minutes
  RATE_LIMIT_PRODUCTS_MAX_REQUESTS: z.coerce
    .number()
    .int()
    .positive()
    .default(1000),

  // Cookie Configuration
  COOKIE_MAX_AGE: z.coerce
    .number()
    .int()
    .positive()
    .default(24 * 60 * 60 * 1000), // 24 hours (86400000 ms)
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(_env.error.format(), null, 2)
  )
  throw new Error('Invalid environment variables')
}

export const env = _env.data
