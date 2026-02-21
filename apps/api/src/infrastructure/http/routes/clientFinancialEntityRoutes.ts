import { Router } from 'express'
import { ClientFinancialEntityController } from '@infrastructure/http/controllers/clientFinancialEntityController'
import { authenticate } from '@infrastructure/http/middlewares/authenticate'
import { isAdmin } from '@infrastructure/http/middlewares/isAdmin'
import { clientOwnershipMiddleware } from '@infrastructure/http/middlewares/clientOwnershipMiddleware'

export const createClientFinancialEntityRoutes = (
  controller: ClientFinancialEntityController
) => {
  const clientFinancialEntityRouter = Router()

  // 2. Rutas de Administrador (Globales)
  clientFinancialEntityRouter.get(
    '/clients-financial-entities',
    authenticate,
    isAdmin,
    (req, res, next) => controller.getAllAssociations(req, res, next)
  )

  // 3. Rutas protegidas por propiedad del cliente (/clients/:clientId/...)
  clientFinancialEntityRouter.post(
    '/clients/:clientId/financial-entities',
    authenticate,
    clientOwnershipMiddleware,
    (req, res, next) => controller.create(req, res, next)
  )
  clientFinancialEntityRouter.get(
    '/clients/:clientId/financial-entities',
    authenticate,
    clientOwnershipMiddleware,
    (req, res, next) => controller.getAll(req, res, next)
  )
  clientFinancialEntityRouter.get(
    '/clients/:clientId/financial-entities/:id',
    authenticate,
    clientOwnershipMiddleware,
    (req, res, next) => controller.getById(req, res, next)
  )
  clientFinancialEntityRouter.put(
    '/clients/:clientId/financial-entities/:id',
    authenticate,
    clientOwnershipMiddleware,
    (req, res, next) => controller.updateBalance(req, res, next)
  )
  clientFinancialEntityRouter.delete(
    '/clients/:clientId/financial-entities/:id',
    authenticate,
    clientOwnershipMiddleware,
    (req, res, next) => controller.delete(req, res, next)
  )

  return clientFinancialEntityRouter
}
