import { AsyncLocalStorage } from 'node:async_hooks';
import { ITenantContextPort, TenantContext } from '../../domain/ports/tenant-context.port';

export class AsyncLocalStorageTenantContextAdapter implements ITenantContextPort {
  private readonly storage = new AsyncLocalStorage<TenantContext>();

  public getTenant(): TenantContext | undefined {
    return this.storage.getStore();
  }

  public runWithTenant<T>(tenant: TenantContext, fn: () => T | Promise<T>): Promise<T> {
    return this.storage.run(tenant, () => Promise.resolve(fn()));
  }
}
