import { eq, SQL } from '@salonops/database';
import { TenantContext } from '../../domain/ports/tenant-context.port';
import { CrossTenantAccessException } from '../../domain/exceptions/domain.exception';

/**
 * Validates and resolves the effective branch ID under multi-branch tenant isolation rules.
 * Guards against cross-tenant queries between salon branches (Casablanca, Rabat, Marrakech, etc.).
 *
 * @param requestedBranchId - The branch ID requested by caller or filter
 * @param tenant - The active TenantContext (from token, header, or ambient store)
 * @returns The authorized branchId to filter by, or undefined if super-admin requested global access
 * @throws CrossTenantAccessException if a non-super-admin tries to query or mutate a different branch
 */
export function resolveTenantBranchScope(
  requestedBranchId?: string,
  tenant?: TenantContext
): string | undefined {
  if (!tenant) {
    // If no tenant context is provided (e.g., internal un-scoped system operation),
    // allow requestedBranchId as-is.
    return requestedBranchId;
  }

  // 1. Super-admin global privileges
  if (tenant.isSuperAdmin) {
    return requestedBranchId; // Can query specific branch or omit for global across all branches
  }

  // 2. Strict tenant isolation for salon floor staff & branch managers
  if (requestedBranchId && requestedBranchId !== tenant.branchId) {
    throw new CrossTenantAccessException(
      `Accès inter-succursales interdit : tentative d'accès à la succursale "${requestedBranchId}" depuis la succursale autorisée "${tenant.branchId}".`
    );
  }

  // Always scope down to the tenant's authorized branch
  return tenant.branchId;
}

/**
 * Builds a Drizzle SQL condition applying multi-branch isolation to repository queries.
 */
export function withTenantBranchCondition(
  branchColumn: any,
  requestedBranchId?: string,
  tenant?: TenantContext
): SQL | undefined {
  const effectiveBranchId = resolveTenantBranchScope(requestedBranchId, tenant);
  if (!effectiveBranchId) {
    return undefined; // Global super-admin query
  }
  return eq(branchColumn, effectiveBranchId);
}
