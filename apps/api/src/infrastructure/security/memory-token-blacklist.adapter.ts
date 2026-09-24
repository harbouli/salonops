import { ITokenBlacklistPort } from '../../domain/ports/token-blacklist.port';

export class MemoryTokenBlacklistAdapter implements ITokenBlacklistPort {
  private readonly blacklist: Map<string, NodeJS.Timeout> = new Map();

  public async revokeToken(token: string, ttlSeconds: number): Promise<void> {
    if (this.blacklist.has(token)) {
      return;
    }

    // Schedule cleanup after TTL expires
    const timeout = setTimeout(() => {
      this.blacklist.delete(token);
    }, ttlSeconds * 1000);
    
    // Prevent the timeout from blocking Node.js process exit
    timeout.unref();

    this.blacklist.set(token, timeout);
  }

  public async isRevoked(token: string): Promise<boolean> {
    return this.blacklist.has(token);
  }
}
