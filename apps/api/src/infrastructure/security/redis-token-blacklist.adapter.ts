import Redis from 'ioredis';
import { ITokenBlacklistPort } from '../../domain/ports/token-blacklist.port';
import { MemoryTokenBlacklistAdapter } from './memory-token-blacklist.adapter';

export class RedisTokenBlacklistAdapter implements ITokenBlacklistPort {
  private redisClient?: Redis;
  private isRedisConnected = false;
  private readonly fallbackAdapter = new MemoryTokenBlacklistAdapter();
  private readonly KEY_PREFIX = 'bl_token:';

  constructor(redisUrl?: string) {
    const url = redisUrl || process.env.REDIS_URL;
    if (url) {
      try {
        this.redisClient = new Redis(url, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          connectTimeout: 2000,
        });

        this.redisClient.on('connect', () => {
          this.isRedisConnected = true;
        });

        this.redisClient.on('error', (_err) => {
          this.isRedisConnected = false;
        });

        this.redisClient.connect().then(() => {
          this.isRedisConnected = true;
        }).catch(() => {
          this.isRedisConnected = false;
        });
      } catch {
        this.isRedisConnected = false;
      }
    }
  }

  public async revokeToken(token: string, ttlSeconds: number): Promise<void> {
    if (ttlSeconds <= 0) return;

    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.setex(`${this.KEY_PREFIX}${token}`, ttlSeconds, 'revoked');
        return;
      } catch (err: any) {
        console.warn(`[RedisTokenBlacklist] Redis failed, falling back to in-memory: ${err.message}`);
      }
    }

    return this.fallbackAdapter.revokeToken(token, ttlSeconds);
  }

  public async isRevoked(token: string): Promise<boolean> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const result = await this.redisClient.get(`${this.KEY_PREFIX}${token}`);
        return result !== null;
      } catch (err: any) {
        console.warn(`[RedisTokenBlacklist] Redis failed, falling back to in-memory: ${err.message}`);
      }
    }

    return this.fallbackAdapter.isRevoked(token);
  }
}
