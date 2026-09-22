import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Helmet Content Security Policy (CSP) Relaxation Adapter for Scalar UI
 * Allows inline scripts, CDNs, custom fonts, and blob/data URIs required by `@scalar/express-api-reference`
 */
export const docsCspMiddleware: RequestHandler = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://scalar.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com",
      "font-src 'self' https://fonts.gstatic.com data: https://cdn.jsdelivr.net",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https: data:",
    ].join('; ')
  );
  next();
};

/**
 * Helper function checking if a request path belongs to documentation endpoints
 */
export function isDocsRequest(path: string): boolean {
  return (
    path === '/reference' ||
    path.startsWith('/reference/') ||
    path === '/docs' ||
    path.startsWith('/docs/') ||
    path === '/api/v1/openapi.json'
  );
}
