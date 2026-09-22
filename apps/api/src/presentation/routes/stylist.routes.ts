import { Router } from 'express';
import { StylistController } from '../controllers/stylist.controller';

export function createStylistRouter(controller: StylistController): Router {
  const router = Router();

  router.get('/', controller.list);

  return router;
}
