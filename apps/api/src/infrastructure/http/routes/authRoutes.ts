import { Router } from 'express'
import { AuthController } from '../controllers/authController'
import { AuthUseCases } from '@application/useCases/authUseCases'
import { ClientController } from '../controllers/clientController'
import { ClientUseCases } from '@application/useCases/clientUseCases'
import { PrismaClientRepository } from '../../persistence/PrismaClientRepository'

const authRouter = Router()
const authUseCases = new AuthUseCases()
const authController = new AuthController(authUseCases)

const clientRepository = new PrismaClientRepository()
const clientUseCases = new ClientUseCases(clientRepository)
const clientController = new ClientController(clientUseCases)

authRouter.post('/register', (req, res) => clientController.register(req, res))
authRouter.post('/login', authController.login)

export { authRouter }