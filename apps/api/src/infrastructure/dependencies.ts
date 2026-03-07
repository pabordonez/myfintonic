import { PrismaProductRepository } from '@infrastructure/persistence/prisma/repository/PrismaProductRepository'
import { PrismaFinancialEntityRepository } from '@infrastructure/persistence/prisma/repository/PrismaFinancialEntityRepository'
import { PrismaClientFinancialEntityRepository } from '@infrastructure/persistence/prisma/repository/PrismaClientFinancialEntityRepository'
import { PrismaClientRepository } from '@infrastructure/persistence/prisma/repository/PrismaClientRepository'
import { PrismaProductTransactionRepository } from '@infrastructure/persistence/prisma/repository/PrismaProductTransactionRepository'

import { ProductUseCases } from '@application/useCases/productUseCases'
import { FinancialEntityUseCases } from '@application/useCases/financialEntityUseCases'
import { ClientFinancialEntityUseCases } from '@application/useCases/clientFinancialEntityUseCases'
import { AuthUseCases } from '@application/useCases/authUseCases'
import { ClientUseCases } from '@application/useCases/clientUseCases'
import { ProductTransactionUseCases } from '@application/useCases/productTransactionUseCases_tmp'

import { ProductController } from '@infrastructure/http/controllers/productController'
import { FinancialEntityController } from '@infrastructure/http/controllers/financialEntityController'
import { ClientFinancialEntityController } from '@infrastructure/http/controllers/clientFinancialEntityController'
import { HealthController } from '@infrastructure/http/controllers/healthController'
import { AuthController } from '@infrastructure/http/controllers/authController'
import { ClientController } from '@infrastructure/http/controllers/clientController'
import { ProductTransactionController } from '@infrastructure/http/controllers/productTransactionController_tmp'
import { BcryptEncryptionService } from '@infrastructure/services/bcryptEncryptionService'

export const productRepository = new PrismaProductRepository()
const productUseCases = new ProductUseCases(productRepository)
export const productController = new ProductController(productUseCases)

export const productTransactionRepository =
  new PrismaProductTransactionRepository()
const productTransactionUseCases = new ProductTransactionUseCases(
  productTransactionRepository,
  productRepository
)
export const productTransactionController = new ProductTransactionController(
  productTransactionUseCases
)

export const financialEntityRepository = new PrismaFinancialEntityRepository()
const financialEntityUseCases = new FinancialEntityUseCases(
  financialEntityRepository
)
export const financialEntityController = new FinancialEntityController(
  financialEntityUseCases
)

export const clientFinancialEntityRepository =
  new PrismaClientFinancialEntityRepository()
const clientFinancialEntityUseCases = new ClientFinancialEntityUseCases(
  clientFinancialEntityRepository
)
export const clientFinancialEntityController =
  new ClientFinancialEntityController(clientFinancialEntityUseCases)

export const clientRepository = new PrismaClientRepository()
const encryptionService = new BcryptEncryptionService()
const clientUseCases = new ClientUseCases(clientRepository, encryptionService)
export const clientController = new ClientController(clientUseCases)

const authUseCases = new AuthUseCases(clientRepository)
export const authController = new AuthController(authUseCases)

export const healthController = new HealthController()
