import { Request, Response, NextFunction } from 'express';
import { IAuthenticateUserUseCase } from '../../application/ports/auth.port';
import { loginSchema } from '../validation/schemas';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  constructor(private readonly authenticateUserUseCase: IAuthenticateUserUseCase) {}

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await this.authenticateUserUseCase.execute(validated);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  public me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentification requise.' });
        return;
      }
      res.json({ user: req.user });
    } catch (err) {
      next(err);
    }
  };
}
