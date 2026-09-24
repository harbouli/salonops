export interface TenantContext {
  branchId: string;
  isSuperAdmin?: boolean;
  userId?: string;
  role?: string;
}

export interface ITenantContextPort {
  /**
   * Retrieves the current active tenant context for the executing asynchronous flow.
   */
  getTenant(): TenantContext | undefined;

  /**
   * Executes a given operation within the scope of an active tenant context.
   */
  runWithTenant<T>(tenant: TenantContext, fn: () => T | Promise<T>): Promise<T>;
}
