import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { healthRouter } from './routes/health';
import { stylistsRouter } from './routes/stylists';
import { servicesRouter } from './routes/services';
import { appointmentsRouter } from './routes/appointments';
import { clientsRouter } from './routes/clients';

export function createApp(): Express {
  const app = express();

  // Security & Utility Middlewares
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(morgan('dev'));
  app.use(express.json({ limit: '10mb' }));

  // Global Rate Limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' },
  });
  app.use(limiter);

  // Mount API Routers
  app.use('/health', healthRouter);
  app.use('/api/v1/stylists', stylistsRouter);
  app.use('/api/v1/services', servicesRouter);
  app.use('/api/v1/appointments', appointmentsRouter);
  app.use('/api/v1/clients', clientsRouter);

  // 404 Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route introuvable' });
  });

  // Centralized Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[API Error]', err);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  return app;
}
