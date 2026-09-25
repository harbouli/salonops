import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { createTokenBlacklistMiddleware } from '../../src/presentation/middleware/token-blacklist.middleware';
import { ITokenBlacklistPort } from '../../src/domain/ports/token-blacklist.port';

class MockTokenBlacklistPort implements ITokenBlacklistPort {
  async revokeToken(): Promise<void> {}
  
  async isRevoked(token: string): Promise<boolean> {
    return token === 'revoked_token';
  }
}

describe('TokenBlacklistMiddleware', () => {
  it('should return 401 if token is blacklisted', async () => {
    const middleware = createTokenBlacklistMiddleware(new MockTokenBlacklistPort());
    
    const req = {
      headers: { authorization: 'Bearer revoked_token' }
    } as any;
    
    let statusCode = 0;
    let jsonResponse = null;
    let nextCalled = false;
    
    const res = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        jsonResponse = data;
        return res;
      }
    } as any;
    
    const next = () => { nextCalled = true; };

    await middleware(req, res, next);

    assert.equal(nextCalled, false);
    assert.equal(statusCode, 401);
    assert.deepEqual(jsonResponse, { error: 'Session révoquée. Veuillez vous reconnecter.' });
  });

  it('should call next if token is not blacklisted', async () => {
    const middleware = createTokenBlacklistMiddleware(new MockTokenBlacklistPort());
    
    const req = {
      headers: { authorization: 'Bearer active_token' }
    } as any;
    
    let nextCalled = false;
    const res = {} as any;
    const next = () => { nextCalled = true; };

    await middleware(req, res, next);

    assert.equal(nextCalled, true);
  });

  it('should call next if authorization header is missing', async () => {
    const middleware = createTokenBlacklistMiddleware(new MockTokenBlacklistPort());
    
    const req = { headers: {} } as any;
    let nextCalled = false;
    const res = {} as any;
    const next = () => { nextCalled = true; };

    await middleware(req, res, next);

    assert.equal(nextCalled, true);
  });
});
