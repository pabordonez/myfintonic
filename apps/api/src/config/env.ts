import 'dotenv/config'
import { z } from 'zod'

const isProduction = process.env.NODE_ENV === 'production'

// Esquema reutilizable: String separado por comas -> Array de URLs
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

  // Credenciales de Base de Datos
  DB_ROOT_PASSWORD: z.string().min(1, 'DB_ROOT_PASSWORD is required'),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),

  // URL de conexión (Prisma)
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // JWT (Uso futuro)
  JWT_SECRET: z.string().min(10, 'JWT_SECRET is required and must be secure'),

  // Admin Seed
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),

  // En Producción es obligatorio. En Desarrollo tiene un valor por defecto.
  CORS_ORIGIN: isProduction
    ? corsOriginSchema
    : corsOriginSchema.optional().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutos (900000 ms)
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
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
