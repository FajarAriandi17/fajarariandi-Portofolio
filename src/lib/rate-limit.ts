/**
 * In-memory sliding-window rate limiter for the contact endpoint.
 *
 * Note this is per-instance: on a serverless host each cold instance gets its
 * own counter, so it raises the cost of abuse rather than preventing it
 * outright. For hard guarantees, back it with a shared store (Upstash Redis,
 * Vercel KV) and swap the two functions below — the call sites don't change.
 */

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

/** Drop expired buckets so the map can't grow without bound. */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
};

export function rateLimit(
  identifier: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(identifier);

  if (!existing || existing.resetAt <= now) {
    buckets.set(identifier, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  return {
    ok: true,
    remaining: limit - existing.count,
    retryAfter: 0,
  };
}

/**
 * Best-effort client identity. `x-forwarded-for` is set by the platform and is
 * spoofable on hosts that don't overwrite it — acceptable for coarse abuse
 * limiting, not for anything security-bearing.
 */
export function clientIdentifier(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
