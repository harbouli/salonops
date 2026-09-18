import { CreateAppointmentDTO, AppointmentResponseDTO } from '../dtos';

export interface IBookAppointmentUseCase {
  execute(dto: CreateAppointmentDTO): Promise<AppointmentResponseDTO>;
}
