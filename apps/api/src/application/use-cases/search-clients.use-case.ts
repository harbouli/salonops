import { ClientResponseDTO } from '../dtos';
import { IClientRepository } from '../../domain/ports/client-repository.port';
import { ISearchClientsUseCase } from '../ports/search-clients.port';
import { ITenantContextPort } from '../../domain/ports/tenant-context.port';
import { CrossTenantAccessException } from '../../domain/exceptions/domain.exception';

export class SearchClientsUseCase implements ISearchClientsUseCase {
  constructor(
    private readonly clientRepo: IClientRepository,
    private readonly tenantPort?: ITenantContextPort
  ) {}

  public async execute(query: string, branchId?: string): Promise<ClientResponseDTO[]> {
    const tenant = this.tenantPort?.getTenant();
    let effectiveBranchId = branchId;

    if (tenant && !tenant.isSuperAdmin) {
      if (branchId && branchId !== tenant.branchId) {
        throw new CrossTenantAccessException(
          `Accès inter-succursales interdit : impossible de rechercher des clientes de la succursale "${branchId}".`
        );
      }
      effectiveBranchId = tenant.branchId;
    }

    const clients = await this.clientRepo.search(query, effectiveBranchId);

    return clients.map((c) => ({
      id: c.id,
      branchId: c.branchId,
      fullName: c.fullName,
      phone: c.phone.value,
      formattedPhone: c.phone.toFormatted(),
      loyaltyPoints: c.loyaltyPoints,
      noShowCount: c.noShowCount,
      lateCancellationCount: c.lateCancellationCount,
      reliabilityScore: c.reliabilityScore.value,
      reliabilityTier: c.reliabilityScore.tier,
      depositRecommended: c.reliabilityScore.isDepositRecommended(),
      preferences: c.preferences,
      scalpAlert: c.scalpAlert,
      allergies: c.allergies,
      createdAt: c.createdAt.toISOString(),
    }));
  }
}
