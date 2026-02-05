import { Router } from 'express'
import { ClientController } from '../controllers/clientController'
import { authenticate } from '../middlewares/authenticate' 

export const createClientRoutes = (clientController: ClientController) => {
  const clientRouter = Router()
  clientRouter.get('/:id', authenticate, (req, res) => clientController.getById(req, res))
  clientRouter.put('/:id', authenticate, (req, res) => clientController.update(req, res))
  clientRouter.get('/', authenticate, (req, res) => clientController.getAll(req, res))
  return clientRouter
}