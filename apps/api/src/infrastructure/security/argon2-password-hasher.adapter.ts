import argon2 from 'argon2';
import { IPasswordHasherPort } from '../../domain/ports/password-hasher.port';

export class Argon2PasswordHasherAdapter implements IPasswordHasherPort {
  public async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
    });
  }

  public async verify(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }
}
