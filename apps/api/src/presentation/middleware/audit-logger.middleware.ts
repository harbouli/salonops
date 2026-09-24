import { Request, Response, NextFunction } from 'express';
import { IRecordAuditEventUseCase } from '../../application/ports/record-audit-event.port';

export function createAuditLoggerMiddleware(recordAuditEventUseCase: IRecordAuditEventUseCase) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any): Response {
      const result = originalJson(body);

      // Only record audit entries for successful operations (2xx HTTP status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        process.nextTick(async () => {
          try {
            const actorId = (req as any).user?.userId ?? (req as any).user?.id ?? null;
            const branchId = (req as any).tenant?.branchId ?? req.body?.branchId ?? null;
            const path = req.originalUrl || req.url;

            // 1. Intercept Checkout Processed & Manual Discounts
            if (path.includes('/api/v1/checkout')) {
              const entityId = String(body?.id ?? req.body?.appointmentId ?? 'checkout-' + Date.now());
              const hasManualDiscount = Boolean(
                req.body?.manualDiscountMad || req.body?.discountMad || req.body?.overrideReason
              );

              await recordAuditEventUseCase.execute({
                actorId,
                branchId,
                actionType: hasManualDiscount ? 'MANUAL_DISCOUNT' : 'CHECKOUT_PROCESSED',
                entityType: 'TRANSACTION',
                entityId,
                changeDiff: {
                  request: req.body,
                  response: body,
                  hasManualDiscount,
                },
              });
            }
            // 2. Intercept Appointment Cancellations & Price Overrides
            else if (
              path.includes('/api/v1/appointments') &&
              (req.method === 'PATCH' || req.method === 'POST' || req.method === 'PUT')
            ) {
              const status = req.body?.status;
              const isCancellation = status === 'CANCELLED' || path.includes('/cancel');
              const isPriceOverride =
                req.body?.priceMad !== undefined || req.body?.overridePrice !== undefined;

              if (isCancellation || isPriceOverride) {
                let actionType = 'APPOINTMENT_MODIFIED';
                if (isCancellation) {
                  actionType = 'APPOINTMENT_CANCELLED';
                } else if (isPriceOverride) {
                  actionType = 'PRICE_OVERRIDE';
                }

                const entityId = String(
                  req.params?.id ?? body?.id ?? req.body?.appointmentId ?? 'appointment-' + Date.now()
                );

                await recordAuditEventUseCase.execute({
                  actorId,
                  branchId,
                  actionType,
                  entityType: 'APPOINTMENT',
                  entityId,
                  changeDiff: {
                    request: req.body,
                    response: body,
                    status,
                    cancellationReason: req.body?.reason ?? req.body?.cancellationReason ?? null,
                  },
                });
              }
            }
          } catch (err) {
            console.error('[AuditLoggerMiddleware] Failed to record financial audit log:', err);
          }
        });
      }

      return result;
    };

    next();
  };
}
