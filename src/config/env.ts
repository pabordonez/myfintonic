import { z } from 'zod';
import 'dotenv/config'; 
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  
  // Credenciales de Base de Datos
  DB_ROOT_PASSWORD: z.string().min(1, "DB_ROOT_PASSWORD is required"),
  DB_NAME: z.string().min(1, "DB_NAME is required"),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
  
  // URL de conexión (Prisma)
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  
  // JWT (Uso futuro)
  JWT_SECRET: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 2));
  throw new Error('Invalid environment variables');
}

export const env = _env.data;