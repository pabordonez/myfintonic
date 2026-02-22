import { Request, Response, NextFunction } from 'express'
import { ClientFinancialEntityUseCases } from '@application/useCases/clientFinancialEntityUseCases'
import {
  CreateClientFinancialEntityDto,
  UpdateClientFinancialEntityDto,
} from '@application/dtos/clientFinancialEntityDto'
import { randomUUID } from 'crypto'

export class ClientFinancialEntityController {
  constructor(private useCases: ClientFinancialEntityUseCases) {}

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const createClientFinancialEntityDto: CreateClientFinancialEntityDto = {
        ...req.body,
        clientId: req.params.clientId,
      }
      const association = await this.useCases.createAssociation(
        createClientFinancialEntityDto,
        randomUUID()
      )
      res.status(201).json(association)
    } catch (error) {
      next(error)
    }
  }

  getAllAssociations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const associations = await this.useCases.getAllAssociations()
      res.status(200).json(associations)
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
      if (req.params.clientId) filters.clientId = req.params.clientId
      if (req.query.financialEntityId)
        filters.financialEntityId = req.query.financialEntityId as string

      const associations = await this.useCases.getAssociations(filters)
      res.status(200).json(associations)
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
      const association = await this.useCases.getAssociationById(
        req.params.id as string
      )
      if (association) {
        res.status(200).json(association)
      } else {
        res.status(404).json({ error: 'Association not found' })
      }
    } catch (error) {
      next(error)
    }
  }

  updateBalance = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateClientFinancialEntityDto: UpdateClientFinancialEntityDto = {
        ...req.body,
        clientId: req.params.clientId,
      }
      await this.useCases.updateBalance(
        req.params.id as string,
        updateClientFinancialEntityDto
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
      await this.useCases.deleteAssociation(req.params.id as string)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}
