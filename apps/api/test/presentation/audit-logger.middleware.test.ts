import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { createAuditLoggerMiddleware } from '../../src/presentation/middleware/audit-logger.middleware';
import { RecordAuditEventDTO, AuditLogResponseDTO } from '../../src/application/dtos';

describe('auditLoggerMiddleware (Presentation Layer Driving Interceptor)', () => {
  it('should intercept POST /api/v1/checkout and record financial audit log', async () => {
    const recordedEvents: RecordAuditEventDTO[] = [];

    const mockUseCase = {
      execute: async (dto: RecordAuditEventDTO): Promise<AuditLogResponseDTO> => {
        recordedEvents.push(dto);
        return {
          id: 'audit-generated-id',
          actorId: dto.actorId ?? null,
          branchId: dto.branchId ?? null,
          actionType: dto.actionType,
          entityType: dto.entityType,
          entityId: dto.entityId,
          changeDiff: dto.changeDiff,
          createdAt: new Date().toISOString(),
        };
      },
    };

    const middleware = createAuditLoggerMiddleware(mockUseCase);

    const req: any = {
      originalUrl: '/api/v1/checkout',
      method: 'POST',
      user: { userId: 'user-receptionist-1' },
      tenant: { branchId: 'branch-casablanca' },
      body: {
        appointmentId: 'app-555',
        manualDiscountMad: 20.0,
      },
    };

    const res: any = {
      statusCode: 200,
      json(data: any) {
        return res;
      },
    };

    await new Promise<void>((resolve) => {
      middleware(req, res, () => {
        res.json({ id: 'tx-777', status: 'COMPLETED' });

        setTimeout(() => {
          assert.equal(recordedEvents.length, 1);
          const event = recordedEvents[0];
          assert.equal(event.actorId, 'user-receptionist-1');
          assert.equal(event.branchId, 'branch-casablanca');
          assert.equal(event.actionType, 'MANUAL_DISCOUNT');
          assert.equal(event.entityType, 'TRANSACTION');
          assert.equal(event.entityId, 'tx-777');
          resolve();
        }, 30);
      });
    });
  });

  it('should intercept PATCH /api/v1/appointments/:id and record appointment cancellation with actor identity', async () => {
    const recordedEvents: RecordAuditEventDTO[] = [];

    const mockUseCase = {
      execute: async (dto: RecordAuditEventDTO): Promise<AuditLogResponseDTO> => {
        recordedEvents.push(dto);
        return {
          id: 'audit-cancellation-id',
          actorId: dto.actorId ?? null,
          branchId: dto.branchId ?? null,
          actionType: dto.actionType,
          entityType: dto.entityType,
          entityId: dto.entityId,
          changeDiff: dto.changeDiff,
          createdAt: new Date().toISOString(),
        };
      },
    };

    const middleware = createAuditLoggerMiddleware(mockUseCase);

    const req: any = {
      originalUrl: '/api/v1/appointments/app-888',
      method: 'PATCH',
      params: { id: 'app-888' },
      user: { userId: 'user-manager-2' },
      tenant: { branchId: 'branch-rabat' },
      body: {
        status: 'CANCELLED',
        reason: 'Client late cancellation',
      },
    };

    const res: any = {
      statusCode: 200,
      json(data: any) {
        return res;
      },
    };

    await new Promise<void>((resolve) => {
      middleware(req, res, () => {
        res.json({ id: 'app-888', status: 'CANCELLED' });

        setTimeout(() => {
          assert.equal(recordedEvents.length, 1);
          const event = recordedEvents[0];
          assert.equal(event.actorId, 'user-manager-2');
          assert.equal(event.branchId, 'branch-rabat');
          assert.equal(event.actionType, 'APPOINTMENT_CANCELLED');
          assert.equal(event.entityType, 'APPOINTMENT');
          assert.equal(event.entityId, 'app-888');
          assert.equal(event.changeDiff.cancellationReason, 'Client late cancellation');
          resolve();
        }, 30);
      });
    });
  });
});
