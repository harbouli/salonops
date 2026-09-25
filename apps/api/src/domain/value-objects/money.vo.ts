import { InvalidValueException } from '../exceptions/domain.exception';

export class Money {
  private readonly cents: number;

  private constructor(cents: number) {
    if (!Number.isFinite(cents) || isNaN(cents)) {
      throw new InvalidValueException('Le montant monétaire doit être un nombre valide.');
    }
    this.cents = Math.round(cents);
  }

  public static fromMad(amountMad: number | string): Money {
    const num = typeof amountMad === 'string' ? parseFloat(amountMad) : amountMad;
    if (isNaN(num)) {
      throw new InvalidValueException(`Montant MAD invalide: ${amountMad}`);
    }
    return new Money(Math.round(num * 100));
  }

  public static fromCents(cents: number): Money {
    return new Money(cents);
  }

  public static zero(): Money {
    return new Money(0);
  }

  public get amount(): number {
    return this.cents / 100;
  }

  public get amountCents(): number {
    return this.cents;
  }

  public toMadString(): string {
    return (this.cents / 100).toFixed(2);
  }

  public formatted(): string {
    return `${this.toMadString()} MAD`;
  }

  public add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  public subtract(other: Money): Money {
    return new Money(this.cents - other.cents);
  }

  public multiply(factor: number): Money {
    return new Money(Math.round(this.cents * factor));
  }

  public percentage(pct: number): Money {
    return new Money(Math.round((this.cents * pct) / 100));
  }

  public equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  public isGreaterThan(other: Money): boolean {
    return this.cents > other.cents;
  }

  public isLessThan(other: Money): boolean {
    return this.cents < other.cents;
  }

  public isNegative(): boolean {
    return this.cents < 0;
  }
}
