import express from 'express'
import helmet from 'helmet'
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

export const app = express()

app.use(helmet({
  strictTransportSecurity: false // Deshabilitado para desarrollo sin HTTPS
}))

app.use(corsMiddleware)

app.use(express.json())
app.use(requestLogger)

app.use('/health', createHealthRouter(healthController))
app.use('/products', createProductRouter(productController))
app.use('/financial-entities', createFinancialEntityRoutes(financialEntityController))
app.use('/clients', createClientRoutes(clientFinancialEntityController))
