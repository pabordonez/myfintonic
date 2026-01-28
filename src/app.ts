import express from 'express'
import helmet from 'helmet'
import { env } from '@config/env'
import { createProductRouter } from '@infrastructure/http/routes/product.routes'
import { createHealthRouter } from '@infrastructure/http/routes/health.routes'
import { createFinancialEntityRoutes } from '@infrastructure/http/routes/financialEntity.routes'
import { createClientRoutes } from '@infrastructure/http/routes/client.routes'
import {
  productController,
  healthController,
  financialEntityController,
  clientFinancialEntityController
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

app.use('/health', createHealthRouter(healthController))
app.use('/products', createProductRouter(productController))
app.use('/financial-entities', createFinancialEntityRoutes(financialEntityController))
app.use('/clients', createClientRoutes(clientFinancialEntityController))
