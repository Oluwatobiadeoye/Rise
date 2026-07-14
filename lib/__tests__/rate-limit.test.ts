// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimit } from "../rate-limit";

const BASE = 1_000_000_000_000;

afterEach(() => {
  resetRateLimit();
});

describe("checkRateLimit", () => {
  it("allows up to the limit within the window and rejects after", () => {
    for (let i = 0; i < 5; i += 1) {
      expect(checkRateLimit("contact:1.2.3.4", { now: BASE + i })).toBe(true);
    }
    expect(checkRateLimit("contact:1.2.3.4", { now: BASE + 5 })).toBe(false);
  });

  it("slides the window so old hits stop counting", () => {
    const windowMs = 600_000;
    for (let i = 0; i < 5; i += 1) {
      expect(checkRateLimit("k", { now: BASE + i, windowMs })).toBe(true);
    }
    expect(checkRateLimit("k", { now: BASE + 10, windowMs })).toBe(false);
    // Just past the window of the earliest hit, one slot frees up.
    expect(checkRateLimit("k", { now: BASE + windowMs + 1, windowMs })).toBe(
      true,
    );
  });

  it("tracks keys independently", () => {
    for (let i = 0; i < 5; i += 1) {
      expect(checkRateLimit("a", { now: BASE + i })).toBe(true);
    }
    expect(checkRateLimit("a", { now: BASE + 5 })).toBe(false);
    expect(checkRateLimit("b", { now: BASE + 5 })).toBe(true);
  });

  it("honours a custom limit", () => {
    expect(checkRateLimit("k", { limit: 1, now: BASE })).toBe(true);
    expect(checkRateLimit("k", { limit: 1, now: BASE + 1 })).toBe(false);
  });

  it("does not count rejected attempts as hits", () => {
    const windowMs = 1_000;
    for (let i = 0; i < 5; i += 1) {
      checkRateLimit("k", { now: BASE + i, windowMs });
    }
    // Hammering while blocked must not extend the block.
    for (let i = 5; i < 100; i += 1) {
      expect(checkRateLimit("k", { now: BASE + i, windowMs })).toBe(false);
    }
    expect(checkRateLimit("k", { now: BASE + windowMs + 5, windowMs })).toBe(
      true,
    );
  });

  it("resets cleanly for tests", () => {
    for (let i = 0; i < 5; i += 1) {
      checkRateLimit("k", { now: BASE + i });
    }
    expect(checkRateLimit("k", { now: BASE + 5 })).toBe(false);
    resetRateLimit();
    expect(checkRateLimit("k", { now: BASE + 6 })).toBe(true);
  });
});
