import { Router, Request, Response, NextFunction } from 'express'
import { ProductController } from '../controllers/productController'
import { authenticate } from '../middlewares/authenticate'
import { productOwnershipMiddleware } from '../middlewares/ownershipMiddleware'

export const createProductRoutes = (productController: ProductController) => {
  const productRouter = Router()

  // Middleware para permitir acceso a ADMIN o verificar propiedad
  const adminOrOwnership = (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user?.role === 'ADMIN') {
      return next()
    }
    return productOwnershipMiddleware(req, res, next)
  }

  // 1. Autenticación requerida para todas las rutas de productos
  productRouter.use(authenticate)

  // 2. Rutas de colección
  productRouter.get('/', productController.getAll)
  productRouter.post('/', productController.create)

  // 3. Rutas de recurso (Protegidas por Ownership)
  productRouter.get('/:id', adminOrOwnership, productController.getById)
  productRouter.put('/:id', adminOrOwnership, productController.update)
  productRouter.patch('/:id', adminOrOwnership, productController.patch)
  productRouter.delete('/:id', adminOrOwnership, productController.delete)
  productRouter.get('/:id/history', adminOrOwnership, productController.getHistory)
  
  return productRouter
}