import { MoroccanPhoneNumber } from '../value-objects/phone-number.vo';
import { ReliabilityScore } from '../value-objects/reliability-score.vo';

export interface ClientProps {
  id: string;
  branchId: string;
  fullName: string;
  phone: MoroccanPhoneNumber;
  loyaltyPoints?: number;
  noShowCount?: number;
  lateCancellationCount?: number;
  reliabilityScore?: ReliabilityScore | number;
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
  private _noShowCount: number;
  private _lateCancellationCount: number;
  private _reliabilityScore: ReliabilityScore;
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
    this._noShowCount = props.noShowCount ?? 0;
    this._lateCancellationCount = props.lateCancellationCount ?? 0;
    this._reliabilityScore =
      props.reliabilityScore instanceof ReliabilityScore
        ? props.reliabilityScore
        : ReliabilityScore.create(props.reliabilityScore ?? ReliabilityScore.INITIAL_SCORE);
    this.preferences = props.preferences ?? [];
    this.scalpAlert = props.scalpAlert ?? null;
    this.allergies = props.allergies ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public get loyaltyPoints(): number {
    return this._loyaltyPoints;
  }

  public get noShowCount(): number {
    return this._noShowCount;
  }

  public get lateCancellationCount(): number {
    return this._lateCancellationCount;
  }

  public get reliabilityScore(): ReliabilityScore {
    return this._reliabilityScore;
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

  public recordNoShow(): void {
    this._noShowCount += 1;
    this._reliabilityScore = this._reliabilityScore.applyNoShowPenalty();
    this._updatedAt = new Date();
  }

  public recordLateCancellation(): void {
    this._lateCancellationCount += 1;
    this._reliabilityScore = this._reliabilityScore.applyLateCancellationPenalty();
    this._updatedAt = new Date();
  }

  public recordCompletedVisit(): void {
    this._reliabilityScore = this._reliabilityScore.applyCompletedVisitReward();
    this._updatedAt = new Date();
  }

  public hasScalpAlert(): boolean {
    return Boolean(this.scalpAlert && this.scalpAlert.trim().length > 0);
  }
}
