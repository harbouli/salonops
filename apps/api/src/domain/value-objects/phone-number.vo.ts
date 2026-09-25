import { InvalidValueException } from '../exceptions/domain.exception';

export class PhoneNumber {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(phone: string): PhoneNumber {
    const cleaned = phone.replace(/\s+/g, '');
    
    if (!/^(?:\+212|0)[67]\d{8}$/.test(cleaned)) {
      throw new InvalidValueException('Invalid Moroccan phone number');
    }

    let normalized = cleaned;
    if (normalized.startsWith('0')) {
      normalized = '+212' + normalized.substring(1);
    }

    return new PhoneNumber(normalized);
  }

  public getValue(): string {
    return this.value;
  }
}
