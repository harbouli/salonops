import { AppointmentResponseDTO } from '../dtos';
import { AppointmentStatus } from '../../domain/models/appointment.entity';

export interface UpdateAppointmentStatusDTO {
  appointmentId: string;
  status: AppointmentStatus;
  reason?: string;
  cancellationTime?: Date;
  minNoticeHours?: number;
  recordedAt?: Date;
  gracePeriodMinutes?: number;
}

export interface CancelAppointmentDTO {
  appointmentId: string;
  reason?: string;
  cancellationTime?: Date;
  minNoticeHours?: number;
}

export interface MarkNoShowDTO {
  appointmentId: string;
  recordedAt?: Date;
  gracePeriodMinutes?: number;
}

export interface AppointmentStatusUpdateResultDTO extends AppointmentResponseDTO {
  clientReliabilityScore?: number;
  clientReliabilityTier?: string;
  isLateCancellation?: boolean;
}

export interface IUpdateAppointmentStatusUseCase {
  execute(dto: UpdateAppointmentStatusDTO): Promise<AppointmentStatusUpdateResultDTO>;
  cancel(dto: CancelAppointmentDTO): Promise<AppointmentStatusUpdateResultDTO>;
  markNoShow(dto: MarkNoShowDTO): Promise<AppointmentStatusUpdateResultDTO>;
}
