import { Stylist } from '../models/stylist.entity';

export interface IStylistRepository {
  findById(id: string): Promise<Stylist | null>;
  findAllActive(branchId?: string): Promise<Stylist[]>;
}
