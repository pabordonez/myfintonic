import { Router } from 'express'
import { AuthController } from '@infrastructure/http/controllers/authController'
import { ClientController } from '@infrastructure/http/controllers/clientController'

export const createAuthRoutes = (
  authController: AuthController,
  clientController: ClientController
) => {
  const authRouter = Router()
  authRouter.post('/register', (req, res) =>
    clientController.register(req, res)
  )
  authRouter.post('/login', authController.login)
  authRouter.post('/logout', authController.logout)
  return authRouter
}
