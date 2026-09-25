import { Service } from '../models/service.entity';

export interface IServiceRepository {
  findById(id: string): Promise<Service | null>;
  findAll(branchId?: string): Promise<Service[]>;
}
