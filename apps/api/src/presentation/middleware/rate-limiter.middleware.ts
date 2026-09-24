import { Request, Response, NextFunction, RequestHandler } from 'express';
import { IRateLimiterPort } from '../../domain/ports/rate-limiter.port';
import { isDocsRequest } from '../docs/docs.middleware';

export interface RateLimiterOptions {
  tierName: string;
  limit: number;
  windowMs: number;
  skip?: (req: Request) => boolean;
  keyGenerator?: (req: Request) => string;
  message?: string;
}

export function defaultKeyGenerator(req: Request, tierName: string): string {
  // Use user id if authenticated, else IP
  const user = (req as any).user;
  const identifier = user?.id || user?.userId || req.ip || req.socket.remoteAddress || 'unknown-client';
  return `${tierName}:${identifier}`;
}

export function createRateLimiterMiddleware(
  rateLimiter: IRateLimiterPort,
  options: RateLimiterOptions
): RequestHandler {
  const {
    tierName,
    limit,
    windowMs,
    skip,
    keyGenerator = (req) => defaultKeyGenerator(req, tierName),
    message = 'Trop de requêtes, veuillez réessayer plus tard.',
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip docs or custom skip condition
    if (isDocsRequest(req.path) || (skip && skip(req))) {
      return next();
    }

    try {
      const key = keyGenerator(req);
      const result = await rateLimiter.consume(key, limit, windowMs);

      // Set standard RFC / draft rate limit headers
      res.setHeader('RateLimit-Limit', limit.toString());
      res.setHeader('RateLimit-Remaining', result.remaining.toString());
      res.setHeader('RateLimit-Reset', Math.ceil(result.resetTimeMs / 1000).toString());

      if (!result.allowed) {
        const retryAfter = result.retryAfterSeconds ?? Math.max(1, Math.ceil((result.resetTimeMs - Date.now()) / 1000));
        res.setHeader('Retry-After', retryAfter.toString());
        res.status(429).json({
          error: message,
          retryAfter,
        });
        return;
      }

      next();
    } catch (err) {
      // Fail-open strategy if unexpected error occurs to avoid bringing down entire API
      console.error(`[RateLimiterMiddleware:${tierName}] Unexpected error:`, err);
      next();
    }
  };
}

