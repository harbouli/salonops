import { Money } from '../value-objects/money.vo';
import { TimeSlot } from '../value-objects/time-slot.vo';

export interface ServiceProps {
  id: string;
  branchId: string;
  nameFr: string;
  nameAr: string;
  category: string;
  durationMinutes: number;
  bufferMinutes: number;
  price: Money;
  depositRequired: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Service {
  public readonly id: string;
  public readonly branchId: string;
  public readonly nameFr: string;
  public readonly nameAr: string;
  public readonly category: string;
  public readonly durationMinutes: number;
  public readonly bufferMinutes: number;
  public readonly price: Money;
  public readonly depositRequired: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: ServiceProps) {
    this.id = props.id;
    this.branchId = props.branchId;
    this.nameFr = props.nameFr;
    this.nameAr = props.nameAr;
    this.category = props.category;
    this.durationMinutes = props.durationMinutes;
    this.bufferMinutes = props.bufferMinutes;
    this.price = props.price;
    this.depositRequired = props.depositRequired;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public createTimeSlot(startTime: Date | string): TimeSlot {
    return TimeSlot.create(startTime, this.durationMinutes, this.bufferMinutes);
  }
}
