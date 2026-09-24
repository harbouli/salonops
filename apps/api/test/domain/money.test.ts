import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Money } from '../../src/domain/value-objects/money.vo';

describe('Money Value Object (Moroccan Dirham - MAD)', () => {
  it('should initialize correctly from numeric MAD or string MAD', () => {
    const m1 = Money.fromMad(150.5);
    const m2 = Money.fromMad('150.50');

    assert.equal(m1.amount, 150.5);
    assert.equal(m1.amountCents, 15050);
    assert.equal(m1.toMadString(), '150.50');
    assert.equal(m1.formatted(), '150.50 MAD');
    assert.equal(m1.equals(m2), true);
  });

  it('should perform accurate arithmetic without floating point drift', () => {
    const price = Money.fromMad(199.99);
    const fee = Money.fromMad(0.01);
    const total = price.add(fee);

    assert.equal(total.amount, 200);
    assert.equal(total.toMadString(), '200.00');

    const sub = total.subtract(Money.fromMad(50));
    assert.equal(sub.amount, 150);
  });

  it('should calculate stylist commission percentage accurately', () => {
    // 350 MAD service with 15% commission
    const servicePrice = Money.fromMad(350);
    const commission = servicePrice.percentage(15);

    assert.equal(commission.amount, 52.5);
    assert.equal(commission.formatted(), '52.50 MAD');
  });

  it('should compare amounts correctly', () => {
    const a = Money.fromMad(100);
    const b = Money.fromMad(200);

    assert.equal(a.isLessThan(b), true);
    assert.equal(b.isGreaterThan(a), true);
    assert.equal(a.equals(Money.fromMad(100)), true);
    assert.equal(a.isGreaterThanOrEqual(Money.fromMad(100)), true);
    assert.equal(a.isLessThanOrEqual(Money.fromMad(100)), true);
    assert.equal(Money.zero().isZero(), true);
    assert.equal(a.isPositive(), true);
  });

  it('should enforce non-negative amounts via ensureNonNegative', () => {
    const valid = Money.fromMad(50);
    assert.equal(valid.ensureNonNegative().amount, 50);

    const negative = Money.fromMad(-20);
    assert.throws(
      () => negative.ensureNonNegative('Le montant de test'),
      /Le montant de test ne peut pas être négatif/
    );
  });

  it('should calculate cash drawer variance correctly (balanced, surplus, deficit)', () => {
    const expected = Money.fromMad(2500);

    // 1. Balanced: actual matches expected exactly
    const balanced = Money.varianceCheck(expected, Money.fromMad(2500));
    assert.equal(balanced.isBalanced, true);
    assert.equal(balanced.isSurplus, false);
    assert.equal(balanced.isDeficit, false);
    assert.equal(balanced.variance.amount, 0);

    // 2. Surplus: drawer has extra cash (e.g. unrecorded tip or customer excess)
    const surplus = Money.varianceCheck(expected, Money.fromMad(2550));
    assert.equal(surplus.isBalanced, false);
    assert.equal(surplus.isSurplus, true);
    assert.equal(surplus.isDeficit, false);
    assert.equal(surplus.variance.amount, 50);
    assert.equal(surplus.formattedVariance, '50.00 MAD');

    // 3. Deficit: drawer is missing cash
    const deficit = Money.varianceCheck(expected, Money.fromMad(2400));
    assert.equal(deficit.isBalanced, false);
    assert.equal(deficit.isSurplus, false);
    assert.equal(deficit.isDeficit, true);
    assert.equal(deficit.variance.amount, -100);
    assert.equal(deficit.formattedVariance, '-100.00 MAD');
  });
});
