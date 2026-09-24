import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@salonops/shared-types';
import { ITokenServicePort, AuthTokenPayload } from '../../domain/ports/token-service.port';
import { JwtTokenAdapter } from '../../infrastructure/security/jwt-token.adapter';

export interface AuthUser extends AuthTokenPayload {
  id: string; // Alias for userId if needed
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const defaultTokenService: ITokenServicePort = new JwtTokenAdapter();

export function createAuthMiddleware(tokenService: ITokenServicePort = defaultTokenService) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Non authentifié. Token Bearer requis.' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = await tokenService.verify(token);
      req.user = {
        ...payload,
        id: payload.userId,
      };
      next();
    } catch {
      return res.status(401).json({ error: 'Token invalide ou expiré.' });
    }
  };
}

export function createOptionalAuthMiddleware(tokenService: ITokenServicePort = defaultTokenService) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = await tokenService.verify(token);
        req.user = {
          ...payload,
          id: payload.userId,
        };
      } catch {
        // Optional auth: continue without user if token is invalid or expired
      }
    }
    next();
  };
}

export const authMiddleware = createAuthMiddleware();
export const optionalAuthMiddleware = createOptionalAuthMiddleware();
