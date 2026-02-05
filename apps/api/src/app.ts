import express from 'express'
import helmet from 'helmet'
import { env } from '@config/env'
import { createProductRoutes } from '@infrastructure/http/routes/productRoutes'
import { createAuthRoutes } from '@infrastructure/http/routes/authRoutes'
import { createClientFinancialEntityRoutes } from '@infrastructure/http/routes/clientFinancialEntityRoutes'
import { createHealthRouter } from '@infrastructure/http/routes/health.routes'
import { createFinancialEntityRoutes } from '@infrastructure/http/routes/financialEntity.routes'
import { createClientRoutes } from '@infrastructure/http/routes/client.routes'
import {
  authController,
  clientController,
  productController,
  clientFinancialEntityController,
  healthController,
  financialEntityController
} from '@infrastructure/dependencies'
import { requestLogger } from '@infrastructure/http/middlewares/requestLogger'
import { corsMiddleware } from '@infrastructure/http/middlewares/corsMiddleware'
import { rateLimitMiddleware } from '@infrastructure/http/middlewares/rateLimitMiddleware'

export const app = express()

// Si despliegas detrás de un proxy (Nginx, Cloudflare, AWS ELB), descomenta la siguiente línea
// para que el Rate Limit funcione correctamente con la IP real del usuario.
// app.set('trust proxy', 1)

app.use(helmet({
  strictTransportSecurity: env.NODE_ENV === 'production' ? undefined : false
}))

app.use(corsMiddleware)
app.use(rateLimitMiddleware)

app.use(express.json())
app.use(requestLogger)

// Configuración de Rutas
app.use('/auth', createAuthRoutes(authController, clientController))
app.use('/health', createHealthRouter(healthController))
app.use('/products', createProductRoutes(productController))
app.use('/financial-entities', createFinancialEntityRoutes(financialEntityController))
app.use('/clients', createClientRoutes(clientController))
app.use('/', createClientFinancialEntityRoutes(clientFinancialEntityController))
