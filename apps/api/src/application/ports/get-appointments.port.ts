import { AppointmentResponseDTO } from '../dtos';
import { FindAppointmentsFilter } from '../../domain/ports/appointment-repository.port';

export interface IGetAppointmentsUseCase {
  execute(filter?: FindAppointmentsFilter): Promise<AppointmentResponseDTO[]>;
}
