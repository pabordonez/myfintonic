import { Router } from 'express'
import { ClientController } from '../controllers/clientController'
import { ClientUseCases } from '@application/useCases/clientUseCases'
import { PrismaClientRepository } from '../../persistence/PrismaClientRepository'
import { authenticate } from '../middlewares/authenticate' 

const clientRouter = Router()
const clientRepository = new PrismaClientRepository()
const clientUseCases = new ClientUseCases(clientRepository)
const clientController = new ClientController(clientUseCases)

clientRouter.get('/:id', authenticate, (req, res) => clientController.getById(req, res))
clientRouter.put('/:id', authenticate, (req, res) => clientController.update(req, res))
clientRouter.get('/', authenticate, (req, res) => clientController.getAll(req, res))

export { clientRouter }