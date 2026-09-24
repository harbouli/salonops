import { Router, Request, Response } from 'express';

export function createHealthRouter(): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'salonops-api',
      timestamp: new Date().toISOString(),
      architecture: 'Clean Architecture + DDD + Hexagonal (Ports & Adapters)',
    });
  });

  return router;
}
