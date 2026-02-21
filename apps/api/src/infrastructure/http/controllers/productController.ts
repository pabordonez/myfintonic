import { Request, Response, NextFunction } from 'express'
import { ProductUseCases } from '@application/useCases/productUseCases'
import {
  CreateProductDto,
  UpdateProductDto,
} from '@application/dtos/productDto'
import { randomUUID } from 'crypto'

export class ProductController {
  constructor(private productUseCases: ProductUseCases) {}

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: CreateProductDto = {
        status: 'ACTIVE',
        ...req.body,
        clientId: (req as any).user?.id,
      }
      const product = await this.productUseCases.createProduct(
        dto,
        randomUUID()
      )
      res.status(201).json(product)
    } catch (error) {
      next(error)
    }
  }

  getAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filters: any = {}

      const user = (req as any).user
      if (user && user.role !== 'ADMIN') {
        filters.clientId = user.id
      }

      if (req.query.status) filters.status = req.query.status
      if (req.query.type) filters.type = req.query.type
      if (req.query.financialEntity)
        filters.financialEntity = req.query.financialEntity

      const products = await this.productUseCases.getProducts(filters)
      res.status(200).json(products)
    } catch (error) {
      next(error)
    }
  }

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const product = await this.productUseCases.getProductById(
        req.params.id as string
      )
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
      next(error)
    }
  }

  getHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const history = await this.productUseCases.getProductHistory(
        req.params.id as string
      )
      if (history) {
        res.status(200).json(history)
      } else {
        res.status(404).json({ error: 'Product not found' })
      }
    } catch (error) {
      next(error)
    }
  }

  update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateProductDto: UpdateProductDto = {
        status: 'ACTIVE',
        ...req.body,
        clientId: (req as any).user?.id,
      }

      await this.productUseCases.updateProduct(
        req.params.id as string,
        updateProductDto
      )

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }

  patch = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateProductDto: UpdateProductDto = {
        ...req.body,
        clientId: (req as any).user?.id,
      }

      await this.productUseCases.updateProduct(
        req.params.id as string,
        updateProductDto
      )

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.productUseCases.deleteProduct(req.params.id as string)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}
