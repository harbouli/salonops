import { AppointmentResponseDTO } from '../dtos';
import { IAppointmentRepository } from '../../domain/ports/appointment-repository.port';
import { IUpdateAppointmentStatusUseCase, UpdateAppointmentStatusDTO } from '../ports/update-appointment-status.port';
import { EntityNotFoundException, InvalidAppointmentStateException } from '../../domain/exceptions/domain.exception';

export class UpdateAppointmentStatusUseCase implements IUpdateAppointmentStatusUseCase {
  constructor(private readonly appointmentRepo: IAppointmentRepository) {}

  public async execute(dto: UpdateAppointmentStatusDTO): Promise<AppointmentResponseDTO> {
    const appointment = await this.appointmentRepo.findById(dto.appointmentId);
    if (!appointment) {
      throw new EntityNotFoundException('Rendez-vous', dto.appointmentId);
    }

    switch (dto.status) {
      case 'CONFIRMED':
        appointment.confirm();
        break;
      case 'IN_CHAIR':
        appointment.startInChair();
        break;
      case 'COMPLETED':
        appointment.complete();
        break;
      case 'CANCELLED':
        appointment.cancel(dto.reason);
        break;
      case 'NO_SHOW':
        appointment.markNoShow();
        break;
      default:
        throw new InvalidAppointmentStateException(`Statut inconnu: ${dto.status}`);
    }

    const saved = await this.appointmentRepo.save(appointment);

    return {
      id: saved.id,
      branchId: saved.branchId,
      stylistId: saved.stylistId,
      clientId: saved.clientId,
      serviceId: saved.serviceId,
      startTime: saved.timeSlot.startTime.toISOString(),
      endTime: saved.timeSlot.endTime.toISOString(),
      bufferEndTime: saved.timeSlot.bufferEndTime.toISOString(),
      priceMad: saved.price.toMadString(),
      status: saved.status,
      notes: saved.notes,
      createdAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
    };
  }
}
