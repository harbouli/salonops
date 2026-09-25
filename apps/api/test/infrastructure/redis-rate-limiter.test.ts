import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { MemoryRateLimiterAdapter } from '../../src/infrastructure/security/memory-rate-limiter.adapter';
import { RedisRateLimiterAdapter } from '../../src/infrastructure/security/redis-rate-limiter.adapter';

describe('RateLimiter Infrastructure Adapters', () => {
  describe('MemoryRateLimiterAdapter', () => {
    it('should allow requests within limit and decrement remaining count', async () => {
      const limiter = new MemoryRateLimiterAdapter();
      const key = 'test-client-1';
      const limit = 3;
      const windowMs = 5000;

      const res1 = await limiter.consume(key, limit, windowMs);
      assert.equal(res1.allowed, true);
      assert.equal(res1.remaining, 2);
      assert.equal(res1.limit, 3);

      const res2 = await limiter.consume(key, limit, windowMs);
      assert.equal(res2.allowed, true);
      assert.equal(res2.remaining, 1);

      const res3 = await limiter.consume(key, limit, windowMs);
      assert.equal(res3.allowed, true);
      assert.equal(res3.remaining, 0);

      // 4th request exceeds limit
      const res4 = await limiter.consume(key, limit, windowMs);
      assert.equal(res4.allowed, false);
      assert.equal(res4.remaining, 0);
      assert.ok(res4.retryAfterSeconds !== undefined && res4.retryAfterSeconds > 0);
    });

    it('should separate quotas between different keys', async () => {
      const limiter = new MemoryRateLimiterAdapter();
      const limit = 2;
      const windowMs = 5000;

      await limiter.consume('client-A', limit, windowMs);
      await limiter.consume('client-A', limit, windowMs);
      const blockedA = await limiter.consume('client-A', limit, windowMs);
      assert.equal(blockedA.allowed, false);

      const resB = await limiter.consume('client-B', limit, windowMs);
      assert.equal(resB.allowed, true);
      assert.equal(resB.remaining, 1);
    });

    it('should slide window and allow new requests once window expires', async () => {
      const limiter = new MemoryRateLimiterAdapter();
      const key = 'sliding-test';
      const limit = 1;
      const windowMs = 50; // short window for test

      const res1 = await limiter.consume(key, limit, windowMs);
      assert.equal(res1.allowed, true);

      const blocked = await limiter.consume(key, limit, windowMs);
      assert.equal(blocked.allowed, false);

      // Wait for window to slide past
      await new Promise((resolve) => setTimeout(resolve, 60));

      const res2 = await limiter.consume(key, limit, windowMs);
      assert.equal(res2.allowed, true);
    });

    it('should reset rate limit when requested', async () => {
      const limiter = new MemoryRateLimiterAdapter();
      const key = 'reset-key';
      const limit = 1;
      const windowMs = 5000;

      await limiter.consume(key, limit, windowMs);
      const blocked = await limiter.consume(key, limit, windowMs);
      assert.equal(blocked.allowed, false);

      await limiter.reset(key);

      const afterReset = await limiter.consume(key, limit, windowMs);
      assert.equal(afterReset.allowed, true);
    });
  });

  describe('RedisRateLimiterAdapter (with Offline/Dev Fallback)', () => {
    it('should cleanly fallback to in-memory adapter when Redis is offline or not configured', async () => {
      // Intentionally invalid / offline Redis URL to test fallback resilience
      const adapter = new RedisRateLimiterAdapter('redis://127.0.0.1:9999');
      const key = 'offline-test-key';
      const limit = 2;
      const windowMs = 5000;

      const res1 = await adapter.consume(key, limit, windowMs);
      assert.equal(res1.allowed, true);
      assert.equal(res1.remaining, 1);

      const res2 = await adapter.consume(key, limit, windowMs);
      assert.equal(res2.allowed, true);
      assert.equal(res2.remaining, 0);

      const res3 = await adapter.consume(key, limit, windowMs);
      assert.equal(res3.allowed, false);
      assert.equal(res3.remaining, 0);
      assert.ok(res3.retryAfterSeconds !== undefined && res3.retryAfterSeconds > 0);

      await adapter.reset(key);
      const afterReset = await adapter.consume(key, limit, windowMs);
      assert.equal(afterReset.allowed, true);
    });
  });
});

