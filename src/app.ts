import express from 'express'
import { createProductRouter } from '@infrastructure/http/routes/product.routes'
import { createHealthRouter } from '@infrastructure/http/routes/health.routes'
import { createFinancialEntityRoutes } from '@infrastructure/http/routes/financialEntity.routes'
import {
  productController,
  healthController,
  financialEntityController,
  clientFinancialEntityController
} from '@infrastructure/dependencies'
import { requestLogger } from '@infrastructure/http/middlewares/requestLogger'

export const app = express()
app.use(express.json())
app.use(requestLogger)

app.use('/health', createHealthRouter(healthController))
app.use('/products', createProductRouter(productController))
app.use('/financial-entities', createFinancialEntityRoutes(financialEntityController,clientFinancialEntityController))
