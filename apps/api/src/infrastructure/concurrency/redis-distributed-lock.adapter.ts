import Redis from 'ioredis';
import Redlock from 'redlock';
import { IDistributedLockPort, ILock } from '../../domain/ports/distributed-lock.port';
import { MemoryDistributedLockAdapter } from './memory-distributed-lock.adapter';

export class RedisDistributedLockAdapter implements IDistributedLockPort {
  private redlock?: Redlock;
  private fallbackAdapter = new MemoryDistributedLockAdapter();
  private isRedisConnected = false;

  constructor(redisUrl?: string) {
    const url = redisUrl || process.env.REDIS_URL;
    if (url) {
      try {
        const client = new Redis(url, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          connectTimeout: 2000,
        });

        client.on('connect', () => {
          this.isRedisConnected = true;
        });

        client.on('error', (_err) => {
          this.isRedisConnected = false;
        });

        client.connect().then(() => {
          this.isRedisConnected = true;
          this.redlock = new Redlock([client], {
            driftFactor: 0.01,
            retryCount: 3,
            retryDelay: 200,
            retryJitter: 100,
          });
        }).catch(() => {
          this.isRedisConnected = false;
        });
      } catch {
        this.isRedisConnected = false;
      }
    }
  }

  public async acquireLock(resourceKey: string, ttlMs: number = 5000): Promise<ILock> {
    if (this.isRedisConnected && this.redlock) {
      try {
        const lock = await this.redlock.acquire([resourceKey], ttlMs);
        return {
          release: async () => {
            await lock.release();
          },
        };
      } catch (err: any) {
        // Fall back to local memory lock if Redis error
        console.warn(`[DistributedLock] Redlock failed, falling back to in-memory lock: ${err.message}`);
        return this.fallbackAdapter.acquireLock(resourceKey, ttlMs);
      }
    }

    return this.fallbackAdapter.acquireLock(resourceKey, ttlMs);
  }
}
