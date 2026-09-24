import { Appointment, SalonService, SlotTimelineCalculation, SlotValidationResult, Stylist } from '../types/agenda';

export const SALON_OPEN_HOUR = 9;   // 09:00
export const SALON_CLOSE_HOUR = 20; // 20:00

/**
 * Converts "HH:mm" to total minutes from 00:00 (e.g. "10:30" -> 630)
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const parts = timeStr.trim().split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Converts total minutes from 00:00 to "HH:mm" (e.g. 630 -> "10:30")
 */
export function minutesToTimeString(totalMinutes: number): string {
  const normalized = Math.max(0, Math.floor(totalMinutes));
  const hours = Math.floor(normalized / 60) % 24;
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Formats a duration in minutes into a human-friendly string (e.g. 45 -> "45 min", 105 -> "1h45", 180 -> "3h00")
 */
export function formatDurationHuman(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h00`;
  }
  return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`;
}

/**
 * Calculates service end time, buffer end time, total reserved slot, and next available free slot.
 * Example:
 * startTime: "10:00", duration: 105 min (1h45), buffer: 15 min
 * -> Service: 10:00 - 11:45
 * -> Buffer: 11:45 - 12:00
 * -> Next free slot: 12:00
 */
export function calculateSlotTimeline(
  startTimeStr: string,
  durationMinutes: number,
  bufferMinutes: number = 0
): SlotTimelineCalculation {
  const startMin = parseTimeToMinutes(startTimeStr);
  const serviceEndMin = startMin + durationMinutes;
  const bufferEndMin = serviceEndMin + bufferMinutes;

  const endTime = minutesToTimeString(serviceEndMin);
  const bufferEndTime = minutesToTimeString(bufferEndMin);
  const nextFreeSlot = bufferEndTime;

  return {
    startTime: minutesToTimeString(startMin),
    endTime,
    bufferEndTime,
    durationMinutes,
    bufferMinutes,
    totalReservedMinutes: durationMinutes + bufferMinutes,
    nextFreeSlot,
  };
}

/**
 * Validates requested slot against stylist day off, salon hours, and existing appointments (including chemical buffer!).
 * 
 * Collision Rule:
 * Two slots overlap if newSlot.start < existingSlot.bufferEnd AND newSlot.bufferEnd > existingSlot.start
 */
export function validateDoubleBooking(params: {
  stylistId: string;
  startTime: string;
  durationMinutes: number;
  bufferMinutes: number;
  appointments: Appointment[];
  stylist?: Stylist;
  excludeAppointmentId?: string;
}): SlotValidationResult {
  const { stylistId, startTime, durationMinutes, bufferMinutes, appointments, stylist, excludeAppointmentId } = params;

  // 1. Stylist Day Off Check
  if (stylist?.isDayOff) {
    return {
      isValid: false,
      reason: 'stylist_off',
      message: `${stylist.name} est en congé aujourd'hui. Impossible d'ajouter un rendez-vous.`,
    };
  }

  const requestedStart = parseTimeToMinutes(startTime);
  const requestedServiceEnd = requestedStart + durationMinutes;
  const requestedBufferEnd = requestedServiceEnd + bufferMinutes;

  // 2. Salon Operating Hours Check (09:00 - 20:00)
  const salonOpenMinutes = SALON_OPEN_HOUR * 60;
  const salonCloseMinutes = SALON_CLOSE_HOUR * 60;

  if (requestedStart < salonOpenMinutes || requestedBufferEnd > salonCloseMinutes) {
    return {
      isValid: false,
      reason: 'out_of_hours',
      message: `En dehors des horaires d'ouverture (${SALON_OPEN_HOUR}:00 - ${SALON_CLOSE_HOUR}:00). Le créneau + buffer se termine à ${minutesToTimeString(requestedBufferEnd)}.`,
    };
  }

  // 3. Collision / Double-Booking Guard
  // Checks all active appointments for this stylist
  const stylistAppointments = appointments.filter(
    (apt) => apt.stylistId === stylistId && apt.id !== excludeAppointmentId && apt.status !== 'CANCELLED'
  );

  for (const existing of stylistAppointments) {
    const existingStart = parseTimeToMinutes(existing.startTime);
    const existingServiceEnd = parseTimeToMinutes(existing.endTime);
    const existingBuffer = parseInt(existing.buffer || '0', 10) || 0;
    const existingBufferEnd = existingServiceEnd + existingBuffer;

    // Standard interval overlap condition:
    // slotA.start < slotB.bufferEnd AND slotA.bufferEnd > slotB.start
    const isOverlapping = requestedStart < existingBufferEnd && requestedBufferEnd > existingStart;

    if (isOverlapping) {
      const isOverlappingBufferOnly = requestedStart >= existingServiceEnd && requestedStart < existingBufferEnd;
      const conflictEndStr = minutesToTimeString(existingBufferEnd);

      const bufferNotice = existingBuffer > 0 ? ` (dont ${existingBuffer} min buffer de nettoyage)` : '';
      const conflictDetail = isOverlappingBufferOnly
        ? `Chevauchement avec le buffer technique du RDV de ${existing.client} (${existing.endTime} - ${conflictEndStr}).`
        : `Fatima / Styliste a déjà le RDV de ${existing.client} (${existing.startTime} - ${existing.endTime})${bufferNotice}.`;

      return {
        isValid: false,
        reason: 'collision',
        conflictingAppointment: existing,
        nextAvailableSlot: conflictEndStr,
        message: `⚠️ Conflit de créneau : ${conflictDetail} Prochain créneau libre à ${conflictEndStr}.`,
      };
    }
  }

  // 4. Valid and available!
  const freeUntilStr = minutesToTimeString(requestedBufferEnd);
  return {
    isValid: true,
    nextAvailableSlot: freeUntilStr,
    message: `✅ Créneau libre et validé (${startTime} - ${freeUntilStr} avec buffer inclus).`,
  };
}
