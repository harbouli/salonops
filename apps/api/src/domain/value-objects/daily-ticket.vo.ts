import { InvalidValueException } from '../exceptions/domain.exception';

export class DailyTicket {
  private readonly _number: number;
  private readonly _date: Date;
  private readonly _branchId: string;

  private constructor(number: number, branchId: string, date?: Date) {
    if (number <= 0) {
      throw new InvalidValueException('Le numéro de ticket doit être positif.');
    }
    if (!branchId || branchId.trim().length === 0) {
      throw new InvalidValueException('Le branchId est requis pour générer un ticket.');
    }
    this._number = number;
    this._branchId = branchId;
    this._date = date ?? new Date();
  }

  public static create(number: number, branchId: string, date?: Date): DailyTicket {
    return new DailyTicket(number, branchId, date);
  }

  public get number(): number {
    return this._number;
  }

  public get branchId(): string {
    return this._branchId;
  }

  public get date(): Date {
    return this._date;
  }

  public get formatted(): string {
    return `Ticket #${this._number}`;
  }
}
