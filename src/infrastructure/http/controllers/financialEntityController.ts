import { Request, Response } from 'express';
import { FinancialEntityUseCases } from '@application/useCases/financialEntityUseCases';

export class FinancialEntityController {
  constructor(private useCases: FinancialEntityUseCases) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const entity = await this.useCases.createEntity(req.body);
      res.status(201).json(entity);
    } catch {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: any = {};
      if (req.query.clientId) filters.clientId = req.query.clientId as string;
      if (req.query.name) filters.name = req.query.name as string;
      
      const entities = await this.useCases.getEntities(filters);
      res.status(200).json(entities);
    } catch {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const entity = await this.useCases.getEntityById(req.params.id as string);
      if (entity) {
        res.status(200).json(entity);
      } else {
        res.status(404).json({ error: 'Entity not found' });
      }
    } catch {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.useCases.updateEntity(req.params.id as string, req.body);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Financial Entity not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Bad Request' });
      }
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.useCases.deleteEntity(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Financial Entity not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  };
}