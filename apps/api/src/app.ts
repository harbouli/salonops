import express, { Express, Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { AppContainer, createContainer } from './infrastructure/container';
import { AppointmentController } from './presentation/controllers/appointment.controller';
import { StylistController } from './presentation/controllers/stylist.controller';
import { ServiceController } from './presentation/controllers/service.controller';
import { ClientController } from './presentation/controllers/client.controller';
import { CheckoutController } from './presentation/controllers/checkout.controller';
import { AuthController } from './presentation/controllers/auth.controller';

import { createAppointmentRouter } from './presentation/routes/appointment.routes';
import { createStylistRouter } from './presentation/routes/stylist.routes';
import { createServiceRouter } from './presentation/routes/service.routes';
import { createClientRouter } from './presentation/routes/client.routes';
import { createCheckoutRouter } from './presentation/routes/checkout.routes';
import { createAuthRouter } from './presentation/routes/auth.routes';
import { createHealthRouter } from './presentation/routes/health.routes';
import { errorHandlerMiddleware } from './presentation/middleware/error-handler.middleware';
import { createAuthMiddleware } from './presentation/middleware/auth.middleware';

export function createApp(container: AppContainer = createContainer()): Express {
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

  // Auth Middleware with container token service
  const authGuard = createAuthMiddleware(container.tokenService) as unknown as RequestHandler;

  // Controllers (Driving Adapters)
  const authController = new AuthController(container.authenticateUserUseCase);
  const appointmentController = new AppointmentController(
    container.bookAppointmentUseCase,
    container.getAppointmentsUseCase,
    container.updateAppointmentStatusUseCase
  );
  const stylistController = new StylistController(container.getStylistsUseCase);
  const serviceController = new ServiceController(container.getServicesUseCase);
  const clientController = new ClientController(
    container.searchClientsUseCase,
    container.getClientFormulasUseCase,
    container.saveHairFormulaUseCase
  );
  const checkoutController = new CheckoutController(container.processCheckoutUseCase);

  // Mount API Routers (Inbound Adapters)
  app.use('/health', createHealthRouter());
  app.use('/api/v1/auth', createAuthRouter(authController, authGuard));
  app.use('/api/v1/stylists', createStylistRouter(stylistController));
  app.use('/api/v1/services', createServiceRouter(serviceController));
  app.use('/api/v1/appointments', createAppointmentRouter(appointmentController));
  app.use('/api/v1/clients', createClientRouter(clientController));
  app.use('/api/v1/checkout', createCheckoutRouter(checkoutController));

  // 404 Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route introuvable' });
  });

  // Centralized Error Handler
  app.use(errorHandlerMiddleware);

  return app;
}
