import { Request, Response, NextFunction } from 'express';
import { IGetStylistsUseCase } from '../../application/ports/get-stylists.port';

export class StylistController {
  constructor(private readonly getStylistsUseCase: IGetStylistsUseCase) {}

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branchId = req.query.branchId ? String(req.query.branchId) : undefined;
      const stylists = await this.getStylistsUseCase.execute(branchId);
      res.json(stylists);
    } catch (err) {
      next(err);
    }
  };
}
