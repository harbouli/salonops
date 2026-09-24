import { randomUUID } from 'crypto';
import { ProcessCheckoutDTO, CheckoutResponseDTO } from '../dtos';
import { ITransactionRepository } from '../../domain/ports/transaction-repository.port';
import { IAppointmentRepository } from '../../domain/ports/appointment-repository.port';
import { IStylistRepository } from '../../domain/ports/stylist-repository.port';
import { IClientRepository } from '../../domain/ports/client-repository.port';
import { ITenantContextPort } from '../../domain/ports/tenant-context.port';
import { Transaction } from '../../domain/models/transaction.entity';
import {
  EntityNotFoundException,
  CrossTenantAccessException,
  InvalidAppointmentStateException,
} from '../../domain/exceptions/domain.exception';
import { IProcessCheckoutUseCase } from '../ports/process-checkout.port';

export class ProcessCheckoutUseCase implements IProcessCheckoutUseCase {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly stylistRepo: IStylistRepository,
    private readonly clientRepo: IClientRepository,
    private readonly tenantPort?: ITenantContextPort
  ) {}

  public async execute(dto: ProcessCheckoutDTO): Promise<CheckoutResponseDTO> {
    // 0. Enforce multi-branch tenant isolation
    const tenant = this.tenantPort?.getTenant();
    if (tenant && !tenant.isSuperAdmin) {
      if (dto.branchId && dto.branchId !== tenant.branchId) {
        throw new CrossTenantAccessException(
          `Accès inter-succursales interdit : tentative d'encaissement pour la succursale "${dto.branchId}" depuis la succursale autorisée "${tenant.branchId}".`
        );
      }
    }

    // 1. Verify stylist & get commission percentage
    const stylist = await this.stylistRepo.findById(dto.stylistId);
    if (!stylist) {
      throw new EntityNotFoundException('Coiffeuse', dto.stylistId);
    }
    if (stylist.branchId !== dto.branchId) {
      throw new CrossTenantAccessException("La coiffeuse n'appartient pas à la succursale indiquée.");
    }

    // 2. If tied to an appointment, verify and complete it
    if (dto.appointmentId) {
      const appointment = await this.appointmentRepo.findById(dto.appointmentId);
      if (!appointment) {
        throw new EntityNotFoundException('Rendez-vous', dto.appointmentId);
      }
      if (appointment.branchId !== dto.branchId) {
        throw new CrossTenantAccessException("Le rendez-vous n'appartient pas à la succursale indiquée.");
      }

      // Prevent duplicate checkout for the same appointment
      const existingTx = await this.transactionRepo.findByAppointmentId(dto.appointmentId);
      if (existingTx) {
        throw new InvalidAppointmentStateException('Ce rendez-vous a déjà fait l’objet d’un encaissement.');
      }

      if (appointment.status !== 'COMPLETED') {
        appointment.complete();
        await this.appointmentRepo.save(appointment);
      }
    }

    // 3. Verify client if provided
    let client = null;
    if (dto.clientId) {
      client = await this.clientRepo.findById(dto.clientId);
      if (!client) {
        throw new EntityNotFoundException('Cliente', dto.clientId);
      }
    }

    // 4. Create Transaction Aggregate Root (handles split invariants & commission strictly on service)
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

    // 5. Save transaction via Outbound Port
    const saved = await this.transactionRepo.save(transaction);

    // 6. If client is present, award loyalty points (Moroccan salon standard: 1 pt per 10 MAD)
    if (client) {
      const pointsEarned = Math.floor(transaction.grandTotal.amount / 10);
      if (pointsEarned > 0) {
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
      totalPaidMad: saved.totalPaid.toMadString(),
      changeDueMad: saved.changeDue.toMadString(),
      netSalonRevenueMad: saved.netSalonRevenue.toMadString(),
      paymentMethod: saved.paymentMethod,
      cashAmountMad: saved.cashAmount.toMadString(),
      cardAmountMad: saved.cardAmount.toMadString(),
      stylistCommissionMad: saved.stylistCommission.toMadString(),
      createdAt: saved.createdAt.toISOString(),
    };
  }
}
