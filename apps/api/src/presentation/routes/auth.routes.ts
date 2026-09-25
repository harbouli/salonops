import { Router, RequestHandler } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export function createAuthRouter(
  controller: AuthController,
  authGuard: RequestHandler = authMiddleware as unknown as RequestHandler,
  rateLimitMiddleware?: RequestHandler
): Router {
  const router = Router();

  if (rateLimitMiddleware) {
    router.post('/login', rateLimitMiddleware, controller.login);
  } else {
    router.post('/login', controller.login);
  }
  router.get('/me', authGuard, controller.me as unknown as RequestHandler);

  return router;
}
