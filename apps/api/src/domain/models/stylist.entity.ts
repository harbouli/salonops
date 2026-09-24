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

  public getShiftScheduleWindow(referenceDate: Date | string = new Date()): StylistShiftSchedule {
    const canTake = this.canTakeAppointments();
    if (!canTake) {
      return {
        workingStart: this.workingStart,
        workingEnd: this.workingEnd,
        isDayOff: this.isDayOff,
        canTakeAppointments: false,
        startISO: null,
        endISO: null,
      };
    }

    const d = typeof referenceDate === 'string' ? new Date(referenceDate) : referenceDate;
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');

    const startISO = new Date(`${year}-${month}-${day}T${this.workingStart}:00.000Z`).toISOString();
    const endISO = new Date(`${year}-${month}-${day}T${this.workingEnd}:00.000Z`).toISOString();

    return {
      workingStart: this.workingStart,
      workingEnd: this.workingEnd,
      isDayOff: this.isDayOff,
      canTakeAppointments: true,
      startISO,
      endISO,
    };
  }
}

export interface StylistShiftSchedule {
  workingStart: string;
  workingEnd: string;
  isDayOff: boolean;
  canTakeAppointments: boolean;
  startISO: string | null;
  endISO: string | null;
}
