import { AppointmentResponseDTO } from '../dtos';
import { FindAppointmentsFilter, IAppointmentRepository } from '../../domain/ports/appointment-repository.port';
import { IGetAppointmentsUseCase } from '../ports/get-appointments.port';

export class GetAppointmentsUseCase implements IGetAppointmentsUseCase {
  constructor(private readonly appointmentRepo: IAppointmentRepository) {}

  public async execute(filter?: FindAppointmentsFilter): Promise<AppointmentResponseDTO[]> {
    const list = await this.appointmentRepo.findAll(filter);

    return list.map((apt) => ({
      id: apt.id,
      branchId: apt.branchId,
      stylistId: apt.stylistId,
      clientId: apt.clientId,
      serviceId: apt.serviceId,
      startTime: apt.timeSlot.startTime.toISOString(),
      endTime: apt.timeSlot.endTime.toISOString(),
      bufferEndTime: apt.timeSlot.bufferEndTime.toISOString(),
      priceMad: apt.price.toMadString(),
      status: apt.status,
      notes: apt.notes,
      createdAt: apt.createdAt.toISOString(),
      updatedAt: apt.updatedAt.toISOString(),
    }));
  }
}
