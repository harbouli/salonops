import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { UserRole } from '@salonops/shared-types';
import { createAuthMiddleware, AuthenticatedRequest } from '../../src/presentation/middleware/auth.middleware';
import { requireRole, requireOwnerOrManager } from '../../src/presentation/middleware/rbac.middleware';
import { ITokenServicePort, AuthTokenPayload } from '../../src/domain/ports/token-service.port';

describe('Auth & Granular RBAC Guard Middleware', () => {
  const mockTokenService: ITokenServicePort = {
    sign: async () => 'mock-jwt-token',
    verify: async (token: string) => {
      if (token === 'valid-owner-token') {
        return {
          userId: 'user-owner-1',
          phone: '0661111111',
          role: UserRole.OWNER,
          branchId: 'branch-1',
        };
      }
      if (token === 'valid-stylist-token') {
        return {
          userId: 'user-stylist-1',
          phone: '0662222222',
          role: UserRole.STYLIST,
          branchId: 'branch-1',
        };
      }
      if (token === 'valid-receptionist-token') {
        return {
          userId: 'user-receptionist-1',
          phone: '0663333333',
          role: UserRole.RECEPTIONIST,
          branchId: 'branch-1',
        };
      }
      throw new Error('Token signature invalid');
    },
  };

  const authMiddleware = createAuthMiddleware(mockTokenService);

  it('authMiddleware: should attach req.user when valid Bearer token is provided', async () => {
    const req = {
      headers: { authorization: 'Bearer valid-owner-token' },
    } as AuthenticatedRequest;

    let nextCalled = false;
    const res = {} as any;

    await authMiddleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.ok(req.user);
    assert.equal(req.user.id, 'user-owner-1');
    assert.equal(req.user.role, UserRole.OWNER);
  });

  it('authMiddleware: should return 401 when Authorization header is missing', async () => {
    const req = { headers: {} } as AuthenticatedRequest;
    let statusCode = 0;
    let responseBody: any = null;

    const res = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (body: any) => {
            responseBody = body;
          },
        };
      },
    } as any;

    await authMiddleware(req, res, () => {});

    assert.equal(statusCode, 401);
    assert.equal(responseBody.error, 'Non authentifié. Token Bearer requis.');
  });

  it('authMiddleware: should return 401 when token verification fails', async () => {
    const req = {
      headers: { authorization: 'Bearer invalid-token-xxx' },
    } as AuthenticatedRequest;
    let statusCode = 0;

    const res = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: () => {},
        };
      },
    } as any;

    await authMiddleware(req, res, () => {});

    assert.equal(statusCode, 401);
  });

  it('rbacMiddleware: requireOwnerOrManager should allow OWNER role', () => {
    const req = {
      user: {
        userId: 'owner-1',
        id: 'owner-1',
        phone: '0661111111',
        role: UserRole.OWNER,
        branchId: 'branch-1',
      },
    } as AuthenticatedRequest;

    let nextCalled = false;
    const res = {} as any;

    requireOwnerOrManager(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
  });

  it('rbacMiddleware: requireOwnerOrManager should block STYLIST floor staff (403)', () => {
    const req = {
      user: {
        userId: 'stylist-1',
        id: 'stylist-1',
        phone: '0662222222',
        role: UserRole.STYLIST,
        branchId: 'branch-1',
      },
    } as AuthenticatedRequest;

    let statusCode = 0;
    let responseBody: any = null;
    let nextCalled = false;

    const res = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (body: any) => {
            responseBody = body;
          },
        };
      },
    } as any;

    requireOwnerOrManager(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(statusCode, 403);
    assert.equal(responseBody.error, 'Accès interdit. Vos autorisations sont insuffisantes pour cette action.');
  });

  it('rbacMiddleware: requireOwnerOrManager should block RECEPTIONIST floor staff (403)', () => {
    const req = {
      user: {
        userId: 'receptionist-1',
        id: 'receptionist-1',
        phone: '0663333333',
        role: UserRole.RECEPTIONIST,
        branchId: 'branch-1',
      },
    } as AuthenticatedRequest;

    let statusCode = 0;
    let nextCalled = false;

    const res = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: () => {},
        };
      },
    } as any;

    requireOwnerOrManager(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(statusCode, 403);
  });
});
