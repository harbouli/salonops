import { UserRole } from '@salonops/shared-types';
import { IPasswordHasherPort } from '../ports/password-hasher.port';

export interface UserProps {
  id: string;
  branchId: string;
  fullName: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  avatarUrl?: string | null;
  commissionPct: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  public readonly id: string;
  public readonly branchId: string;
  public readonly fullName: string;
  public readonly phone: string;
  public readonly passwordHash: string;
  public readonly role: UserRole;
  public readonly avatarUrl?: string | null;
  public readonly commissionPct: number;
  public readonly isActive: boolean;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.branchId = props.branchId;
    this.fullName = props.fullName;
    this.phone = props.phone;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.avatarUrl = props.avatarUrl;
    this.commissionPct = props.commissionPct;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public async verifyPassword(hasher: IPasswordHasherPort, plainTextPassword: string): Promise<boolean> {
    return hasher.verify(plainTextPassword, this.passwordHash);
  }

  public isFloorStaff(): boolean {
    return this.role === UserRole.STYLIST || this.role === UserRole.RECEPTIONIST;
  }

  public isOwnerOrManager(): boolean {
    return this.role === UserRole.OWNER || this.role === UserRole.MANAGER || this.role === UserRole.SUPER_ADMIN;
  }

  public isSuperAdmin(): boolean {
    return this.role === UserRole.SUPER_ADMIN;
  }
}

