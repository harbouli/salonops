import { ServiceResponseDTO } from '../dtos';

export interface IGetServicesUseCase {
  execute(branchId?: string): Promise<ServiceResponseDTO[]>;
}
