import { ITokenBlacklistPort } from '../../domain/ports/token-blacklist.port';
import { ITokenServicePort } from '../../domain/ports/token-service.port';

import jwt from 'jsonwebtoken';

export class RevokeSessionUseCase {
  constructor(
    private readonly tokenBlacklist: ITokenBlacklistPort
  ) {}

  public async execute(token: string): Promise<void> {
    const payload = jwt.decode(token) as { exp?: number } | null;
    
    if (!payload || !payload.exp) {
      // If we can't determine expiration, fallback to 24h default
      await this.tokenBlacklist.revokeToken(token, 24 * 60 * 60);
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const ttlSeconds = payload.exp - now;

    if (ttlSeconds > 0) {
      await this.tokenBlacklist.revokeToken(token, ttlSeconds);
    }
  }
}
