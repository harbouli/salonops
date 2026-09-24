import { Client } from '../models/client.entity';

export interface IClientRepository {
  findById(id: string): Promise<Client | null>;
  findByPhone(phone: string): Promise<Client | null>;
  search(query: string, branchId?: string): Promise<Client[]>;
  save(client: Client): Promise<Client>;
}
