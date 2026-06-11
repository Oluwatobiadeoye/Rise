// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

// `server-only` resolves to a guard that throws outside a Server Component;
// under vitest it is a no-op marker, so stub it away.
vi.mock("server-only", () => ({}));

// The auth module imports next/headers and next/navigation at the top level.
// These pure-function tests never exercise the cookie/redirect paths, but the
// imports must resolve, so stub them.
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

import {
  createSessionToken,
  isAdminConfigured,
  verifyPassword,
  verifySessionToken,
} from "../auth";

const PASSWORD = "correct horse battery staple";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isAdminConfigured", () => {
  it("is false when ADMIN_PASSWORD is unset", () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(isAdminConfigured()).toBe(false);
  });

  it("is true when ADMIN_PASSWORD is set", () => {
    vi.stubEnv("ADMIN_PASSWORD", PASSWORD);
    expect(isAdminConfigured()).toBe(true);
  });
});

describe("verifyPassword", () => {
  it("accepts the correct password", () => {
    vi.stubEnv("ADMIN_PASSWORD", PASSWORD);
    expect(verifyPassword(PASSWORD)).toBe(true);
  });

  it("rejects an incorrect password", () => {
    vi.stubEnv("ADMIN_PASSWORD", PASSWORD);
    expect(verifyPassword("wrong")).toBe(false);
    expect(verifyPassword("")).toBe(false);
    expect(verifyPassword(`${PASSWORD} `)).toBe(false);
  });

  it("rejects everything when admin is unconfigured", () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(verifyPassword("")).toBe(false);
    expect(verifyPassword("anything")).toBe(false);
  });
});

describe("session token", () => {
  it("round-trips a freshly minted token", () => {
    vi.stubEnv("ADMIN_PASSWORD", PASSWORD);
    const now = 1_000_000_000_000;
    const token = createSessionToken(now);
    expect(verifySessionToken(token, now + 1000)).toBe(true);
  });

  it("rejects an expired token", () => {
    vi.stubEnv("ADMIN_PASSWORD", PASSWORD);
    const now = 1_000_000_000_000;
    const token = createSessionToken(now);
    const justAfterExpiry = now + 24 * 60 * 60 * 1000 + 1;
    expect(verifySessionToken(token, justAfterExpiry)).toBe(false);
  });

  it("rejects a token with a tampered signature", () => {
    vi.stubEnv("ADMIN_PASSWORD", PASSWORD);
    const now = 1_000_000_000_000;
    const token = createSessionToken(now);
    const [expiry, hmac] = token.split(".");
    // Flip the first hex character of the signature.
    const flipped = (hmac[0] === "0" ? "1" : "0") + hmac.slice(1);
    expect(verifySessionToken(`${expiry}.${flipped}`, now)).toBe(false);
  });

  it("rejects a token with a tampered (extended) expiry", () => {
    vi.stubEnv("ADMIN_PASSWORD", PASSWORD);
    const now = 1_000_000_000_000;
    const token = createSessionToken(now);
    const [expiry, hmac] = token.split(".");
    const forgedExpiry = String(Number(expiry) + 1_000_000);
    expect(verifySessionToken(`${forgedExpiry}.${hmac}`, now)).toBe(false);
  });

  it("rejects empty and garbage tokens", () => {
    vi.stubEnv("ADMIN_PASSWORD", PASSWORD);
    expect(verifySessionToken("", 0)).toBe(false);
    expect(verifySessionToken("garbage", 0)).toBe(false);
    expect(verifySessionToken("123", 0)).toBe(false);
    expect(verifySessionToken(".abc", 0)).toBe(false);
    expect(verifySessionToken("123.", 0)).toBe(false);
    expect(verifySessionToken("notanumber.abc", 0)).toBe(false);
    expect(verifySessionToken("123.nothex", 0)).toBe(false);
  });

  it("rejects a token signed under a different password", () => {
    vi.stubEnv("ADMIN_PASSWORD", PASSWORD);
    const now = 1_000_000_000_000;
    const token = createSessionToken(now);
    // Rotate the password: the old token's signature no longer verifies.
    vi.stubEnv("ADMIN_PASSWORD", "a different password");
    expect(verifySessionToken(token, now)).toBe(false);
  });

  it("rejects any token when admin is unconfigured", () => {
    vi.stubEnv("ADMIN_PASSWORD", PASSWORD);
    const now = 1_000_000_000_000;
    const token = createSessionToken(now);
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(verifySessionToken(token, now)).toBe(false);
  });
});
