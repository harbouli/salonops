import { TimeSlot } from '../value-objects/time-slot.vo';
import { Money } from '../value-objects/money.vo';
import { InvalidAppointmentStateException } from '../exceptions/domain.exception';

export type AppointmentStatus =
  | 'BOOKED'
  | 'CONFIRMED'
  | 'IN_CHAIR'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface AppointmentProps {
  id: string;
  branchId: string;
  stylistId: string;
  clientId: string;
  serviceId: string;
  timeSlot: TimeSlot;
  price: Money;
  status: AppointmentStatus;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Appointment {
  public readonly id: string;
  public readonly branchId: string;
  public readonly stylistId: string;
  public readonly clientId: string;
  public readonly serviceId: string;
  private _timeSlot: TimeSlot;
  private _price: Money;
  private _status: AppointmentStatus;
  private _notes?: string | null;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: AppointmentProps) {
    this.id = props.id;
    this.branchId = props.branchId;
    this.stylistId = props.stylistId;
    this.clientId = props.clientId;
    this.serviceId = props.serviceId;
    this._timeSlot = props.timeSlot;
    this._price = props.price;
    this._status = props.status;
    this._notes = props.notes ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public get timeSlot(): TimeSlot {
    return this._timeSlot;
  }

  public get price(): Money {
    return this._price;
  }

  public get status(): AppointmentStatus {
    return this._status;
  }

  public get notes(): string | null | undefined {
    return this._notes;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public confirm(): void {
    if (this._status === 'CANCELLED' || this._status === 'NO_SHOW') {
      throw new InvalidAppointmentStateException(`Impossible de confirmer un rendez-vous avec le statut: ${this._status}`);
    }
    this._status = 'CONFIRMED';
    this._updatedAt = new Date();
  }

  public startInChair(): void {
    if (this._status === 'CANCELLED' || this._status === 'NO_SHOW' || this._status === 'COMPLETED') {
      throw new InvalidAppointmentStateException(`Impossible de passer au fauteuil depuis le statut: ${this._status}`);
    }
    this._status = 'IN_CHAIR';
    this._updatedAt = new Date();
  }

  public complete(): void {
    if (this._status === 'CANCELLED' || this._status === 'NO_SHOW') {
      throw new InvalidAppointmentStateException(`Impossible de compléter un rendez-vous avec le statut: ${this._status}`);
    }
    this._status = 'COMPLETED';
    this._updatedAt = new Date();
  }

  public cancel(options?: { reason?: string; cancellationTime?: Date; minNoticeHours?: number }): { isLate: boolean } {
    if (this._status === 'COMPLETED') {
      throw new InvalidAppointmentStateException('Impossible d’annuler un rendez-vous déjà complété.');
    }
    if (this._status === 'CANCELLED') {
      throw new InvalidAppointmentStateException('Ce rendez-vous est déjà annulé.');
    }
    if (this._status === 'NO_SHOW') {
      throw new InvalidAppointmentStateException('Impossible d’annuler un rendez-vous déjà marqué absent.');
    }

    const cancelAt = options?.cancellationTime ?? new Date();
    const minNoticeHours = options?.minNoticeHours ?? 2; // Moroccan salon 2-hour minimum notice
    const noticeLimitMs = minNoticeHours * 60 * 60 * 1000;
    const isLate = this._timeSlot.startTime.getTime() - cancelAt.getTime() < noticeLimitMs;

    this._status = 'CANCELLED';
    const tag = isLate ? 'Annulation tardive' : 'Annulation';
    const reasonText = options?.reason ? `${tag}: ${options.reason}` : tag;
    this._notes = this._notes ? `${this._notes} | ${reasonText}` : reasonText;
    this._updatedAt = new Date();

    return { isLate };
  }

  public markNoShow(options?: { recordedAt?: Date; gracePeriodMinutes?: number }): void {
    if (this._status === 'COMPLETED') {
      throw new InvalidAppointmentStateException('Impossible de marquer absent un rendez-vous déjà complété.');
    }
    if (this._status === 'CANCELLED') {
      throw new InvalidAppointmentStateException('Impossible de marquer absent un rendez-vous déjà annulé.');
    }
    if (this._status === 'NO_SHOW') {
      throw new InvalidAppointmentStateException('Ce rendez-vous est déjà marqué absent.');
    }

    const recordedAt = options?.recordedAt ?? new Date();
    const gracePeriodMinutes = options?.gracePeriodMinutes ?? 15; // Standard 15 min grace period
    const graceExpiryTime = new Date(this._timeSlot.startTime.getTime() + gracePeriodMinutes * 60 * 1000);

    if (recordedAt < graceExpiryTime) {
      throw new InvalidAppointmentStateException(
        `Impossible de marquer absent avant la fin de la période de grâce (${gracePeriodMinutes} min après le début prévu).`
      );
    }

    this._status = 'NO_SHOW';
    this._updatedAt = new Date();
  }

  public reschedule(newTimeSlot: TimeSlot): void {
    if (this._status === 'COMPLETED' || this._status === 'CANCELLED') {
      throw new InvalidAppointmentStateException(`Impossible de replanifier un rendez-vous ${this._status.toLowerCase()}.`);
    }
    this._timeSlot = newTimeSlot;
    this._updatedAt = new Date();
  }

  public isActive(): boolean {
    return this._status !== 'CANCELLED' && this._status !== 'NO_SHOW';
  }
}
