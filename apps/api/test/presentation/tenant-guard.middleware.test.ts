import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { UserRole } from '@salonops/shared-types';
import { createTenantGuardMiddleware, TenantRequest } from '../../src/presentation/middleware/tenant-guard.middleware';
import { AsyncLocalStorageTenantContextAdapter } from '../../src/infrastructure/tenant/async-local-storage-tenant-context.adapter';

describe('TenantGuardMiddleware (Multi-Branch Isolation)', () => {
  const casaBranch = 'branch-casablanca-uuid';
  const rabatBranch = 'branch-rabat-uuid';
  const marrakechBranch = 'branch-marrakech-uuid';

  it('should reject with 403 Forbidden when Casablanca staff attempts to access Rabat via header', async () => {
    const tenantPort = new AsyncLocalStorageTenantContextAdapter();
    const middleware = createTenantGuardMiddleware(tenantPort);

    let statusCalledWith: number | null = null;
    let jsonCalledWith: any = null;
    let nextCalled = false;

    const req: TenantRequest = {
      headers: {
        'x-salon-branch-id': rabatBranch,
      },
      query: {},
      params: {},
      body: {},
      user: {
        userId: 'user-casa-1',
        phone: '0661000001',
        role: UserRole.STYLIST,
        branchId: casaBranch,
        id: 'user-casa-1',
      },
    } as any;

    const res: any = {
      status: (code: number) => {
        statusCalledWith = code;
        return res;
      },
      json: (data: any) => {
        jsonCalledWith = data;
        return res;
      },
    };

    const next = () => {
      nextCalled = true;
    };

    middleware(req, res, next);

    assert.equal(nextCalled, false);
    assert.equal(statusCalledWith, 403);
    assert.equal(jsonCalledWith?.error, 'Accès inter-succursales interdit');
    assert.ok(jsonCalledWith?.message?.includes(rabatBranch));
  });

  it('should reject with 403 Forbidden when Casablanca staff attempts to query Marrakech via query parameter', async () => {
    const tenantPort = new AsyncLocalStorageTenantContextAdapter();
    const middleware = createTenantGuardMiddleware(tenantPort);

    let statusCalledWith: number | null = null;
    let jsonCalledWith: any = null;
    let nextCalled = false;

    const req: TenantRequest = {
      headers: {},
      query: { branchId: marrakechBranch },
      params: {},
      body: {},
      user: {
        userId: 'user-casa-2',
        phone: '0661000002',
        role: UserRole.MANAGER,
        branchId: casaBranch,
        id: 'user-casa-2',
      },
    } as any;

    const res: any = {
      status: (code: number) => {
        statusCalledWith = code;
        return res;
      },
      json: (data: any) => {
        jsonCalledWith = data;
        return res;
      },
    };

    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(statusCalledWith, 403);
    assert.equal(jsonCalledWith?.error, 'Accès inter-succursales interdit');
  });

  it('should reject with 403 Forbidden when Casablanca staff attempts to book appointment in Rabat via body', async () => {
    const tenantPort = new AsyncLocalStorageTenantContextAdapter();
    const middleware = createTenantGuardMiddleware(tenantPort);

    let statusCalledWith: number | null = null;
    let jsonCalledWith: any = null;
    let nextCalled = false;

    const req: TenantRequest = {
      method: 'POST',
      headers: {},
      query: {},
      params: {},
      body: { branchId: rabatBranch, serviceId: 'service-1' },
      user: {
        userId: 'user-casa-3',
        phone: '0661000003',
        role: UserRole.RECEPTIONIST,
        branchId: casaBranch,
        id: 'user-casa-3',
      },
    } as any;

    const res: any = {
      status: (code: number) => {
        statusCalledWith = code;
        return res;
      },
      json: (data: any) => {
        jsonCalledWith = data;
        return res;
      },
    };

    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(statusCalledWith, 403);
    assert.equal(jsonCalledWith?.error, 'Accès inter-succursales interdit');
  });

  it('should allow access and set ambient tenant context when Casablanca staff accesses their own branch', async () => {
    const tenantPort = new AsyncLocalStorageTenantContextAdapter();
    const middleware = createTenantGuardMiddleware(tenantPort);

    let nextCalled = false;
    let contextInsideNext: any = null;

    const req: TenantRequest = {
      headers: {
        'x-salon-branch-id': casaBranch,
      },
      query: {},
      params: {},
      body: {},
      user: {
        userId: 'user-casa-4',
        phone: '0661000004',
        role: UserRole.STYLIST,
        branchId: casaBranch,
        id: 'user-casa-4',
      },
    } as any;

    const res: any = {
      status: () => res,
      json: () => res,
    };

    middleware(req, res, () => {
      nextCalled = true;
      contextInsideNext = tenantPort.getTenant();
    });

    assert.equal(nextCalled, true);
    assert.ok(contextInsideNext);
    assert.equal(contextInsideNext.branchId, casaBranch);
    assert.equal(contextInsideNext.isSuperAdmin, false);
  });

  it('should allow Super-Admin to query Rabat, Marrakech, or global without 403 rejection', async () => {
    const tenantPort = new AsyncLocalStorageTenantContextAdapter();
    const middleware = createTenantGuardMiddleware(tenantPort);

    let nextCalled = false;
    let contextInsideNext: any = null;

    const req: TenantRequest = {
      headers: {
        'x-salon-branch-id': rabatBranch,
      },
      query: {},
      params: {},
      body: {},
      user: {
        userId: 'user-super-admin',
        phone: '0661999999',
        role: UserRole.SUPER_ADMIN,
        branchId: casaBranch, // User created at Casablanca, but super-admin across all branches
        id: 'user-super-admin',
      },
    } as any;

    const res: any = {
      status: () => res,
      json: () => res,
    };

    middleware(req, res, () => {
      nextCalled = true;
      contextInsideNext = tenantPort.getTenant();
    });

    assert.equal(nextCalled, true);
    assert.ok(contextInsideNext);
    assert.equal(contextInsideNext.isSuperAdmin, true);
    assert.equal(contextInsideNext.branchId, rabatBranch);
  });
});
