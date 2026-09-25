import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { MoroccanPhoneNumber } from '../../src/domain/value-objects/phone-number.vo';
import { InvalidValueException } from '../../src/domain/exceptions/domain.exception';

describe('PhoneNumber Value Object', () => {
  it('should create valid phone number from 06 format', () => {
    const phone = MoroccanPhoneNumber.create('0612345678');
    assert.equal(phone.getValue(), '+212612345678');
  });

  it('should create valid phone number from +212 format', () => {
    const phone = MoroccanPhoneNumber.create('+212712345678');
    assert.equal(phone.getValue(), '+212712345678');
  });

  it('should throw on invalid format', () => {
    assert.throws(() => MoroccanPhoneNumber.create('0512345678'), InvalidValueException);
  });
});
