import { Router } from 'express';
import { DocsController } from '../docs/docs.controller';
import { docsCspMiddleware } from '../docs/docs.middleware';

export function createDocsRouter(docsController: DocsController = new DocsController()): Router {
  const router = Router();

  // GET /api/v1/openapi.json
  router.get('/api/v1/openapi.json', docsCspMiddleware, docsController.getOpenApiJson);

  // GET /reference
  router.get('/reference', docsCspMiddleware, docsController.renderReference);

  // GET /docs -> 301 Redirect to /reference
  router.get('/docs', docsController.redirectToReference);

  return router;
}
