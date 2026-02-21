import express from 'express'
import cookieParser from 'cookie-parser'
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
import {
  loginRateLimiter,
  productsRateLimiter,
} from '@infrastructure/http/middlewares/rateLimiters'
import { errorHandler } from '@infrastructure/http/middlewares/errorHandler'

export const app = express()

app.set('trust proxy', 1)

app.use(securityHeaders)

app.use(corsMiddleware)
app.use(rateLimitMiddleware)

// Rate Limits Específicos (Granular)
app.use('/auth/login', loginRateLimiter)
app.use('/products', productsRateLimiter)

app.use(cookieParser())
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

app.use(errorHandler)
