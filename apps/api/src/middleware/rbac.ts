import { Response, NextFunction } from 'express';
import { UserRole } from '@salonops/shared-types';
import { AuthenticatedRequest } from './auth';

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
