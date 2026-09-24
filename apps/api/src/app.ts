import express, { Express, Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { AppContainer, createContainer } from './infrastructure/container';
import { AppointmentController } from './presentation/controllers/appointment.controller';
import { StylistController } from './presentation/controllers/stylist.controller';
import { ServiceController } from './presentation/controllers/service.controller';
import { ClientController } from './presentation/controllers/client.controller';
import { CheckoutController } from './presentation/controllers/checkout.controller';
import { AuthController } from './presentation/controllers/auth.controller';
import { StorageController } from './presentation/controllers/storage.controller';
import { DocsController } from './presentation/docs/docs.controller';

import { createAppointmentRouter } from './presentation/routes/appointment.routes';
import { createStylistRouter } from './presentation/routes/stylist.routes';
import { createServiceRouter } from './presentation/routes/service.routes';
import { createClientRouter } from './presentation/routes/client.routes';
import { createCheckoutRouter } from './presentation/routes/checkout.routes';
import { createAuthRouter } from './presentation/routes/auth.routes';
import { createStorageRouter } from './presentation/routes/storage.routes';
import { createHealthRouter } from './presentation/routes/health.routes';
import { createDocsRouter } from './presentation/routes/docs.routes';
import { isDocsRequest } from './presentation/docs/docs.middleware';
import { errorHandlerMiddleware } from './presentation/middleware/error-handler.middleware';
import { createAuthMiddleware, createOptionalAuthMiddleware } from './presentation/middleware/auth.middleware';
import { createTenantGuardMiddleware } from './presentation/middleware/tenant-guard.middleware';
import { createRateLimiterMiddleware } from './presentation/middleware/rate-limiter.middleware';

export function createApp(container: AppContainer = createContainer()): Express {
  const app = express();

  // Security & Utility Middlewares
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://cdn.jsdelivr.net',
            'https://unpkg.com',
            'https://scalar.com',
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
            'https://cdn.jsdelivr.net',
            'https://unpkg.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:', 'https://cdn.jsdelivr.net'],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          connectSrc: ["'self'", 'https:', 'data:'],
        },
      },
    })
  );
  app.use(cors({ origin: true, credentials: true }));
  app.use(morgan('dev'));
  app.use(express.json({ limit: '10mb' }));

  // Tiered Rate Limiting Middlewares (Port & Adapter driven)
  const staffRateLimiter = createRateLimiterMiddleware(container.rateLimiterPort, {
    tierName: 'staff',
    limit: 200,
    windowMs: 15 * 60 * 1000,
    message: 'Trop de requêtes, quota opérations internes dépassé.',
  });

  const authRateLimiter = createRateLimiterMiddleware(container.rateLimiterPort, {
    tierName: 'auth',
    limit: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Trop de tentatives de connexion ou requêtes SMS/OTP. Veuillez réessayer dans 15 minutes.',
  });

  const bookingRateLimiter = createRateLimiterMiddleware(container.rateLimiterPort, {
    tierName: 'booking',
    limit: 30,
    windowMs: 15 * 60 * 1000,
    message: 'Trop de requêtes de réservation publique. Veuillez réessayer plus tard.',
  });

  // Global default rate limiter applied to all non-doc endpoints
  app.use(staffRateLimiter);

  // Auth Middleware with container token service
  const authGuard = createAuthMiddleware(container.tokenService) as unknown as RequestHandler;
  const optionalAuth = createOptionalAuthMiddleware(container.tokenService) as unknown as RequestHandler;

  // Tenant Isolation Guard with AsyncLocalStorage context propagation
  const tenantGuard = createTenantGuardMiddleware(container.tenantContextPort) as unknown as RequestHandler;

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
  const storageController = new StorageController(container.generateUploadUrlUseCase);
  const docsController = new DocsController();

  // Mount API Routers (Inbound Adapters)
  app.use('/', createDocsRouter(docsController));
  app.use('/health', createHealthRouter());
  app.use('/api/v1/auth', createAuthRouter(authController, authGuard, authRateLimiter));
  app.use('/api/v1/stylists', optionalAuth, tenantGuard, createStylistRouter(stylistController));
  app.use('/api/v1/services', optionalAuth, tenantGuard, createServiceRouter(serviceController));
  app.use('/api/v1/appointments', optionalAuth, tenantGuard, createAppointmentRouter(appointmentController, bookingRateLimiter));
  app.use('/api/v1/clients', optionalAuth, tenantGuard, createClientRouter(clientController));
  app.use('/api/v1/checkout', optionalAuth, tenantGuard, createCheckoutRouter(checkoutController));
  app.use('/api/v1/storage', optionalAuth, tenantGuard, createStorageRouter(storageController, authGuard));


  // 404 Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route introuvable' });
  });

  // Centralized Error Handler
  app.use(errorHandlerMiddleware);

  return app;
}
