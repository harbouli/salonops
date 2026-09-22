import { Request, Response, NextFunction } from 'express';
import { IGetServicesUseCase } from '../../application/ports/get-services.port';

export class ServiceController {
  constructor(private readonly getServicesUseCase: IGetServicesUseCase) {}

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branchId = req.query.branchId ? String(req.query.branchId) : undefined;
      const services = await this.getServicesUseCase.execute(branchId);
      res.json(services);
    } catch (err) {
      next(err);
    }
  };
}
