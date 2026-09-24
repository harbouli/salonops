import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { RecordAuditEventUseCase } from '../../src/application/use-cases/record-audit-event.use-case';
import { IAuditLogRepository } from '../../src/domain/ports/audit-log-repository.port';
import { AuditLog } from '../../src/domain/models/audit-log.entity';

class MockAuditLogRepository implements IAuditLogRepository {
  public logs: AuditLog[] = [];

  async append(auditLog: AuditLog): Promise<AuditLog> {
    this.logs.push(auditLog);
    return auditLog;
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.logs.filter((l) => l.entityType === entityType && l.entityId === entityId);
  }

  async findAll(branchId?: string): Promise<AuditLog[]> {
    if (!branchId) return this.logs;
    return this.logs.filter((l) => l.branchId === branchId);
  }
}

describe('RecordAuditEventUseCase (Application Layer Financial Audit Logging)', () => {
  it('should successfully record an append-only audit log entry', async () => {
    const mockRepo = new MockAuditLogRepository();
    const useCase = new RecordAuditEventUseCase(mockRepo);

    const result = await useCase.execute({
      actorId: 'user-manager-1',
      branchId: 'branch-casablanca',
      actionType: 'MANUAL_DISCOUNT',
      entityType: 'TRANSACTION',
      entityId: 'tx-100',
      changeDiff: { discountAmountMad: 50.0, reason: 'Friend & Family' },
    });

    assert.equal(mockRepo.logs.length, 1);
    assert.equal(result.actorId, 'user-manager-1');
    assert.equal(result.branchId, 'branch-casablanca');
    assert.equal(result.actionType, 'MANUAL_DISCOUNT');
    assert.equal(result.entityType, 'TRANSACTION');
    assert.equal(result.entityId, 'tx-100');
    assert.equal(result.changeDiff.discountAmountMad, 50.0);
    assert.ok(result.id);
    assert.ok(result.createdAt);
  });

  it('should auto-populate actor and branch identity from ambient tenant context if omitted', async () => {
    const mockRepo = new MockAuditLogRepository();
    const mockTenantPort: any = {
      getTenant: () => ({
        userId: 'ambient-user-id',
        branchId: 'ambient-branch-id',
        isSuperAdmin: false,
      }),
    };

    const useCase = new RecordAuditEventUseCase(mockRepo, mockTenantPort);

    const result = await useCase.execute({
      actionType: 'APPOINTMENT_CANCELLED',
      entityType: 'APPOINTMENT',
      entityId: 'app-999',
      changeDiff: { reason: 'Client No-Show' },
    });

    assert.equal(result.actorId, 'ambient-user-id');
    assert.equal(result.branchId, 'ambient-branch-id');
    assert.equal(result.actionType, 'APPOINTMENT_CANCELLED');
    assert.equal(mockRepo.logs[0].actorId, 'ambient-user-id');
  });
});
