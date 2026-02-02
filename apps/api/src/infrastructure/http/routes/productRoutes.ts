import { Router } from 'express'
import { ProductController } from '../controllers/productController'
import { ProductUseCases } from '@application/useCases/productUseCases'
import { PrismaProductRepository } from '@infrastructure/persistence/PrismaProductRepository'
import { ProductFactory } from '@domain/factories/productFactory'
import { authenticate } from '../middlewares/authenticate'
import { productOwnershipMiddleware } from '../middlewares/ownershipMiddleware'

const productRouter = Router()
const productRepository = new PrismaProductRepository()
const productFactory = new ProductFactory()
const productUseCases = new ProductUseCases(productRepository, productFactory)
const productController = new ProductController(productUseCases)

// 1. Autenticación requerida para todas las rutas de productos
productRouter.use(authenticate)

// 2. Rutas de colección
productRouter.get('/', productController.getAll)
productRouter.post('/', productController.create)

// 3. Rutas de recurso (Protegidas por Ownership)
productRouter.get('/:id', productOwnershipMiddleware, productController.getById)
productRouter.put('/:id', productOwnershipMiddleware, productController.update)
productRouter.patch('/:id', productOwnershipMiddleware, productController.patch)
productRouter.delete('/:id', productOwnershipMiddleware, productController.delete)
productRouter.get('/:id/history', productOwnershipMiddleware, productController.getHistory)

export { productRouter }