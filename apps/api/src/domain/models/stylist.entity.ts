import { TimeSlot } from '../value-objects/time-slot.vo';

export interface StylistProps {
  id: string;
  branchId: string;
  fullName: string;
  phone: string;
  role: string;
  avatarUrl?: string | null;
  commissionPct: number;
  isActive: boolean;
  isDayOff: boolean;
  workingStart: string; // e.g. "09:00"
  workingEnd: string;   // e.g. "19:30"
}

export class Stylist {
  public readonly id: string;
  public readonly branchId: string;
  public readonly fullName: string;
  public readonly phone: string;
  public readonly role: string;
  public readonly avatarUrl?: string | null;
  public readonly commissionPct: number;
  public readonly isActive: boolean;
  public readonly isDayOff: boolean;
  public readonly workingStart: string;
  public readonly workingEnd: string;

  constructor(props: StylistProps) {
    this.id = props.id;
    this.branchId = props.branchId;
    this.fullName = props.fullName;
    this.phone = props.phone;
    this.role = props.role;
    this.avatarUrl = props.avatarUrl;
    this.commissionPct = props.commissionPct;
    this.isActive = props.isActive;
    this.isDayOff = props.isDayOff;
    this.workingStart = props.workingStart;
    this.workingEnd = props.workingEnd;
  }

  public canTakeAppointments(): boolean {
    return this.isActive && !this.isDayOff;
  }

  public isAvailableFor(timeSlot: TimeSlot): boolean {
    if (!this.canTakeAppointments()) {
      return false;
    }
    return timeSlot.isWithinWorkingHours(this.workingStart, this.workingEnd);
  }
}
