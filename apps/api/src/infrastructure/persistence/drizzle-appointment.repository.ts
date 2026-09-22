import {
  db,
  appointments,
  eq,
  and,
  notInArray,
  lt,
  gt,
  gte,
  lte,
  desc,
} from '@salonops/database';
import { IAppointmentRepository, FindAppointmentsFilter } from '../../domain/ports/appointment-repository.port';
import { Appointment, AppointmentStatus } from '../../domain/models/appointment.entity';
import { TimeSlot } from '../../domain/value-objects/time-slot.vo';
import { Money } from '../../domain/value-objects/money.vo';

export class DrizzleAppointmentRepository implements IAppointmentRepository {
  private toDomain(row: typeof appointments.$inferSelect): Appointment {
    return new Appointment({
      id: row.id,
      branchId: row.branchId,
      stylistId: row.stylistId,
      clientId: row.clientId,
      serviceId: row.serviceId,
      timeSlot: TimeSlot.fromExisting(row.startTime, row.endTime, row.bufferEndTime),
      price: Money.fromMad(row.priceMad),
      status: row.status as AppointmentStatus,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  public async findById(id: string): Promise<Appointment | null> {
    const [row] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  public async findOverlapping(
    stylistId: string,
    startTime: Date,
    bufferEndTime: Date,
    excludeId?: string
  ): Promise<Appointment[]> {
    const conditions = [
      eq(appointments.stylistId, stylistId),
      notInArray(appointments.status, ['CANCELLED', 'NO_SHOW']),
      lt(appointments.startTime, bufferEndTime),
      gt(appointments.bufferEndTime, startTime),
    ];

    if (excludeId) {
      conditions.push(eq(appointments.id, excludeId)); // filtered out in domain or query
    }

    const rows = await db
      .select()
      .from(appointments)
      .where(and(...conditions));

    return rows
      .filter((r) => (excludeId ? r.id !== excludeId : true))
      .map((r) => this.toDomain(r));
  }

  public async findByStylistAndDateRange(
    stylistId: string,
    start: Date,
    end: Date
  ): Promise<Appointment[]> {
    const rows = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.stylistId, stylistId),
          gte(appointments.startTime, start),
          lte(appointments.startTime, end)
        )
      )
      .orderBy(appointments.startTime);

    return rows.map((r) => this.toDomain(r));
  }

  public async findAll(filter?: FindAppointmentsFilter): Promise<Appointment[]> {
    const conditions = [];

    if (filter?.stylistId) {
      conditions.push(eq(appointments.stylistId, filter.stylistId));
    }

    if (filter?.branchId) {
      conditions.push(eq(appointments.branchId, filter.branchId));
    }

    if (filter?.date) {
      const dayStart = new Date(filter.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(filter.date);
      dayEnd.setHours(23, 59, 59, 999);
      conditions.push(gte(appointments.startTime, dayStart));
      conditions.push(lte(appointments.startTime, dayEnd));
    }

    const rows = await db
      .select()
      .from(appointments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(appointments.startTime));

    return rows.map((r) => this.toDomain(r));
  }

  public async save(appointment: Appointment): Promise<Appointment> {
    const [existing] = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(eq(appointments.id, appointment.id))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(appointments)
        .set({
          branchId: appointment.branchId,
          stylistId: appointment.stylistId,
          clientId: appointment.clientId,
          serviceId: appointment.serviceId,
          startTime: appointment.timeSlot.startTime,
          endTime: appointment.timeSlot.endTime,
          bufferEndTime: appointment.timeSlot.bufferEndTime,
          priceMad: appointment.price.toMadString(),
          status: appointment.status,
          notes: appointment.notes,
          updatedAt: appointment.updatedAt,
        })
        .where(eq(appointments.id, appointment.id))
        .returning();

      return this.toDomain(updated);
    } else {
      const [inserted] = await db
        .insert(appointments)
        .values({
          id: appointment.id,
          branchId: appointment.branchId,
          stylistId: appointment.stylistId,
          clientId: appointment.clientId,
          serviceId: appointment.serviceId,
          startTime: appointment.timeSlot.startTime,
          endTime: appointment.timeSlot.endTime,
          bufferEndTime: appointment.timeSlot.bufferEndTime,
          priceMad: appointment.price.toMadString(),
          status: appointment.status,
          notes: appointment.notes,
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt,
        })
        .returning();

      return this.toDomain(inserted);
    }
  }
}
