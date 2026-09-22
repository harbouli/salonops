import { ServiceResponseDTO } from '../dtos';
import { IServiceRepository } from '../../domain/ports/service-repository.port';
import { IGetServicesUseCase } from '../ports/get-services.port';
import { ITenantContextPort } from '../../domain/ports/tenant-context.port';
import { CrossTenantAccessException } from '../../domain/exceptions/domain.exception';

export class GetServicesUseCase implements IGetServicesUseCase {
  constructor(
    private readonly serviceRepo: IServiceRepository,
    private readonly tenantPort?: ITenantContextPort
  ) {}

  public async execute(branchId?: string): Promise<ServiceResponseDTO[]> {
    const tenant = this.tenantPort?.getTenant();
    let effectiveBranchId = branchId;

    if (tenant && !tenant.isSuperAdmin) {
      if (branchId && branchId !== tenant.branchId) {
        throw new CrossTenantAccessException(
          `Accès inter-succursales interdit : impossible d'accéder aux prestations de la succursale "${branchId}".`
        );
      }
      effectiveBranchId = tenant.branchId;
    }

    const services = await this.serviceRepo.findAll(effectiveBranchId);

    return services.map((svc) => ({
      id: svc.id,
      branchId: svc.branchId,
      nameFr: svc.nameFr,
      nameAr: svc.nameAr,
      category: svc.category,
      durationMinutes: svc.durationMinutes,
      bufferMinutes: svc.bufferMinutes,
      priceMad: svc.price.toMadString(),
      depositRequired: svc.depositRequired,
    }));
  }
}
