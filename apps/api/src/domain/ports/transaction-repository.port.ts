import { Transaction } from '../models/transaction.entity';

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  save(transaction: Transaction): Promise<Transaction>;
  findByBranchAndDateRange(branchId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
  findByAppointmentId(appointmentId: string): Promise<Transaction | null>;
}
