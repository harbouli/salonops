import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Transaction } from '../../src/domain/models/transaction.entity';
import { CaisseReconciliation } from '../../src/domain/models/caisse-reconciliation.entity';
import { Money } from '../../src/domain/value-objects/money.vo';
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

  it('should successfully create TPE_CARD checkout and compute net salon revenue', () => {
    const tx = Transaction.createCheckout({
      id: 'tx-4',
      branchId: 'branch-1',
      stylistId: 'stylist-2',
      serviceTotalMad: 400,
      retailTotalMad: 100,
      tipAmountMad: 30,
      paymentMethod: 'TPE_CARD',
      stylistCommissionPct: 25, // 25% on 400 MAD service total = 100 MAD
    });

    assert.equal(tx.grandTotal.amount, 500);
    assert.equal(tx.cardAmount.amount, 530); // 500 + 30 tip
    assert.equal(tx.cashAmount.amount, 0);
    assert.equal(tx.stylistCommission.amount, 100);
    assert.equal(tx.netSalonRevenue.amount, 400); // 500 - 100
  });

  it('should compute commission strictly on service total even with high retail sales', () => {
    // Moroccan standard: Retail shampoo/serum sales do not yield service commission
    const tx = Transaction.createCheckout({
      id: 'tx-5',
      branchId: 'branch-1',
      stylistId: 'stylist-1',
      serviceTotalMad: 200, // Service: 200 MAD
      retailTotalMad: 800,  // Retail products: 800 MAD
      paymentMethod: 'CASH',
      stylistCommissionPct: 20, // 20% must be on 200 MAD (= 40 MAD), NOT on 1000 MAD (= 200 MAD)
    });

    assert.equal(tx.grandTotal.amount, 1000);
    assert.equal(tx.stylistCommission.amount, 40);
  });

  it('should compute change due when customer pays in excess with cash', () => {
    const tx = new Transaction({
      id: 'tx-6',
      branchId: 'branch-1',
      stylistId: 'stylist-1',
      serviceTotal: Money.fromMad(250),
      retailTotal: Money.fromMad(50),
      tipAmount: Money.fromMad(20),
      paymentMethod: 'CASH',
      cashAmount: Money.fromMad(350), // Customer handed 350 MAD cash for 320 MAD total with tip
      cardAmount: Money.zero(),
      stylistCommission: Money.fromMad(37.5),
    });

    assert.equal(tx.grandTotal.amount, 300);
    assert.equal(tx.totalWithTip.amount, 320);
    assert.equal(tx.totalPaid.amount, 350);
    assert.equal(tx.changeDue.amount, 30); // 350 - 320 = 30 MAD
  });

  it('should reject negative amounts in transaction', () => {
    assert.throws(
      () =>
        new Transaction({
          id: 'tx-neg',
          branchId: 'branch-1',
          stylistId: 'stylist-1',
          serviceTotal: Money.fromMad(-100),
          paymentMethod: 'CASH',
          cashAmount: Money.fromMad(100),
          cardAmount: Money.zero(),
          stylistCommission: Money.zero(),
        }),
      InvalidValueException
    );

    assert.throws(
      () =>
        new Transaction({
          id: 'tx-neg-cash',
          branchId: 'branch-1',
          stylistId: 'stylist-1',
          serviceTotal: Money.fromMad(100),
          paymentMethod: 'CASH',
          cashAmount: Money.fromMad(-50),
          cardAmount: Money.zero(),
          stylistCommission: Money.zero(),
        }),
      InvalidValueException
    );
  });

  it('should reject invalid payment method distributions', () => {
    // CASH cannot have cardAmount > 0
    assert.throws(
      () =>
        new Transaction({
          id: 'tx-cash-err',
          branchId: 'branch-1',
          stylistId: 'stylist-1',
          serviceTotal: Money.fromMad(100),
          paymentMethod: 'CASH',
          cashAmount: Money.fromMad(100),
          cardAmount: Money.fromMad(50),
          stylistCommission: Money.zero(),
        }),
      /Un paiement en espèces ne peut pas comporter de montant par carte TPE/
    );

    // TPE_CARD cannot have cashAmount > 0
    assert.throws(
      () =>
        new Transaction({
          id: 'tx-card-err',
          branchId: 'branch-1',
          stylistId: 'stylist-1',
          serviceTotal: Money.fromMad(100),
          paymentMethod: 'TPE_CARD',
          cashAmount: Money.fromMad(50),
          cardAmount: Money.fromMad(100),
          stylistCommission: Money.zero(),
        }),
      /Un paiement par carte TPE ne peut pas comporter de montant en espèces/
    );

    // Invalid commission percentage (< 0 or > 100)
    assert.throws(
      () =>
        Transaction.createCheckout({
          id: 'tx-comm-err',
          branchId: 'branch-1',
          stylistId: 'stylist-1',
          serviceTotalMad: 200,
          paymentMethod: 'CASH',
          stylistCommissionPct: 120,
        }),
      /Le pourcentage de commission coiffeuse doit être compris entre 0% et 100%/
    );
  });
});

