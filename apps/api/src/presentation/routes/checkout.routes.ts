import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller';

export function createCheckoutRouter(controller: CheckoutController): Router {
  const router = Router();

  router.post('/', controller.checkout);
  router.get('/reconciliation', controller.getReconciliation);
  router.get('/:id', controller.getById);

  return router;
}
