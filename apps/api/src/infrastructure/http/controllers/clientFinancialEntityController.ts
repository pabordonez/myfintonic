import { Request, Response } from 'express'
import { ClientFinancialEntityUseCases } from '@application/useCases/clientFinancialEntityUseCases'

export class ClientFinancialEntityController {
  constructor(private useCases: ClientFinancialEntityUseCases) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = {
        ...req.body,
        clientId: req.params.clientId,
      }
      const association = await this.useCases.createAssociation(dto)
      res.status(201).json(association)
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({ error: 'Association already exists' })
      } else if (
        error instanceof Error &&
        error.message.includes('not found')
      ) {
        res.status(404).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal Server Error' })
      }
    }
  }

  getAllAssociations = async (req: Request, res: Response): Promise<void> => {
    try {
      const associations = await this.useCases.getAllAssociations()
      res.status(200).json(associations)
    } catch {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: any = {}
      if (req.params.clientId) filters.clientId = req.params.clientId
      if (req.query.financialEntityId)
        filters.financialEntityId = req.query.financialEntityId as string

      const associations = await this.useCases.getAssociations(filters)
      res.status(200).json(associations)
    } catch {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const association = await this.useCases.getAssociationById(
        req.params.id as string
      )
      if (association) {
        res.status(200).json(association)
      } else {
        res.status(404).json({ error: 'Association not found' })
      }
    } catch {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  updateBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.useCases.updateBalance(req.params.id as string, req.body)
      res.status(204).send()
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal Server Error' })
      }
    }
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.useCases.deleteAssociation(req.params.id as string)
      res.status(204).send()
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal Server Error' })
      }
    }
  }
}
