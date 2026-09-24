import { InvalidValueException } from '../exceptions/domain.exception';

export class TimeSlot {
  public readonly startTime: Date;
  public readonly durationMinutes: number;
  public readonly bufferMinutes: number;
  public readonly endTime: Date;
  public readonly bufferEndTime: Date;

  private constructor(startTime: Date, durationMinutes: number, bufferMinutes: number) {
    if (isNaN(startTime.getTime())) {
      throw new InvalidValueException('Date de début invalide.');
    }
    if (durationMinutes <= 0) {
      throw new InvalidValueException('La durée de la prestation doit être supérieure à 0 minute.');
    }
    if (bufferMinutes < 0) {
      throw new InvalidValueException('Le temps de battement (buffer) ne peut pas être négatif.');
    }

    this.startTime = new Date(startTime.getTime());
    this.durationMinutes = durationMinutes;
    this.bufferMinutes = bufferMinutes;
    this.endTime = new Date(this.startTime.getTime() + durationMinutes * 60_000);
    this.bufferEndTime = new Date(this.endTime.getTime() + bufferMinutes * 60_000);
  }

  public static create(startTime: Date | string, durationMinutes: number, bufferMinutes: number = 0): TimeSlot {
    const parsedDate = typeof startTime === 'string' ? new Date(startTime) : startTime;
    return new TimeSlot(parsedDate, durationMinutes, bufferMinutes);
  }

  public static fromExisting(startTime: Date | string, endTime: Date | string, bufferEndTime: Date | string): TimeSlot {
    const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
    const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
    const buffer = typeof bufferEndTime === 'string' ? new Date(bufferEndTime) : bufferEndTime;

    const duration = Math.round((end.getTime() - start.getTime()) / 60_000);
    const bufferDuration = Math.round((buffer.getTime() - end.getTime()) / 60_000);

    return new TimeSlot(start, Math.max(1, duration), Math.max(0, bufferDuration));
  }

  /**
   * Collision check: Two intervals overlap if slotA.start < slotB.bufferEnd AND slotA.bufferEnd > slotB.start
   */
  public overlapsWith(other: { startTime: Date; bufferEndTime: Date }): boolean {
    return this.startTime.getTime() < other.bufferEndTime.getTime() &&
           this.bufferEndTime.getTime() > other.startTime.getTime();
  }

  /**
   * Validates if slot falls within working hours (e.g. "09:00" to "19:30")
   */
  public isWithinWorkingHours(workingStart: string, workingEnd: string): boolean {
    const [startH, startM] = workingStart.split(':').map(Number);
    const [endH, endM] = workingEnd.split(':').map(Number);

    const slotStartMinutes = this.startTime.getHours() * 60 + this.startTime.getMinutes();
    const slotEndMinutes = this.bufferEndTime.getHours() * 60 + this.bufferEndTime.getMinutes();

    const shiftStartMinutes = startH * 60 + startM;
    const shiftEndMinutes = endH * 60 + endM;

    return slotStartMinutes >= shiftStartMinutes && slotEndMinutes <= shiftEndMinutes;
  }
}
