import { Request, Response, NextFunction } from 'express';
import { ISearchClientsUseCase } from '../../application/ports/search-clients.port';
import {
  IGetClientFormulasUseCase,
  ISaveHairFormulaUseCase,
} from '../../application/ports/hair-formulas.port';
import { createHairFormulaSchema } from '../validation/schemas';

export class ClientController {
  constructor(
    private readonly searchClientsUseCase: ISearchClientsUseCase,
    private readonly getClientFormulasUseCase: IGetClientFormulasUseCase,
    private readonly saveHairFormulaUseCase: ISaveHairFormulaUseCase
  ) {}

  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = String(req.query.q || '').trim();
      const branchId = req.query.branchId ? String(req.query.branchId) : undefined;
      const list = await this.searchClientsUseCase.execute(q, branchId);
      res.json(list);
    } catch (err) {
      next(err);
    }
  };

  public getFormulas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = String(req.params.id);
      const formulas = await this.getClientFormulasUseCase.execute(clientId);
      res.json(formulas);
    } catch (err) {
      next(err);
    }
  };

  public saveFormula = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = String(req.params.id);
      const validated = createHairFormulaSchema.parse({
        ...req.body,
        clientId,
      });
      const formula = await this.saveHairFormulaUseCase.execute(validated);
      res.status(201).json(formula);
    } catch (err) {
      next(err);
    }
  };
}
