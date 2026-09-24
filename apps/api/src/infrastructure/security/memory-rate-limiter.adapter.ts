import { IRateLimiterPort, RateLimitResult } from '../../domain/ports/rate-limiter.port';

export class MemoryRateLimiterAdapter implements IRateLimiterPort {
  // Key -> Array of timestamps in ms
  private readonly hits = new Map<string, number[]>();

  public async consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - windowMs;

    const timestamps = (this.hits.get(key) || []).filter((ts) => ts > windowStart);

    if (timestamps.length >= limit) {
      const oldestHit = timestamps[0];
      const resetTimeMs = oldestHit + windowMs;
      const retryAfterSeconds = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

      this.hits.set(key, timestamps);

      return {
        allowed: false,
        limit,
        remaining: 0,
        resetTimeMs,
        retryAfterSeconds,
      };
    }

    timestamps.push(now);
    this.hits.set(key, timestamps);

    const oldestHit = timestamps[0];
    const resetTimeMs = oldestHit + windowMs;

    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - timestamps.length),
      resetTimeMs,
    };
  }

  public async reset(key: string): Promise<void> {
    this.hits.delete(key);
  }

  public clear(): void {
    this.hits.clear();
  }
}

