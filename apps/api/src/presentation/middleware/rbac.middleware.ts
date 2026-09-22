import { Response, NextFunction } from 'express';
import { UserRole } from '@salonops/shared-types';
import { AuthenticatedRequest } from './auth.middleware';

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Accès interdit. Vos autorisations sont insuffisantes pour cette action.',
      });
    }

    next();
  };
}

/**
 * Pre-configured RBAC guard restricting floor staff (STYLIST, RECEPTIONIST)
 * from salon turnover, financial reports, and owner margins.
 * Only OWNER and MANAGER roles are granted access.
 */
export const requireOwnerOrManager = requireRole([UserRole.OWNER, UserRole.MANAGER]);

/**
 * RBAC guard requiring strict OWNER role.
 */
export const requireOwner = requireRole([UserRole.OWNER]);
