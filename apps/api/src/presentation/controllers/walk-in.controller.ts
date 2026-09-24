import { Request, Response, NextFunction } from 'express';
import { CreateWalkInUseCase } from '../../application/use-cases/create-walk-in.use-case';
import { createWalkInSchema } from '../validation/schemas';

export class WalkInController {
  constructor(private readonly createWalkInUseCase: CreateWalkInUseCase) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createWalkInSchema.parse(req.body);
      const walkInResult = await this.createWalkInUseCase.execute({
        branchId: validated.branchId,
        phone: validated.phone,
        fullName: validated.fullName,
        serviceId: validated.serviceId,
        price: validated.price,
        durationMinutes: validated.durationMinutes,
        bufferMinutes: validated.bufferMinutes,
      });
      res.status(201).json(walkInResult);
    } catch (err) {
      next(err);
    }
  };
}
