import { ClientResponseDTO } from '../dtos';
import { IClientRepository } from '../../domain/ports/client-repository.port';
import { ISearchClientsUseCase } from '../ports/search-clients.port';

export class SearchClientsUseCase implements ISearchClientsUseCase {
  constructor(private readonly clientRepo: IClientRepository) {}

  public async execute(query: string, branchId?: string): Promise<ClientResponseDTO[]> {
    const clients = await this.clientRepo.search(query, branchId);

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
