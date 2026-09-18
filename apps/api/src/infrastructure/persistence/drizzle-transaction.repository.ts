import { db, transactions, eq } from '@salonops/database';
import { ITransactionRepository } from '../../domain/ports/transaction-repository.port';
import { Transaction, PaymentMethod } from '../../domain/models/transaction.entity';
import { Money } from '../../domain/value-objects/money.vo';

export class DrizzleTransactionRepository implements ITransactionRepository {
  private toDomain(row: typeof transactions.$inferSelect): Transaction {
    return new Transaction({
      id: row.id,
      branchId: row.branchId,
      appointmentId: row.appointmentId,
      stylistId: row.stylistId,
      clientId: row.clientId,
      serviceTotal: Money.fromMad(row.serviceTotalMad),
      retailTotal: Money.fromMad(row.retailTotalMad),
      tipAmount: Money.fromMad(row.tipAmountMad),
      paymentMethod: row.paymentMethod as PaymentMethod,
      cashAmount: Money.fromMad(row.cashAmountMad),
      cardAmount: Money.fromMad(row.cardAmountMad),
      stylistCommission: Money.fromMad(row.stylistCommissionMad),
      createdAt: row.createdAt,
    });
  }

  public async findById(id: string): Promise<Transaction | null> {
    const [row] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  public async save(transaction: Transaction): Promise<Transaction> {
    const [inserted] = await db
      .insert(transactions)
      .values({
        id: transaction.id,
        branchId: transaction.branchId,
        appointmentId: transaction.appointmentId,
        stylistId: transaction.stylistId,
        clientId: transaction.clientId,
        serviceTotalMad: transaction.serviceTotal.toMadString(),
        retailTotalMad: transaction.retailTotal.toMadString(),
        tipAmountMad: transaction.tipAmount.toMadString(),
        paymentMethod: transaction.paymentMethod,
        cashAmountMad: transaction.cashAmount.toMadString(),
        cardAmountMad: transaction.cardAmount.toMadString(),
        stylistCommissionMad: transaction.stylistCommission.toMadString(),
        createdAt: transaction.createdAt,
      })
      .returning();

    return this.toDomain(inserted);
  }
}
