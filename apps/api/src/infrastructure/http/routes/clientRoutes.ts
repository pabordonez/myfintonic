import { Router } from 'express'
import { ClientController } from '@infrastructure/http/controllers/clientController'
import { authenticate } from '@infrastructure/http/middlewares/authenticate'
import { isAdmin } from '@infrastructure/http/middlewares/isAdmin'
import { clientOwnershipMiddleware } from '@infrastructure/http/middlewares/clientOwnershipMiddleware'

export const createClientRoutes = (clientController: ClientController) => {
  const clientRouter = Router()

  clientRouter.use(authenticate)

  clientRouter.get('/', isAdmin, (req, res, next) =>
    clientController.getAll(req, res, next)
  )

  clientRouter.get('/:id', clientOwnershipMiddleware, (req, res, next) =>
    clientController.getById(req, res, next)
  )
  clientRouter.put('/:id', clientOwnershipMiddleware, (req, res, next) =>
    clientController.update(req, res, next)
  )
  clientRouter.put(
    '/:id/change-password',
    clientOwnershipMiddleware,
    (req, res, next) => clientController.changePassword(req, res, next)
  )
  return clientRouter
}
