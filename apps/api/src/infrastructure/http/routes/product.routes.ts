import { Router } from 'express'
import { ProductController } from '../controllers/productController'

export const createProductRouter = (productController: ProductController): Router => {
  const router = Router()

  router.post('/', productController.create)
  router.get('/', productController.getAll)
  router.get('/:id', productController.getById)
  router.get('/:id/history', productController.getHistory)
  router.put('/:id', productController.update)
  router.patch('/:id', productController.patch)
  router.delete('/:id', productController.delete)

  return router
}
