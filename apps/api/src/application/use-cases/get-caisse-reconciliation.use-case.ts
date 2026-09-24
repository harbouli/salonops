import {
  GetCaisseReconciliationDTO,
  CaisseReconciliationResponseDTO,
  StylistCaisseBreakdownDTO,
} from '../dtos';
import { ITransactionRepository } from '../../domain/ports/transaction-repository.port';
import { ITenantContextPort } from '../../domain/ports/tenant-context.port';
import { CaisseReconciliation } from '../../domain/models/caisse-reconciliation.entity';
import { CrossTenantAccessException } from '../../domain/exceptions/domain.exception';
import { IGetCaisseReconciliationUseCase } from '../ports/process-checkout.port';

export class GetCaisseReconciliationUseCase implements IGetCaisseReconciliationUseCase {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly tenantPort?: ITenantContextPort
  ) {}

  public async execute(dto: GetCaisseReconciliationDTO): Promise<CaisseReconciliationResponseDTO> {
    // 0. Enforce multi-branch tenant isolation
    const tenant = this.tenantPort?.getTenant();
    if (tenant && !tenant.isSuperAdmin) {
      if (dto.branchId && dto.branchId !== tenant.branchId) {
        throw new CrossTenantAccessException(
          `Accès inter-succursales interdit : consultation de clôture pour la succursale "${dto.branchId}" interdite depuis "${tenant.branchId}".`
        );
      }
    }

    // Default to today if date not specified (YYYY-MM-DD)
    const targetDate = dto.date ?? new Date().toISOString().split('T')[0];

    const startDate = new Date(`${targetDate}T00:00:00.000Z`);
    const endDate = new Date(`${targetDate}T23:59:59.999Z`);

    const transactions = await this.transactionRepo.findByBranchAndDateRange(
      dto.branchId,
      startDate,
      endDate
    );

    const reconciliation = CaisseReconciliation.fromTransactions({
      branchId: dto.branchId,
      date: targetDate,
      transactions,
      openingCashMad: dto.openingCashMad,
      actualCashMad: dto.actualCashMad,
    });

    const stylistBreakdowns: StylistCaisseBreakdownDTO[] = reconciliation.stylistBreakdowns.map((sb) => ({
      stylistId: sb.stylistId,
      serviceRevenueMad: sb.serviceRevenue.toMadString(),
      commissionMad: sb.commission.toMadString(),
      tipsMad: sb.tips.toMadString(),
      transactionCount: sb.transactionCount,
    }));

    return {
      branchId: reconciliation.branchId,
      date: reconciliation.date,
      openingCashMad: reconciliation.openingCash.toMadString(),
      totalCashMad: reconciliation.totalCash.toMadString(),
      totalCardMad: reconciliation.totalCard.toMadString(),
      totalPaidMad: reconciliation.totalPaid.toMadString(),
      totalServiceRevenueMad: reconciliation.totalServiceRevenue.toMadString(),
      totalRetailRevenueMad: reconciliation.totalRetailRevenue.toMadString(),
      totalGrossRevenueMad: reconciliation.totalGrossRevenue.toMadString(),
      totalTipsMad: reconciliation.totalTips.toMadString(),
      totalCommissionsMad: reconciliation.totalCommissions.toMadString(),
      netSalonRevenueMad: reconciliation.netSalonRevenue.toMadString(),
      transactionCount: reconciliation.transactionCount,
      expectedDrawerCashMad: reconciliation.expectedDrawerCash.toMadString(),
      actualCashMad: reconciliation.actualCash ? reconciliation.actualCash.toMadString() : null,
      varianceMad: reconciliation.variance ? reconciliation.variance.toMadString() : null,
      isBalanced: reconciliation.isBalanced,
      stylistBreakdowns,
    };
  }
}
