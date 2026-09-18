import { Request, Response, NextFunction } from 'express';
import { IBookAppointmentUseCase } from '../../application/ports/book-appointment.port';
import { IGetAppointmentsUseCase } from '../../application/ports/get-appointments.port';
import { IUpdateAppointmentStatusUseCase } from '../../application/ports/update-appointment-status.port';
import { createAppointmentSchema, updateAppointmentStatusSchema } from '../validation/schemas';

export class AppointmentController {
  constructor(
    private readonly bookAppointmentUseCase: IBookAppointmentUseCase,
    private readonly getAppointmentsUseCase: IGetAppointmentsUseCase,
    private readonly updateAppointmentStatusUseCase: IUpdateAppointmentStatusUseCase
  ) {}

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { stylistId, date, branchId } = req.query;
      const list = await this.getAppointmentsUseCase.execute({
        stylistId: stylistId ? String(stylistId) : undefined,
        date: date ? String(date) : undefined,
        branchId: branchId ? String(branchId) : undefined,
      });
      res.json(list);
    } catch (err) {
      next(err);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createAppointmentSchema.parse(req.body);
      const appointment = await this.bookAppointmentUseCase.execute(validated);
      res.status(201).json(appointment);
    } catch (err) {
      next(err);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const validated = updateAppointmentStatusSchema.parse(req.body);
      const updated = await this.updateAppointmentStatusUseCase.execute({
        appointmentId: id,
        status: validated.status,
        reason: validated.reason,
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };
}
