import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';

export function createAppointmentRouter(controller: AppointmentController): Router {
  const router = Router();

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.patch('/:id/status', controller.updateStatus);

  return router;
}
