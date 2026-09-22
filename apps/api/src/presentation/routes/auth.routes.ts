import { Router, RequestHandler } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export function createAuthRouter(
  controller: AuthController,
  authGuard: RequestHandler = authMiddleware as unknown as RequestHandler
): Router {
  const router = Router();

  router.post('/login', controller.login);
  router.get('/me', authGuard, controller.me as unknown as RequestHandler);

  return router;
}