describe('CaisseReconciliation Domain Entity (Clôture de Caisse & Split Ledger)', () => {
  it('should accurately aggregate daily transactions and verify balanced caisse', () => {
    const tx1 = Transaction.createCheckout({
      id: 'tx-1',
      branchId: 'branch-casa',
      stylistId: 'stylist-fatima',
      serviceTotalMad: 300,
      retailTotalMad: 50,
      tipAmountMad: 20,
      paymentMethod: 'CASH',
      stylistCommissionPct: 15, // 45 MAD
    });

    const tx2 = Transaction.createCheckout({
      id: 'tx-2',
      branchId: 'branch-casa',
      stylistId: 'stylist-salma',
      serviceTotalMad: 600,
      retailTotalMad: 0,
      tipAmountMad: 50,
      paymentMethod: 'TPE_CARD',
      stylistCommissionPct: 20, // 120 MAD
    });

    const tx3 = Transaction.createCheckout({
      id: 'tx-3',
      branchId: 'branch-casa',
      stylistId: 'stylist-fatima',
      serviceTotalMad: 400,
      retailTotalMad: 100,
      tipAmountMad: 0,
      paymentMethod: 'SPLIT',
      cashAmountMad: 200,
      cardAmountMad: 300,
      stylistCommissionPct: 15, // 60 MAD
    });

    // Opening cash float: 500 MAD
    // Total cash from tx: tx1 (370) + tx3 (200) = 570 MAD
    // Expected drawer cash: 500 + 570 = 1070 MAD
    // Counted physical cash: 1070 MAD
    const recon = CaisseReconciliation.fromTransactions({
      branchId: 'branch-casa',
      date: '2026-09-24',
      transactions: [tx1, tx2, tx3],
      openingCashMad: 500,
      actualCashMad: 1070,
    });

    assert.equal(recon.totalCash.amount, 570);
    assert.equal(recon.totalCard.amount, 950); // tx2: 650, tx3: 300
    assert.equal(recon.totalServiceRevenue.amount, 1300); // 300 + 600 + 400
    assert.equal(recon.totalRetailRevenue.amount, 150); // 50 + 0 + 100
    assert.equal(recon.totalGrossRevenue.amount, 1450);
    assert.equal(recon.totalTips.amount, 70); // 20 + 50
    assert.equal(recon.totalCommissions.amount, 225); // 45 + 120 + 60
    assert.equal(recon.netSalonRevenue.amount, 1225); // 1450 - 225
    assert.equal(recon.expectedDrawerCash.amount, 1070);
    assert.equal(recon.actualCash?.amount, 1070);
    assert.equal(recon.variance?.amount, 0);
    assert.equal(recon.isBalanced, true);
    assert.equal(recon.transactionCount, 3);

    // Stylist breakdown check
    const fatima = recon.stylistBreakdowns.find((s) => s.stylistId === 'stylist-fatima');
    assert.ok(fatima);
    assert.equal(fatima.serviceRevenue.amount, 700); // 300 + 400
    assert.equal(fatima.commission.amount, 105); // 45 + 60
    assert.equal(fatima.tips.amount, 20);
    assert.equal(fatima.transactionCount, 2);

    const salma = recon.stylistBreakdowns.find((s) => s.stylistId === 'stylist-salma');
    assert.ok(salma);
    assert.equal(salma.serviceRevenue.amount, 600);
    assert.equal(salma.commission.amount, 120);
    assert.equal(salma.tips.amount, 50);
    assert.equal(salma.transactionCount, 1);
  });

  it('should detect cash drawer deficit (manquant de caisse) and surplus (excédent)', () => {
    const tx = Transaction.createCheckout({
      id: 'tx-1',
      branchId: 'branch-casa',
      stylistId: 'stylist-fatima',
      serviceTotalMad: 200,
      paymentMethod: 'CASH',
      stylistCommissionPct: 10,
    });

    // Expected cash: 200 MAD
    // Scenario 1: Missing 50 MAD (actual 150)
    const deficit = CaisseReconciliation.fromTransactions({
      branchId: 'branch-casa',
      date: '2026-09-24',
      transactions: [tx],
      openingCashMad: 0,
      actualCashMad: 150,
    });
    assert.equal(deficit.isBalanced, false);
    assert.equal(deficit.variance?.amount, -50);

    // Scenario 2: Surplus of 20 MAD (actual 220)
    const surplus = CaisseReconciliation.fromTransactions({
      branchId: 'branch-casa',
      date: '2026-09-24',
      transactions: [tx],
      openingCashMad: 0,
      actualCashMad: 220,
    });
    assert.equal(surplus.isBalanced, false);
    assert.equal(surplus.variance?.amount, 20);
  });
});
