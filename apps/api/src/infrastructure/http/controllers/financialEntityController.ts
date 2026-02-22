import { Request, Response, NextFunction } from 'express'
import { FinancialEntityUseCases } from '@application/useCases/financialEntityUseCases'
import {
  CreateFinancialEntityDto,
  UpdateFinancialEntityDto,
} from '@application/dtos/financialEntityDto'
import { randomUUID } from 'crypto'

export class FinancialEntityController {
  constructor(private useCases: FinancialEntityUseCases) {}

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const financialEntityDto: CreateFinancialEntityDto = { ...req.body }

      const entity = await this.useCases.createEntity(
        financialEntityDto,
        randomUUID()
      )
      res.status(201).json(entity)
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
      if (req.query.clientId) filters.clientId = req.query.clientId as string
      if (req.query.name) filters.name = req.query.name as string

      const entities = await this.useCases.getEntities(filters)
      res.status(200).json(entities)
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
      const entity = await this.useCases.getEntityById(req.params.id as string)
      if (entity) {
        res.status(200).json(entity)
      } else {
        res.status(404).json({ error: 'Entity not found' })
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
      const financialEntityDto: UpdateFinancialEntityDto = { ...req.body }
      await this.useCases.updateEntity(
        req.params.id as string,
        financialEntityDto
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
      await this.useCases.deleteEntity(req.params.id as string)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}
