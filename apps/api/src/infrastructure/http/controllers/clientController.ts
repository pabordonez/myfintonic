import { Request, Response, NextFunction } from 'express'
import { ClientUseCases } from '@application/useCases/clientUseCases'
import { toClientResponse } from '@infrastructure/http/mappers/clientMapper'
import { RegisterClientDto, UpdateClientDto } from '@application/dtos/clientDto'

export class ClientController {
  constructor(private clientUseCases: ClientUseCases) {}

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const registerClientDto: RegisterClientDto = { ...req.body }
      const result = await this.clientUseCases.register(registerClientDto)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user

      if (user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied' })
      }

      const clients = await this.clientUseCases.getClients()
      return res.status(200).json(clients.map(toClientResponse))
    } catch (error) {
      next(error)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user
      const { id } = req.params

      if (user.role !== 'ADMIN' && user.id !== id) {
        return res.status(403).json({ error: 'Access denied' })
      }

      const client = await this.clientUseCases.getClientById(id as string)
      if (!client) return res.status(404).json({ error: 'Client not found' })

      return res.status(200).json(toClientResponse(client))
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user
      const { id } = req.params

      if (user.id !== id) {
        return res.status(403).json({ error: 'Access denied' })
      }

      const updateClientDto: UpdateClientDto = { ...req.body }
      const updatedClient = await this.clientUseCases.updateClient(
        id as string,
        updateClientDto
      )
      return res.status(200).json(toClientResponse(updatedClient))
    } catch (error) {
      next(error)
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { newPassword, currentPassword } = req.body
      const requestorRole = (req as any).user?.role
      const requestorId = (req as any).user?.id

      if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' })
      }

      await this.clientUseCases.changePassword(
        id as string,
        newPassword,
        currentPassword,
        requestorRole,
        requestorId
      )
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}
