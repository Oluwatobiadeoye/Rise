/**
 * In-memory sliding-window rate limiter.
 *
 * Single-process only: state lives in this module, so it resets on restart
 * and is not shared across instances. Good enough for one server at this
 * traffic level; a shared store (database or KV) replaces it before scaling
 * out.
 */

type Options = {
  /** Maximum hits allowed within the window. */
  limit?: number;
  /** Window size in milliseconds. */
  windowMs?: number;
  /** Injectable clock for tests (epoch milliseconds). */
  now?: number;
};

const hitsByKey = new Map<string, number[]>();

/** Returns true when the hit is allowed (and records it), false when over the limit. */
export function checkRateLimit(key: string, options: Options = {}): boolean {
  const { limit = 5, windowMs = 600_000, now = Date.now() } = options;
  const cutoff = now - windowMs;

  // Prune stale keys on every call so the map cannot grow unbounded.
  for (const [existingKey, times] of hitsByKey) {
    const fresh = times.filter((time) => time > cutoff);
    if (fresh.length === 0) {
      hitsByKey.delete(existingKey);
    } else if (fresh.length !== times.length) {
      hitsByKey.set(existingKey, fresh);
    }
  }

  const current = hitsByKey.get(key) ?? [];
  if (current.length >= limit) return false;
  current.push(now);
  hitsByKey.set(key, current);
  return true;
}

export function resetRateLimit(): void {
  hitsByKey.clear();
}
