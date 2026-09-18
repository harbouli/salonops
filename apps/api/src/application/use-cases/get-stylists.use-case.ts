import { StylistResponseDTO } from '../dtos';
import { IStylistRepository } from '../../domain/ports/stylist-repository.port';
import { IGetStylistsUseCase } from '../ports/get-stylists.port';

export class GetStylistsUseCase implements IGetStylistsUseCase {
  constructor(private readonly stylistRepo: IStylistRepository) {}

  public async execute(branchId?: string): Promise<StylistResponseDTO[]> {
    const stylists = await this.stylistRepo.findAllActive(branchId);

    return stylists.map((s) => ({
      id: s.id,
      branchId: s.branchId,
      fullName: s.fullName,
      phone: s.phone,
      role: s.role,
      avatarUrl: s.avatarUrl,
      commissionPct: s.commissionPct,
      isActive: s.isActive,
      isDayOff: s.isDayOff,
      workingStart: s.workingStart,
      workingEnd: s.workingEnd,
    }));
  }
}
