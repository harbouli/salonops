import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveTenantBranchScope,
  withTenantBranchCondition,
} from '../../src/infrastructure/persistence/tenant-scoped-query.decorator';
import { CrossTenantAccessException } from '../../src/domain/exceptions/domain.exception';

describe('Database Layer Tenant-Scoped Query Decorator', () => {
  const casaBranch = 'branch-casablanca-uuid';
  const rabatBranch = 'branch-rabat-uuid';
  const marrakechBranch = 'branch-marrakech-uuid';

  it('should guard against cross-tenant queries: Casablanca staff requesting Rabat throws CrossTenantAccessException', () => {
    assert.throws(
      () => {
        resolveTenantBranchScope(rabatBranch, {
          branchId: casaBranch,
          isSuperAdmin: false,
        });
      },
      CrossTenantAccessException
    );
  });

  it('should guard against cross-tenant queries: Casablanca staff requesting Marrakech throws CrossTenantAccessException', () => {
    assert.throws(
      () => {
        resolveTenantBranchScope(marrakechBranch, {
          branchId: casaBranch,
          isSuperAdmin: false,
        });
      },
      CrossTenantAccessException
    );
  });

  it('should resolve to authorized branch when matching branch is requested', () => {
    const effective = resolveTenantBranchScope(casaBranch, {
      branchId: casaBranch,
      isSuperAdmin: false,
    });
    assert.equal(effective, casaBranch);
  });

  it('should automatically scope down to authorized branch when requested branch is omitted', () => {
    const effective = resolveTenantBranchScope(undefined, {
      branchId: casaBranch,
      isSuperAdmin: false,
    });
    assert.equal(effective, casaBranch);
  });

  it('should allow Super-Admin to query Casablanca, Rabat, or Marrakech without restriction', () => {
    const casa = resolveTenantBranchScope(casaBranch, {
      branchId: casaBranch,
      isSuperAdmin: true,
    });
    const rabat = resolveTenantBranchScope(rabatBranch, {
      branchId: casaBranch,
      isSuperAdmin: true,
    });
    const marrakech = resolveTenantBranchScope(marrakechBranch, {
      branchId: casaBranch,
      isSuperAdmin: true,
    });

    assert.equal(casa, casaBranch);
    assert.equal(rabat, rabatBranch);
    assert.equal(marrakech, marrakechBranch);
  });

  it('should return undefined (global query condition) when Super-Admin omits branch', () => {
    const globalBranch = resolveTenantBranchScope(undefined, {
      branchId: casaBranch,
      isSuperAdmin: true,
    });
    assert.equal(globalBranch, undefined);

    const condition = withTenantBranchCondition(
      { name: 'branch_id' },
      undefined,
      { branchId: casaBranch, isSuperAdmin: true }
    );
    assert.equal(condition, undefined);
  });
});
