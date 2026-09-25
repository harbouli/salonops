export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTimeMs: number;
  retryAfterSeconds?: number;
}

export interface IRateLimiterPort {
  consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
  reset?(key: string): Promise<void>;
}

