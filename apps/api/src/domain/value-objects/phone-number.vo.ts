import { InvalidValueException } from '../exceptions/domain.exception';

export class MoroccanPhoneNumber {
  private readonly raw: string;
  private readonly normalized: string;

  private constructor(raw: string, normalized: string) {
    this.raw = raw;
    this.normalized = normalized;
  }

  public static create(phoneNumber: string): MoroccanPhoneNumber {
    const cleaned = phoneNumber.replace(/[\s\-\.\(\)]/g, '');
    let normalized = cleaned;

    if (/^(\+212|212|00212)/.test(cleaned)) {
      normalized = cleaned.replace(/^(\+212|212|00212)/, '0');
    }

    // Moroccan mobile numbers typically start with 06 or 07, fixed lines with 05
    const moroccanRegex = /^0[567][0-9]{8}$/;
    if (!moroccanRegex.test(normalized)) {
      // Allow international or fallback if not strictly formatted, but ensure at least valid digits
      if (!/^\+?[0-9]{8,15}$/.test(cleaned)) {
        throw new InvalidValueException(`Numéro de téléphone invalide: ${phoneNumber}`);
      }
      return new MoroccanPhoneNumber(phoneNumber, cleaned);
    }

    return new MoroccanPhoneNumber(phoneNumber, normalized);
  }

  public get value(): string {
    return this.normalized;
  }

  public toInternational(): string {
    if (this.normalized.startsWith('0')) {
      return `+212${this.normalized.substring(1)}`;
    }
    return this.normalized;
  }

  public toFormatted(): string {
    if (/^0[567][0-9]{8}$/.test(this.normalized)) {
      return `${this.normalized.slice(0, 2)} ${this.normalized.slice(2, 4)} ${this.normalized.slice(4, 6)} ${this.normalized.slice(6, 8)} ${this.normalized.slice(8, 10)}`;
    }
    return this.raw;
  }
}
