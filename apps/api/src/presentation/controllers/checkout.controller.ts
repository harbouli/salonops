import { Request, Response, NextFunction } from 'express';
import { IProcessCheckoutUseCase } from '../../application/ports/process-checkout.port';
import { processCheckoutSchema } from '../validation/schemas';

export class CheckoutController {
  constructor(private readonly processCheckoutUseCase: IProcessCheckoutUseCase) {}

  public checkout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = processCheckoutSchema.parse(req.body);
      const result = await this.processCheckoutUseCase.execute(validated);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };
}
