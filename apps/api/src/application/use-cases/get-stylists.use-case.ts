import { StylistResponseDTO } from '../dtos';
import { IStylistRepository } from '../../domain/ports/stylist-repository.port';
import { IGetStylistsUseCase } from '../ports/get-stylists.port';
import { ITenantContextPort } from '../../domain/ports/tenant-context.port';
import { CrossTenantAccessException } from '../../domain/exceptions/domain.exception';

export class GetStylistsUseCase implements IGetStylistsUseCase {
  constructor(
    private readonly stylistRepo: IStylistRepository,
    private readonly tenantPort?: ITenantContextPort
  ) {}

  public async execute(branchId?: string): Promise<StylistResponseDTO[]> {
    const tenant = this.tenantPort?.getTenant();
    let effectiveBranchId = branchId;

    if (tenant && !tenant.isSuperAdmin) {
      if (branchId && branchId !== tenant.branchId) {
        throw new CrossTenantAccessException(
          `Accès inter-succursales interdit : impossible d'accéder aux coiffeuses de la succursale "${branchId}".`
        );
      }
      effectiveBranchId = tenant.branchId;
    }

    const stylists = await this.stylistRepo.findAllActive(effectiveBranchId);

    return stylists.map((s) => {
      const schedule = s.getShiftScheduleWindow();
      return {
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
        shiftSchedule: {
          workingStart: schedule.workingStart,
          workingEnd: schedule.workingEnd,
          isDayOff: schedule.isDayOff,
          canTakeAppointments: schedule.canTakeAppointments,
          startISO: schedule.startISO,
          endISO: schedule.endISO,
        },
      };
    });
  }
}
