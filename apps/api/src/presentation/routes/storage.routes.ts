import { Router, RequestHandler } from 'express';
import { StorageController } from '../controllers/storage.controller';

export function createStorageRouter(
  controller: StorageController,
  authGuard?: RequestHandler
): Router {
  const router = Router();

  if (authGuard) {
    router.post('/presigned-url', authGuard, controller.getPresignedUrl as unknown as RequestHandler);
  } else {
    router.post('/presigned-url', controller.getPresignedUrl as unknown as RequestHandler);
  }

  return router;
}
