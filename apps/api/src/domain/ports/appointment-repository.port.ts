import { Appointment } from '../models/appointment.entity';

export interface FindAppointmentsFilter {
  stylistId?: string;
  date?: string;
  branchId?: string;
}

export interface IAppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findOverlapping(
    stylistId: string,
    startTime: Date,
    bufferEndTime: Date,
    excludeId?: string
  ): Promise<Appointment[]>;
  findByStylistAndDateRange(
    stylistId: string,
    start: Date,
    end: Date
  ): Promise<Appointment[]>;
  findAll(filter?: FindAppointmentsFilter): Promise<Appointment[]>;
  save(appointment: Appointment): Promise<Appointment>;
}
