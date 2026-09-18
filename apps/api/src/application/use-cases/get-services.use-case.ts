import { ServiceResponseDTO } from '../dtos';
import { IServiceRepository } from '../../domain/ports/service-repository.port';
import { IGetServicesUseCase } from '../ports/get-services.port';

export class GetServicesUseCase implements IGetServicesUseCase {
  constructor(private readonly serviceRepo: IServiceRepository) {}

  public async execute(branchId?: string): Promise<ServiceResponseDTO[]> {
    const services = await this.serviceRepo.findAll(branchId);

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
