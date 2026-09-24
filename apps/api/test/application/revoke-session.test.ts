import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { RevokeSessionUseCase } from '../../src/application/use-cases/revoke-session.use-case';
import { ITokenBlacklistPort } from '../../src/domain/ports/token-blacklist.port';
import { ITokenServicePort, AuthTokenPayload } from '../../src/domain/ports/token-service.port';

class MockTokenBlacklistPort implements ITokenBlacklistPort {
  public revokedTokens: Map<string, number> = new Map();

  async revokeToken(token: string, ttlSeconds: number): Promise<void> {
    this.revokedTokens.set(token, ttlSeconds);
  }

  async isRevoked(token: string): Promise<boolean> {
    return this.revokedTokens.has(token);
  }
}

describe('RevokeSessionUseCase', () => {
  it('should revoke a valid token with correct TTL', async () => {
    const blacklistPort = new MockTokenBlacklistPort();
    const useCase = new RevokeSessionUseCase(blacklistPort);

    // Provide a mocked JWT string. The UseCase will decode it using jwt.decode.
    // Instead of mocking jwt.decode globally, we can use a real unsigned token just for decoding logic testing.
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
    const jwtString = `${header}.${payload}.sig`;

    await useCase.execute(jwtString);

    assert.equal(blacklistPort.revokedTokens.size, 1);
    const ttl = blacklistPort.revokedTokens.get(jwtString);
    assert.ok(ttl !== undefined && ttl > 0 && ttl <= 3600);
  });

  it('should fallback to 24h TTL if token cannot be decoded', async () => {
    const blacklistPort = new MockTokenBlacklistPort();
    const useCase = new RevokeSessionUseCase(blacklistPort);

    await useCase.execute('invalid_token');

    assert.equal(blacklistPort.revokedTokens.size, 1);
    assert.equal(blacklistPort.revokedTokens.get('invalid_token'), 24 * 60 * 60);
  });

  it('should not revoke if token is already expired', async () => {
    const blacklistPort = new MockTokenBlacklistPort();
    const useCase = new RevokeSessionUseCase(blacklistPort);

    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 })).toString('base64url');
    const jwtString = `${header}.${payload}.sig`;
    await useCase.execute(jwtString);

    assert.equal(blacklistPort.revokedTokens.size, 0); // TTL < 0
  });
});
