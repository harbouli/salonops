import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';

export function createServiceRouter(controller: ServiceController): Router {
  const router = Router();

  router.get('/', controller.list);

  return router;
}
