import { db, transactions, eq, and, gte, lte, desc } from '@salonops/database';
import { ITransactionRepository } from '../../domain/ports/transaction-repository.port';
import { Transaction, PaymentMethod } from '../../domain/models/transaction.entity';
import { Money } from '../../domain/value-objects/money.vo';
import { ITenantContextPort } from '../../domain/ports/tenant-context.port';
import { withTenantBranchCondition } from './tenant-scoped-query.decorator';

export class DrizzleTransactionRepository implements ITransactionRepository {
  constructor(private readonly tenantPort?: ITenantContextPort) {}

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

  public async findByAppointmentId(appointmentId: string): Promise<Transaction | null> {
    const [row] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.appointmentId, appointmentId))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  public async findByBranchAndDateRange(
    branchId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    const tenantCondition = withTenantBranchCondition(
      transactions.branchId,
      branchId,
      this.tenantPort?.getTenant()
    );

    const conditions = [
      gte(transactions.createdAt, startDate),
      lte(transactions.createdAt, endDate),
    ];

    if (tenantCondition) {
      conditions.push(tenantCondition);
    } else {
      conditions.push(eq(transactions.branchId, branchId));
    }

    const rows = await db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.createdAt));

    return rows.map((r) => this.toDomain(r));
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
