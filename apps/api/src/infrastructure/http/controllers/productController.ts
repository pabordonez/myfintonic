import { Request, Response } from 'express'
import { ProductUseCases } from '@application/useCases/productUseCases'

export class ProductController {
  constructor(private productUseCases: ProductUseCases) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productUseCases.createProduct(req.body)
      res.status(201).json(product)
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Missing required fields')) {
        res.status(400).json({ error: error.message })
      } else if (error instanceof Error && error.message.startsWith('Validation failed')) {
        res.status(400).json({ error: error.message })
      } else if (error instanceof Error && error.message.includes('Financial Entity')) {
        res.status(400).json({ error: error.message })
      } else {
        console.error('Error creating product:', error)
        res.status(500).json({ error: 'Internal Server Error' })
      }
    }
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: any = {}
      
      const user = (req as any).user
      if (user && user.role !== 'ADMIN') {
        filters.clientId = user.id
      }

      if (req.query.status) filters.status = req.query.status
      if (req.query.type) filters.type = req.query.type
      if (req.query.financialEntity) filters.financialEntity = req.query.financialEntity

      const products = await this.productUseCases.getProducts(filters)
      res.status(200).json(products)
    } catch (error) {
      console.error('Error getting products:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productUseCases.getProductById(req.params.id as string)
      if (product) {
        const user = (req as any).user
        if (user && user.role !== 'ADMIN' && product.clientId !== user.id) {
          res.status(404).json({ error: 'Product not found' })
          return
        }
        res.status(200).json(product)
      } else {
        res.status(404).json({ error: 'Product not found' })
      }
    } catch (error) {
      console.error('Error getting product by id:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const history = await this.productUseCases.getProductHistory(req.params.id as string)
      if (history) {
        res.status(200).json(history)
      } else {
        res.status(404).json({ error: 'Product not found' })
      }
    } catch (error) {
      console.error('Error getting product history:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.productUseCases.updateProduct(req.params.id as string, req.body)
      res.status(204).send()
    } catch (error) {
      if (error instanceof Error && error.message === 'Product not found') {
        res.status(404).json({ error: error.message })
      } else if (error instanceof Error && error.message.startsWith('Validation failed')) {
        res.status(400).json({ error: error.message })
      } else if (error instanceof Error && error.message.includes('Financial Entity')) {
        res.status(400).json({ error: error.message })
      } else {
        res.status(400).json({ error: 'Bad Request' })
      }
    }
  }

  patch = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.productUseCases.updateProduct(req.params.id as string, req.body)
      res.status(204).send()
    } catch (error) {
      if (error instanceof Error && error.message === 'Product not found') {
        res.status(404).json({ error: error.message })
      } else if (error instanceof Error && error.message.startsWith('Validation failed')) {
        res.status(400).json({ error: error.message })
      } else if (error instanceof Error && error.message.includes('Financial Entity')) {
        res.status(400).json({ error: error.message })
      } else {
        res.status(400).json({ error: 'Bad Request' })
      }
    }
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.productUseCases.deleteProduct(req.params.id as string)
      res.status(204).send()
    } catch (error) {
      if (error instanceof Error && error.message === 'Product not found') {
        res.status(404).json({ error: error.message })
      } else {
        console.error('Error deleting product:', error)
        res.status(500).json({ error: 'Internal Server Error' })
      }
    }
  }
}
