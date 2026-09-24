import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { AuditLog } from '../../src/domain/models/audit-log.entity';
import { InvalidValueException } from '../../src/domain/exceptions/domain.exception';

describe('AuditLog Domain Entity (Immutable Financial Audit Ledger)', () => {
  it('should instantiate valid immutable AuditLog entity', () => {
    const log = new AuditLog({
      id: 'audit-123',
      actorId: 'user-owner-1',
      branchId: 'branch-casa-1',
      actionType: 'MANUAL_DISCOUNT',
      entityType: 'TRANSACTION',
      entityId: 'trans-456',
      changeDiff: { beforePrice: 500, overridePrice: 400, reason: 'VIP Discount' },
    });

    assert.equal(log.id, 'audit-123');
    assert.equal(log.actorId, 'user-owner-1');
    assert.equal(log.branchId, 'branch-casa-1');
    assert.equal(log.actionType, 'MANUAL_DISCOUNT');
    assert.equal(log.entityType, 'TRANSACTION');
    assert.equal(log.entityId, 'trans-456');
    assert.equal(log.changeDiff.overridePrice, 400);
    assert.ok(log.createdAt instanceof Date);
  });

  it('should enforce immutable changeDiff property via Object.freeze', () => {
    const log = new AuditLog({
      id: 'audit-124',
      actionType: 'PRICE_OVERRIDE',
      entityType: 'APPOINTMENT',
      entityId: 'app-789',
      changeDiff: { originalPrice: 300, newPrice: 250 },
    });

    assert.ok(Object.isFrozen(log.changeDiff));
  });

  it('should reject creation when actionType, entityType or entityId are empty', () => {
    assert.throws(
      () =>
        new AuditLog({
          id: '1',
          actionType: '',
          entityType: 'TRANSACTION',
          entityId: 'tx-1',
          changeDiff: {},
        }),
      InvalidValueException
    );

    assert.throws(
      () =>
        new AuditLog({
          id: '2',
          actionType: 'MANUAL_DISCOUNT',
          entityType: '   ',
          entityId: 'tx-1',
          changeDiff: {},
        }),
      InvalidValueException
    );

    assert.throws(
      () =>
        new AuditLog({
          id: '3',
          actionType: 'MANUAL_DISCOUNT',
          entityType: 'TRANSACTION',
          entityId: '',
          changeDiff: {},
        }),
      InvalidValueException
    );
  });
});
