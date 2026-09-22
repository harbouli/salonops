import { randomUUID } from 'crypto';
import { ProcessCheckoutDTO, CheckoutResponseDTO } from '../dtos';
import { ITransactionRepository } from '../../domain/ports/transaction-repository.port';
import { IAppointmentRepository } from '../../domain/ports/appointment-repository.port';
import { IStylistRepository } from '../../domain/ports/stylist-repository.port';
import { IClientRepository } from '../../domain/ports/client-repository.port';
import { Transaction } from '../../domain/models/transaction.entity';
import { EntityNotFoundException } from '../../domain/exceptions/domain.exception';
import { IProcessCheckoutUseCase } from '../ports/process-checkout.port';

export class ProcessCheckoutUseCase implements IProcessCheckoutUseCase {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly stylistRepo: IStylistRepository,
    private readonly clientRepo: IClientRepository
  ) {}

  public async execute(dto: ProcessCheckoutDTO): Promise<CheckoutResponseDTO> {
    // 1. Verify stylist & get commission percentage
    const stylist = await this.stylistRepo.findById(dto.stylistId);
    if (!stylist) {
      throw new EntityNotFoundException('Coiffeuse', dto.stylistId);
    }

    // 2. If tied to an appointment, verify and complete it
    if (dto.appointmentId) {
      const appointment = await this.appointmentRepo.findById(dto.appointmentId);
      if (appointment && appointment.status !== 'COMPLETED') {
        appointment.complete();
        await this.appointmentRepo.save(appointment);
      }
    }

    // 3. Create Transaction Aggregate Root (handles split invariants & commission)
    const transaction = Transaction.createCheckout({
      id: randomUUID(),
      branchId: dto.branchId,
      appointmentId: dto.appointmentId,
      stylistId: dto.stylistId,
      clientId: dto.clientId,
      serviceTotalMad: dto.serviceTotalMad,
      retailTotalMad: dto.retailTotalMad,
      tipAmountMad: dto.tipAmountMad,
      paymentMethod: dto.paymentMethod,
      cashAmountMad: dto.cashAmountMad,
      cardAmountMad: dto.cardAmountMad,
      stylistCommissionPct: stylist.commissionPct,
    });

    // 4. Save transaction via Outbound Port
    const saved = await this.transactionRepo.save(transaction);

    // 5. If client is present, award loyalty points (e.g. 1 pt per 10 MAD)
    if (dto.clientId) {
      const client = await this.clientRepo.findById(dto.clientId);
      if (client) {
        const pointsEarned = Math.floor(transaction.grandTotal.amount / 10);
        client.addLoyaltyPoints(pointsEarned);
        await this.clientRepo.save(client);
      }
    }

    return {
      id: saved.id,
      branchId: saved.branchId,
      appointmentId: saved.appointmentId,
      stylistId: saved.stylistId,
      clientId: saved.clientId,
      serviceTotalMad: saved.serviceTotal.toMadString(),
      retailTotalMad: saved.retailTotal.toMadString(),
      tipAmountMad: saved.tipAmount.toMadString(),
      grandTotalMad: saved.grandTotal.toMadString(),
      paymentMethod: saved.paymentMethod,
      cashAmountMad: saved.cashAmount.toMadString(),
      cardAmountMad: saved.cardAmount.toMadString(),
      stylistCommissionMad: saved.stylistCommission.toMadString(),
      createdAt: saved.createdAt.toISOString(),
    };
  }
}
