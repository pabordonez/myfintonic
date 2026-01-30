import { Router } from 'express'
import { AuthController } from '../controllers/authController'
import { AuthUseCases } from '@application/useCases/authUseCases'

const authRouter = Router()
const authUseCases = new AuthUseCases()
const authController = new AuthController(authUseCases)

authRouter.post('/register', authController.register)
authRouter.post('/login', authController.login)

export { authRouter }