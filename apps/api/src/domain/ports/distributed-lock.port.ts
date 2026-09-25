export interface ILock {
  release(): Promise<void>;
}

export interface IDistributedLockPort {
  acquireLock(resourceKey: string, ttlMs?: number): Promise<ILock>;
}
