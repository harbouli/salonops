import { ClientResponseDTO } from '../dtos';

export interface ISearchClientsUseCase {
  execute(query: string, branchId?: string): Promise<ClientResponseDTO[]>;
}
