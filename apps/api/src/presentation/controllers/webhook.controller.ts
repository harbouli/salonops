import { Request, Response } from 'express';
import { ProcessWebhookUseCase } from '../../application/use-cases/process-webhook.use-case';

export class WebhookController {
  constructor(private readonly processWebhookUseCase: ProcessWebhookUseCase) {}

  public handleWhatsappWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.processWebhookUseCase.execute(req.body);
      res.status(200).send('OK');
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}
