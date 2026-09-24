import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { createRateLimiterMiddleware } from '../../src/presentation/middleware/rate-limiter.middleware';
import { MemoryRateLimiterAdapter } from '../../src/infrastructure/security/memory-rate-limiter.adapter';

describe('RateLimiterMiddleware', () => {
  it('should allow requests within limit and populate RateLimit-* headers', async () => {
    const limiter = new MemoryRateLimiterAdapter();
    const middleware = createRateLimiterMiddleware(limiter, {
      tierName: 'test',
      limit: 3,
      windowMs: 60000,
    });

    const headers: Record<string, string> = {};
    const req = {
      path: '/api/v1/resource',
      ip: '192.168.1.10',
      socket: { remoteAddress: '192.168.1.10' },
    } as any;

    let nextCalled = false;
    const res = {
      setHeader: (name: string, value: string) => {
        headers[name] = value;
      },
      status: () => res,
      json: () => res,
    } as any;

    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(headers['RateLimit-Limit'], '3');
    assert.equal(headers['RateLimit-Remaining'], '2');
    assert.ok(headers['RateLimit-Reset'] !== undefined);
  });

  it('should return HTTP 429 Too Many Requests when limit is exceeded', async () => {
    const limiter = new MemoryRateLimiterAdapter();
    const middleware = createRateLimiterMiddleware(limiter, {
      tierName: 'auth',
      limit: 2,
      windowMs: 60000,
      message: 'Trop de tentatives',
    });

    const req = {
      path: '/api/v1/auth/login',
      ip: '10.0.0.1',
      socket: { remoteAddress: '10.0.0.1' },
    } as any;

    let statusCode = 200;
    let jsonBody: any = null;
    let nextCount = 0;
    const headers: Record<string, string> = {};

    const res = {
      setHeader: (name: string, value: string) => {
        headers[name] = value;
      },
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (body: any) => {
        jsonBody = body;
        return res;
      },
    } as any;

    // First request - allowed
    await middleware(req, res, () => { nextCount++; });
    // Second request - allowed
    await middleware(req, res, () => { nextCount++; });
    // Third request - blocked
    await middleware(req, res, () => { nextCount++; });

    assert.equal(nextCount, 2);
    assert.equal(statusCode, 429);
    assert.equal(jsonBody?.error, 'Trop de tentatives');
    assert.ok(jsonBody?.retryAfter !== undefined && jsonBody.retryAfter > 0);
    assert.ok(headers['Retry-After'] !== undefined);
  });

  it('should skip documentation and scalar UI requests', async () => {
    const limiter = new MemoryRateLimiterAdapter();
    const middleware = createRateLimiterMiddleware(limiter, {
      tierName: 'staff',
      limit: 1,
      windowMs: 60000,
    });

    const docReq = {
      path: '/api/v1/openapi.json',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    } as any;

    let nextCalled = false;
    const res = {
      setHeader: () => {},
      status: () => res,
      json: () => res,
    } as any;

    await middleware(docReq, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true);

    // Second call should also be skipped without incrementing counter
    nextCalled = false;
    await middleware(docReq, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
  });
});

