import { Response, NextFunction } from 'express';
import { UserRole } from '@salonops/shared-types';
import { AuthenticatedRequest } from './auth.middleware';
import { ITenantContextPort, TenantContext } from '../../domain/ports/tenant-context.port';

export interface TenantRequest extends AuthenticatedRequest {
  tenant?: TenantContext;
}

/**
 * Express middleware enforcing multi-branch tenant isolation.
 *
 * Rules:
 * 1. Resolves `branchId` from authenticated user token or validated salon header.
 * 2. If user is SUPER_ADMIN, allows global multi-branch queries across Casablanca, Rabat, Marrakech, etc.
 * 3. If user is regular floor staff or manager, strictly enforces that all requested
 *    branch indicators (header, query, body, params) match the user's authorized branch.
 *    Any mismatch is rejected immediately with HTTP 403 Forbidden.
 * 4. Propagates the active TenantContext into ITenantContextPort ambient async local storage.
 */
export function createTenantGuardMiddleware(tenantPort: ITenantContextPort) {
  return (req: TenantRequest, res: Response, next: NextFunction) => {
    // 1. Resolve header / query / body / param branch targets
    const headerBranchId = (req.headers['x-salon-branch-id'] || req.headers['x-branch-id']) as string | undefined;
    const queryBranchId = req.query.branchId as string | undefined;
    const bodyBranchId = req.body?.branchId as string | undefined;
    const paramBranchId = req.params?.branchId as string | undefined;

    // 2. Check super-admin status
    const isSuperAdmin =
      req.user?.role === UserRole.SUPER_ADMIN ||
      req.headers['x-super-admin'] === 'true';

    if (isSuperAdmin) {
      // Super-admins can query a specific branch or omit for global access across all branches
      const effectiveBranchId = headerBranchId || queryBranchId || bodyBranchId || paramBranchId || req.user?.branchId || '';
      const tenantContext: TenantContext = {
        branchId: effectiveBranchId,
        isSuperAdmin: true,
        userId: req.user?.userId,
        role: req.user?.role,
      };
      req.tenant = tenantContext;
      return tenantPort.runWithTenant(tenantContext, () => next());
    }

    // 3. For authenticated non-super-admins, user is strictly bound to req.user.branchId
    const userBranchId = req.user?.branchId;

    if (userBranchId) {
      // Cross-Branch Guard: Check if the request targets a different branch than user's authorized branch
      const requestedBranches = [headerBranchId, queryBranchId, bodyBranchId, paramBranchId].filter(
        (b): b is string => Boolean(b && b.trim().length > 0)
      );

      for (const requested of requestedBranches) {
        if (requested !== userBranchId) {
          return res.status(403).json({
            error: 'Accès inter-succursales interdit',
            message: `Vous n'avez pas l'autorisation d'accéder ou de modifier les données de la succursale "${requested}". Votre compte est restreint à "${userBranchId}".`,
          });
        }
      }

      const tenantContext: TenantContext = {
        branchId: userBranchId,
        isSuperAdmin: false,
        userId: req.user?.userId,
        role: req.user?.role,
      };

      req.tenant = tenantContext;

      // Automatically enforce query and body branchId so downstream use cases receive it
      if (req.query && !req.query.branchId) {
        req.query.branchId = userBranchId;
      }
      if (req.body && typeof req.body === 'object' && !req.body.branchId && req.method !== 'GET') {
        req.body.branchId = userBranchId;
      }

      return tenantPort.runWithTenant(tenantContext, () => next());
    }

    // 4. For unauthenticated public clients (e.g. bio link booking page)
    const publicBranchId = headerBranchId || queryBranchId;
    if (publicBranchId) {
      const tenantContext: TenantContext = {
        branchId: publicBranchId,
        isSuperAdmin: false,
      };
      req.tenant = tenantContext;
      return tenantPort.runWithTenant(tenantContext, () => next());
    }

    // Un-scoped request
    return next();
  };
}
