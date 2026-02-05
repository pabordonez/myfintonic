import { Router } from 'express'
import { ProductController } from '../controllers/productController'
import { authenticate } from '../middlewares/authenticate'
import { productOwnershipMiddleware } from '../middlewares/ownershipMiddleware'

export const createProductRoutes = (productController: ProductController) => {
  const productRouter = Router()

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
  
  return productRouter
}