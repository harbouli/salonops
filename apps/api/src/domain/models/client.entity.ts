import { MoroccanPhoneNumber } from '../value-objects/phone-number.vo';

export interface ClientProps {
  id: string;
  branchId: string;
  fullName: string;
  phone: MoroccanPhoneNumber;
  loyaltyPoints?: number;
  preferences?: string[] | null;
  scalpAlert?: string | null;
  allergies?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Client {
  public readonly id: string;
  public readonly branchId: string;
  public readonly fullName: string;
  public readonly phone: MoroccanPhoneNumber;
  private _loyaltyPoints: number;
  public readonly preferences: string[];
  public readonly scalpAlert?: string | null;
  public readonly allergies?: string | null;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ClientProps) {
    this.id = props.id;
    this.branchId = props.branchId;
    this.fullName = props.fullName;
    this.phone = props.phone;
    this._loyaltyPoints = props.loyaltyPoints ?? 0;
    this.preferences = props.preferences ?? [];
    this.scalpAlert = props.scalpAlert ?? null;
    this.allergies = props.allergies ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public get loyaltyPoints(): number {
    return this._loyaltyPoints;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public addLoyaltyPoints(points: number): void {
    if (points > 0) {
      this._loyaltyPoints += points;
      this._updatedAt = new Date();
    }
  }

  public hasScalpAlert(): boolean {
    return Boolean(this.scalpAlert && this.scalpAlert.trim().length > 0);
  }
}
