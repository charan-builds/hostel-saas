type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export type RateLimitCheck = {
  key: string;
  limit: number;
  now?: number | undefined;
  windowMs: number;
};

export type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds?: number | undefined;
  store: "memory" | "external";
};

export type RateLimitStore = {
  check(input: RateLimitCheck): Promise<RateLimitDecision> | RateLimitDecision;
};

const MAX_MEMORY_BUCKETS = 10_000;

export class InMemoryRateLimitStore implements RateLimitStore {
  readonly #buckets = new Map<string, RateLimitBucket>();

  check({ key, limit, now = Date.now(), windowMs }: RateLimitCheck): RateLimitDecision {
    const bucket = this.#buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.#buckets.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      this.#cleanupExpiredBuckets(now);

      return {
        allowed: true,
        limit,
        remaining: Math.max(0, limit - 1),
        resetAt: now + windowMs,
        store: "memory",
      };
    }

    bucket.count += 1;

    if (bucket.count <= limit) {
      return {
        allowed: true,
        limit,
        remaining: Math.max(0, limit - bucket.count),
        resetAt: bucket.resetAt,
        store: "memory",
      };
    }

    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      store: "memory",
    };
  }

  #cleanupExpiredBuckets(now: number) {
    if (this.#buckets.size <= MAX_MEMORY_BUCKETS) {
      return;
    }

    for (const [key, bucket] of this.#buckets.entries()) {
      if (bucket.resetAt <= now) {
        this.#buckets.delete(key);
      }
    }
  }
}

function getGlobalRateLimitStore() {
  const globalStore = globalThis as typeof globalThis & {
    __hostelErpRateLimitStore?: InMemoryRateLimitStore;
  };

  globalStore.__hostelErpRateLimitStore ??= new InMemoryRateLimitStore();

  return globalStore.__hostelErpRateLimitStore;
}

export function getRateLimitStore(): RateLimitStore {
  // Production deployments can replace this boundary with a Redis/Upstash-backed
  // adapter without changing proxy or route-handler call sites.
  return getGlobalRateLimitStore();
}

export async function checkRateLimit(input: RateLimitCheck) {
  return getRateLimitStore().check(input);
}
