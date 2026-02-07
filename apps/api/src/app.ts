import express from 'express'
import { createProductRouter } from '@infrastructure/http/routes/productRoutes'
import { createAuthRoutes } from '@infrastructure/http/routes/authRoutes'
import { createClientFinancialEntityRoutes } from '@infrastructure/http/routes/clientFinancialEntityRoutes'
import { createHealthRouter } from '@infrastructure/http/routes/healthRoutes'
import { createFinancialEntityRoutes } from '@infrastructure/http/routes/financialEntityRoutes'
import { createClientRoutes } from '@infrastructure/http/routes/clientRoutes'
import {
  authController,
  clientController,
  productController,
  productTransactionController,
  clientFinancialEntityController,
  healthController,
  financialEntityController,
} from '@infrastructure/dependencies'
import { requestLogger } from '@infrastructure/http/middlewares/requestLogger'
import { corsMiddleware } from '@infrastructure/http/middlewares/corsMiddleware'
import { rateLimitMiddleware } from '@infrastructure/http/middlewares/rateLimitMiddleware'
import { securityHeaders } from '@infrastructure/http/middlewares/securityHeaders'

export const app = express()

// Si despliegas detrás de un proxy (Nginx, Cloudflare, AWS ELB), descomenta la siguiente línea
// para que el Rate Limit funcione correctamente con la IP real del usuario.
// app.set('trust proxy', 1)

app.use(securityHeaders)

app.use(corsMiddleware)
app.use(rateLimitMiddleware)

app.use(express.json())
app.use(requestLogger)

// Configuración de Rutas
app.use('/auth', createAuthRoutes(authController, clientController))
app.use('/health', createHealthRouter(healthController))
app.use(
  '/products',
  createProductRouter(productController, productTransactionController)
)
app.use(
  '/financial-entities',
  createFinancialEntityRoutes(financialEntityController)
)
app.use('/clients', createClientRoutes(clientController))
app.use('/', createClientFinancialEntityRoutes(clientFinancialEntityController))
