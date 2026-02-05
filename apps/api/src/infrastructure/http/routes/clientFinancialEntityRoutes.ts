import { Router } from 'express'
import { ClientFinancialEntityController } from '../controllers/clientFinancialEntityController'
import { authenticate } from '../middlewares/authenticate'
import { isAdmin } from '../middlewares/isAdmin'
import { clientOwnershipMiddleware } from '../middlewares/clientOwnershipMiddleware'

export const createClientFinancialEntityRoutes = (controller: ClientFinancialEntityController) => {
  const clientFinancialEntityRouter = Router()

  // 1. Autenticación global
  clientFinancialEntityRouter.use(authenticate)

  // 2. Rutas de Administrador (Globales)
  clientFinancialEntityRouter.get('/clients-financial-entities', isAdmin, (req, res) => controller.getAllAssociations(req, res))

  // 3. Rutas protegidas por propiedad del cliente (/clients/:clientId/...)
  clientFinancialEntityRouter.post('/clients/:clientId/financial-entities', clientOwnershipMiddleware, (req, res) => controller.create(req, res))
  clientFinancialEntityRouter.get('/clients/:clientId/financial-entities', clientOwnershipMiddleware, (req, res) => controller.getAll(req, res))
  clientFinancialEntityRouter.get('/clients/:clientId/financial-entities/:id', clientOwnershipMiddleware, (req, res) => controller.getById(req, res))
  clientFinancialEntityRouter.put('/clients/:clientId/financial-entities/:id', clientOwnershipMiddleware, (req, res) => controller.updateBalance(req, res))
  clientFinancialEntityRouter.delete('/clients/:clientId/financial-entities/:id', clientOwnershipMiddleware, (req, res) => controller.delete(req, res))
  
  return clientFinancialEntityRouter
}