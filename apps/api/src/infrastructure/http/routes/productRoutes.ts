import { Router, Request, Response, NextFunction } from 'express'
import { ProductController } from '../controllers/productController'
import { authenticate } from '../middlewares/authenticate'
import { productOwnershipMiddleware } from '../middlewares/ownershipMiddleware'

export const createProductRouter = (productController: ProductController): Router => {
  const router = Router()

  // Middleware para permitir acceso a ADMIN o verificar propiedad
  const adminOrOwnership = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role === 'ADMIN') {
      return next()
    }
    return productOwnershipMiddleware(req, res, next)
  }

  router.use(authenticate)

  router.post('/', productController.create)
  router.get('/', productController.getAll)
  router.get('/:id', adminOrOwnership, productController.getById)
  router.get('/:id/history', adminOrOwnership, productController.getHistory)
  router.put('/:id', adminOrOwnership, productController.update)
  router.patch('/:id', adminOrOwnership, productController.patch)
  router.delete('/:id', adminOrOwnership, productController.delete)

  return router
}
