import { Router } from 'express'
import { ClientFinancialEntityController } from '@infrastructure/http/controllers/clientFinancialEntityController'
import { authenticate } from '@infrastructure/http/middlewares/authenticate'
import { isAdmin } from '@infrastructure/http/middlewares/isAdmin'
import { clientOwnershipMiddleware } from '@infrastructure/http/middlewares/clientOwnershipMiddleware'

export const createClientFinancialEntityRoutes = (controller: ClientFinancialEntityController) => {
  const clientFinancialEntityRouter = Router()

  // 2. Rutas de Administrador (Globales)
  clientFinancialEntityRouter.get('/clients-financial-entities', authenticate, isAdmin, (req, res) => controller.getAllAssociations(req, res))

  // 3. Rutas protegidas por propiedad del cliente (/clients/:clientId/...)
  clientFinancialEntityRouter.post('/clients/:clientId/financial-entities', authenticate, clientOwnershipMiddleware, (req, res) => controller.create(req, res))
  clientFinancialEntityRouter.get('/clients/:clientId/financial-entities', authenticate, clientOwnershipMiddleware, (req, res) => controller.getAll(req, res))
  clientFinancialEntityRouter.get('/clients/:clientId/financial-entities/:id', authenticate, clientOwnershipMiddleware, (req, res) => controller.getById(req, res))
  clientFinancialEntityRouter.put('/clients/:clientId/financial-entities/:id', authenticate, clientOwnershipMiddleware, (req, res) => controller.updateBalance(req, res))
  clientFinancialEntityRouter.delete('/clients/:clientId/financial-entities/:id', authenticate, clientOwnershipMiddleware, (req, res) => controller.delete(req, res))
  
  return clientFinancialEntityRouter
}