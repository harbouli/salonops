import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Transaction } from '../../src/domain/models/transaction.entity';
import { InvalidValueException } from '../../src/domain/exceptions/domain.exception';

describe('Transaction Aggregate Root (Moroccan Split Checkout)', () => {
  it('should successfully create CASH checkout and compute stylist commission', () => {
    const tx = Transaction.createCheckout({
      id: 'tx-1',
      branchId: 'branch-1',
      stylistId: 'stylist-1',
      serviceTotalMad: 300,
      retailTotalMad: 50,
      paymentMethod: 'CASH',
      stylistCommissionPct: 20, // 20% on 300 MAD = 60 MAD
    });

    assert.equal(tx.grandTotal.amount, 350);
    assert.equal(tx.cashAmount.amount, 350);
    assert.equal(tx.cardAmount.amount, 0);
    assert.equal(tx.stylistCommission.amount, 60);
  });

  it('should successfully handle SPLIT checkout (Cash + TPE Card)', () => {
    const tx = Transaction.createCheckout({
      id: 'tx-2',
      branchId: 'branch-1',
      stylistId: 'stylist-1',
      serviceTotalMad: 500,
      retailTotalMad: 100,
      paymentMethod: 'SPLIT',
      cashAmountMad: 200,
      cardAmountMad: 400,
      stylistCommissionPct: 15, // 15% on 500 = 75 MAD
    });

    assert.equal(tx.grandTotal.amount, 600);
    assert.equal(tx.cashAmount.amount, 200);
    assert.equal(tx.cardAmount.amount, 400);
    assert.equal(tx.stylistCommission.amount, 75);
  });

  it('should reject checkout if paid amount is less than total due', () => {
    assert.throws(
      () =>
        Transaction.createCheckout({
          id: 'tx-3',
          branchId: 'branch-1',
          stylistId: 'stylist-1',
          serviceTotalMad: 500,
          retailTotalMad: 0,
          paymentMethod: 'SPLIT',
          cashAmountMad: 100,
          cardAmountMad: 200, // 300 < 500
          stylistCommissionPct: 15,
        }),
      InvalidValueException
    );
  });
});
