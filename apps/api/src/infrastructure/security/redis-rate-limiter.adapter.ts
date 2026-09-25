import Redis from 'ioredis';
import { IRateLimiterPort, RateLimitResult } from '../../domain/ports/rate-limiter.port';
import { MemoryRateLimiterAdapter } from './memory-rate-limiter.adapter';

export class RedisRateLimiterAdapter implements IRateLimiterPort {
  private redisClient?: Redis;
  private isRedisConnected = false;
  private readonly fallbackAdapter = new MemoryRateLimiterAdapter();
  private readonly KEY_PREFIX = 'rl:';

  // Atomic Redis sliding-window script using Sorted Sets
  // KEYS[1]: rate limit key
  // ARGV[1]: current timestamp in milliseconds
  // ARGV[2]: window duration in milliseconds
  // ARGV[3]: request limit
  // Returns: [allowed (0 or 1), remaining count, resetTimeMs (or oldest ts)]
  private readonly SLIDING_WINDOW_LUA = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local windowMs = tonumber(ARGV[2])
    local limit = tonumber(ARGV[3])
    local windowStart = now - windowMs

    -- Remove elements outside sliding window
    redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)

    -- Count hits in current window
    local currentCount = redis.call('ZCARD', key)

    if currentCount >= limit then
      local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
      local resetTimeMs = now + windowMs
      if oldest and #oldest >= 2 then
        resetTimeMs = tonumber(oldest[2]) + windowMs
      end
      return {0, 0, resetTimeMs}
    end

    -- Add current request timestamp (using microsecond precision if available or unique score/member)
    local member = now .. ':' .. math.random(1000, 9999)
    redis.call('ZADD', key, now, member)

    -- Auto-expire the key after window duration
    local expireSeconds = math.ceil(windowMs / 1000) + 1
    redis.call('EXPIRE', key, expireSeconds)

    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local resetTimeMs = now + windowMs
    if oldest and #oldest >= 2 then
      resetTimeMs = tonumber(oldest[2]) + windowMs
    end

    return {1, limit - (currentCount + 1), resetTimeMs}
  `;

  constructor(redisUrl?: string) {
    const url = redisUrl || process.env.REDIS_URL;
    if (url) {
      try {
        this.redisClient = new Redis(url, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          connectTimeout: 2000,
        });

        this.redisClient.on('connect', () => {
          this.isRedisConnected = true;
        });

        this.redisClient.on('error', (_err) => {
          this.isRedisConnected = false;
        });

        this.redisClient.connect().then(() => {
          this.isRedisConnected = true;
        }).catch(() => {
          this.isRedisConnected = false;
        });
      } catch {
        this.isRedisConnected = false;
      }
    }
  }

  public async consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const namespacedKey = `${this.KEY_PREFIX}${key}`;

    if (this.isRedisConnected && this.redisClient) {
      try {
        const now = Date.now();
        const result = (await this.redisClient.eval(
          this.SLIDING_WINDOW_LUA,
          1,
          namespacedKey,
          now.toString(),
          windowMs.toString(),
          limit.toString()
        )) as [number, number, number];

        const allowed = result[0] === 1;
        const remaining = result[1];
        const resetTimeMs = result[2] || (now + windowMs);
        const retryAfterSeconds = allowed ? undefined : Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

        return {
          allowed,
          limit,
          remaining,
          resetTimeMs,
          retryAfterSeconds,
        };
      } catch (err: any) {
        console.warn(`[RedisRateLimiter] Redis failed, falling back to in-memory: ${err?.message}`);
      }
    }

    return this.fallbackAdapter.consume(key, limit, windowMs);
  }

  public async reset(key: string): Promise<void> {
    const namespacedKey = `${this.KEY_PREFIX}${key}`;

    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(namespacedKey);
        return;
      } catch (err: any) {
        console.warn(`[RedisRateLimiter] Redis failed on reset, falling back to in-memory: ${err?.message}`);
      }
    }

    return this.fallbackAdapter.reset(key);
  }
}

