import { Router } from 'express'
import { ClientFinancialEntityController } from '../controllers/clientFinancialEntityController'
import { ClientFinancialEntityUseCases } from '@application/useCases/clientFinancialEntityUseCases'
import { PrismaClientFinancialEntityRepository } from '@infrastructure/persistence/PrismaClientFinancialEntityRepository'
import { authMiddleware } from '../middlewares/authMiddleware'
import { clientOwnershipMiddleware } from '../middlewares/clientOwnershipMiddleware'

const clientFinancialEntityRouter = Router()
const repository = new PrismaClientFinancialEntityRepository()
const useCases = new ClientFinancialEntityUseCases(repository)
const controller = new ClientFinancialEntityController(useCases)

// 1. Autenticación global
clientFinancialEntityRouter.use(authMiddleware)

// 2. Rutas protegidas por propiedad del cliente (/clients/:clientId/...)
// El middleware verifica que req.user.id === :clientId
clientFinancialEntityRouter.use('/:clientId', clientOwnershipMiddleware)

clientFinancialEntityRouter.post('/:clientId/financial-entities', controller.create)
clientFinancialEntityRouter.get('/:clientId/financial-entities', controller.getAll)
clientFinancialEntityRouter.get('/:clientId/financial-entities/:id', controller.getById)
clientFinancialEntityRouter.put('/:clientId/financial-entities/:id', controller.updateBalance)
clientFinancialEntityRouter.delete('/:clientId/financial-entities/:id', controller.delete)

export { clientFinancialEntityRouter }