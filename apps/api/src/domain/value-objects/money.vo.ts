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

  public isGreaterThanOrEqual(other: Money): boolean {
    return this.cents >= other.cents;
  }

  public isLessThanOrEqual(other: Money): boolean {
    return this.cents <= other.cents;
  }

  public isNegative(): boolean {
    return this.cents < 0;
  }

  public isZero(): boolean {
    return this.cents === 0;
  }

  public isPositive(): boolean {
    return this.cents > 0;
  }

  public abs(): Money {
    return new Money(Math.abs(this.cents));
  }

  public difference(other: Money): Money {
    return new Money(this.cents - other.cents);
  }

  public ensureNonNegative(fieldName = 'Le montant'): Money {
    if (this.isNegative()) {
      throw new InvalidValueException(`${fieldName} ne peut pas être négatif (${this.formatted()}).`);
    }
    return this;
  }

  public static varianceCheck(expected: Money, actual: Money): {
    variance: Money;
    isBalanced: boolean;
    isSurplus: boolean;
    isDeficit: boolean;
    formattedVariance: string;
  } {
    const diff = actual.subtract(expected);
    return {
      variance: diff,
      isBalanced: diff.isZero(),
      isSurplus: diff.isPositive(),
      isDeficit: diff.isNegative(),
      formattedVariance: diff.formatted(),
    };
  }
}
