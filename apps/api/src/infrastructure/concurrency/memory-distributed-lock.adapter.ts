import { IDistributedLockPort, ILock } from '../../domain/ports/distributed-lock.port';

export class MemoryDistributedLockAdapter implements IDistributedLockPort {
  private activeLocks = new Set<string>();

  public async acquireLock(resourceKey: string, ttlMs: number = 5000): Promise<ILock> {
    const start = Date.now();
    const waitTimeout = ttlMs;

    // Spin-wait briefly if lock is held
    while (this.activeLocks.has(resourceKey)) {
      if (Date.now() - start > waitTimeout) {
        throw new Error(`Délai d'attente dépassé pour acquérir le verrou: ${resourceKey}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    this.activeLocks.add(resourceKey);

    // Auto-expire lock after ttl
    const timer = setTimeout(() => {
      this.activeLocks.delete(resourceKey);
    }, ttlMs);

    return {
      release: async () => {
        clearTimeout(timer);
        this.activeLocks.delete(resourceKey);
      },
    };
  }
}
