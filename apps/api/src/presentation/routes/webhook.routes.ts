import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';
import { ProcessWebhookUseCase } from '../../application/use-cases/process-webhook.use-case';

export function createWebhookRoutes(): Router {
  const router = Router();
  const processWebhookUseCase = new ProcessWebhookUseCase();
  const webhookController = new WebhookController(processWebhookUseCase);

  router.post('/whatsapp', webhookController.handleWhatsappWebhook);

  return router;
}
