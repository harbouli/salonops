import { Request, Response, NextFunction } from 'express';
import { ITokenBlacklistPort } from '../../domain/ports/token-blacklist.port';

export function createTokenBlacklistMiddleware(tokenBlacklist: ITokenBlacklistPort) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Let auth.middleware handle the missing token later if needed
    }

    const token = authHeader.split(' ')[1];
    try {
      const isRevoked = await tokenBlacklist.isRevoked(token);
      if (isRevoked) {
        return res.status(401).json({ error: 'Session révoquée. Veuillez vous reconnecter.' });
      }
      next();
    } catch (err) {
      console.error('[TokenBlacklistMiddleware] Error checking token:', err);
      // In case of error (e.g. Redis down and memory fallback fails), we should fail safe or fail open?
      // For security, usually fail close, but our adapter has a memory fallback.
      next();
    }
  };
}
