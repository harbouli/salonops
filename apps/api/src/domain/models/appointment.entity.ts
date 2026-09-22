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

  public cancel(reason?: string): void {
    if (this._status === 'COMPLETED') {
      throw new InvalidAppointmentStateException('Impossible d’annuler un rendez-vous déjà complété.');
    }
    this._status = 'CANCELLED';
    if (reason) {
      this._notes = this._notes ? `${this._notes} | Annulation: ${reason}` : `Annulation: ${reason}`;
    }
    this._updatedAt = new Date();
  }

  public markNoShow(): void {
    if (this._status === 'COMPLETED') {
      throw new InvalidAppointmentStateException('Impossible de marquer absent un rendez-vous déjà complété.');
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
