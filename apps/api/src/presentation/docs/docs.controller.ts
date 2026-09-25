import { Request, Response, NextFunction, RequestHandler } from 'express';
import { apiReference } from '@scalar/express-api-reference';
import { buildOpenApiDocument } from './openapi.registry';

export class DocsController {
  private openApiSpec: ReturnType<typeof buildOpenApiDocument> | null = null;

  public getOpenApiSpecJson = (): ReturnType<typeof buildOpenApiDocument> => {
    if (!this.openApiSpec) {
      this.openApiSpec = buildOpenApiDocument();
    }
    return this.openApiSpec;
  };

  /**
   * GET /api/v1/openapi.json
   * Serves valid OpenAPI 3.1 JSON specification
   */
  public getOpenApiJson = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const spec = this.getOpenApiSpecJson();
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(spec);
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /reference
   * Renders dark-themed interactive Scalar UI reference
   */
  public renderReference: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const spec = this.getOpenApiSpecJson();
      const referenceMiddleware = apiReference({
        spec: {
          content: spec,
        },
        theme: 'purple',
        pageTitle: 'SalonOps Morocco 🇲🇦 API Reference',
        customCss: `
          .dark-mode {
            --scalar-color-1: #F4F4F5;
            --scalar-color-2: #A1A1AA;
            --scalar-color-3: #71717A;
            --scalar-color-accent: #D4AF37;
            --scalar-background-1: #121214;
            --scalar-background-2: #1A1A1E;
            --scalar-background-3: #222228;
          }
        `,
      });

      referenceMiddleware(req as any, res as any, next as any);
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /docs
   * Permanent 301 redirect to /reference
   */
  public redirectToReference = (_req: Request, res: Response): void => {
    res.redirect(301, '/reference');
  };
}
