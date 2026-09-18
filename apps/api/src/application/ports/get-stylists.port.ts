import { StylistResponseDTO } from '../dtos';

export interface IGetStylistsUseCase {
  execute(branchId?: string): Promise<StylistResponseDTO[]>;
}
