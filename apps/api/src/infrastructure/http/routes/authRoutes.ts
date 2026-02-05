import { Router } from 'express'
import { AuthController } from '../controllers/authController'
import { ClientController } from '../controllers/clientController'

export const createAuthRoutes = (authController: AuthController, clientController: ClientController) => {
  const authRouter = Router()
  authRouter.post('/register', (req, res) => clientController.register(req, res))
  authRouter.post('/login', authController.login)
  return authRouter
}