import { Router } from 'express';
import { ClientController } from '../controllers/client.controller';

export function createClientRouter(controller: ClientController): Router {
  const router = Router();

  router.get('/search', controller.search);
  router.get('/:id/formulas', controller.getFormulas);
  router.post('/:id/formulas', controller.saveFormula);

  return router;
}
