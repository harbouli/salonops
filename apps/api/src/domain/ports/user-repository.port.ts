import { User } from '../models/user.entity';

export interface IUserRepository {
  findByPhone(phone: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}
