import { Request, Response } from 'express'
import { ProductUseCases } from '@application/useCases/productUseCases'

export class ProductController {
  constructor(private productUseCases: ProductUseCases) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productUseCases.createProduct(req.body)
      res.status(201).json(product)
    } catch (error) {
      if (error instanceof Error && error.message === 'Missing required fields') {
        res.status(400).json({ error: error.message })
      } else if (error instanceof Error && error.message.startsWith('Validation failed')) {
        res.status(400).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal Server Error' })
      }
    }
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: any = {}
      if (req.query.status) filters.status = req.query.status
      if (req.query.type) filters.type = req.query.type
      if (req.query.financialEntity) filters.financialEntity = req.query.financialEntity

      const products = await this.productUseCases.getProducts(filters)
      res.status(200).json(products)
    } catch {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productUseCases.getProductById(req.params.id as string)
      if (product) {
        res.status(200).json(product)
      } else {
        res.status(404).json({ error: 'Product not found' })
      }
    } catch {
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
    } catch {
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
        res.status(500).json({ error: 'Internal Server Error' })
      }
    }
  }
}
