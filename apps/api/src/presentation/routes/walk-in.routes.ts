import { Router } from 'express';
import { WalkInController } from '../controllers/walk-in.controller';

export function createWalkInRouter(controller: WalkInController): Router {
  const router = Router();
  
  router.post('/', controller.create);

  return router;
}
