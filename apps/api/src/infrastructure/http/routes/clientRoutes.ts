import { Router } from 'express'
import { ClientController } from '@infrastructure/http/controllers/clientController'
import { authenticate } from '@infrastructure/http/middlewares/authenticate'
import { isAdmin } from '@infrastructure/http/middlewares/isAdmin'
import { clientOwnershipMiddleware } from '@infrastructure/http/middlewares/clientOwnershipMiddleware'

export const createClientRoutes = (clientController: ClientController) => {
  const clientRouter = Router()

  clientRouter.use(authenticate)

  clientRouter.get('/', isAdmin, (req, res) =>
    clientController.getAll(req, res)
  )

  clientRouter.get('/:id', clientOwnershipMiddleware, (req, res) =>
    clientController.getById(req, res)
  )
  clientRouter.put('/:id', clientOwnershipMiddleware, (req, res) =>
    clientController.update(req, res)
  )
  clientRouter.put(
    '/:id/change-password',
    clientOwnershipMiddleware,
    (req, res) => clientController.changePassword(req, res)
  )
  return clientRouter
}
