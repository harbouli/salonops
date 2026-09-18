import { AppointmentResponseDTO } from '../dtos';
import { AppointmentStatus } from '../../domain/models/appointment.entity';

export interface UpdateAppointmentStatusDTO {
  appointmentId: string;
  status: AppointmentStatus;
  reason?: string;
}

export interface IUpdateAppointmentStatusUseCase {
  execute(dto: UpdateAppointmentStatusDTO): Promise<AppointmentResponseDTO>;
}
