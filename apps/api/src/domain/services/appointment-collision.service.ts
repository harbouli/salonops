import { TimeSlot } from '../value-objects/time-slot.vo';
import { Appointment } from '../models/appointment.entity';
import { SlotCollisionException } from '../exceptions/domain.exception';

export class AppointmentCollisionService {
  /**
   * Validates that the requested slot does not collide with any active appointment
   */
  public static checkCollision(
    requestedSlot: TimeSlot,
    existingAppointments: Appointment[],
    excludeAppointmentId?: string
  ): void {
    for (const existing of existingAppointments) {
      if (excludeAppointmentId && existing.id === excludeAppointmentId) {
        continue;
      }

      if (!existing.isActive()) {
        continue;
      }

      if (requestedSlot.overlapsWith(existing.timeSlot)) {
        throw new SlotCollisionException(
          `Conflit de créneau : la coiffeuse a déjà un rendez-vous ou une pause active (${existing.timeSlot.startTime.toISOString()} - ${existing.timeSlot.bufferEndTime.toISOString()}).`
        );
      }
    }
  }
}
