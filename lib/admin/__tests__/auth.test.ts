// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

// `server-only` resolves to a guard that throws outside a Server Component;
// under vitest it is a no-op marker, so stub it away.
vi.mock("server-only", () => ({}));

// The auth module imports next/headers, next/navigation, and the store at the
// top level. These pure session-token tests never exercise the cookie/redirect
// or store paths, but the imports must resolve, so stub them.
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
vi.mock("@/lib/db", () => ({
  db: { getAdminById: vi.fn() },
}));

import {
  createSessionToken,
  isAdminConfigured,
  verifySessionToken,
} from "../auth";

const SECRET = "a-very-high-entropy-session-secret-value";
const ADMIN_ID = "0a1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isAdminConfigured", () => {
  it("is false when ADMIN_SESSION_SECRET is unset", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "");
    expect(isAdminConfigured()).toBe(false);
  });

  it("is true when ADMIN_SESSION_SECRET is set", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", SECRET);
    expect(isAdminConfigured()).toBe(true);
  });
});

describe("session token", () => {
  it("carries the admin id and round-trips a fresh token", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", SECRET);
    const now = 1_000_000_000_000;
    const token = createSessionToken(ADMIN_ID, now);
    expect(token.startsWith(`${ADMIN_ID}.`)).toBe(true);
    expect(verifySessionToken(token, now + 1000)).toBe(ADMIN_ID);
  });

  it("rejects an expired token", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", SECRET);
    const now = 1_000_000_000_000;
    const token = createSessionToken(ADMIN_ID, now);
    const justAfterExpiry = now + 24 * 60 * 60 * 1000 + 1;
    expect(verifySessionToken(token, justAfterExpiry)).toBeNull();
  });

  it("rejects a token with a tampered signature", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", SECRET);
    const now = 1_000_000_000_000;
    const token = createSessionToken(ADMIN_ID, now);
    const lastDot = token.lastIndexOf(".");
    const payload = token.slice(0, lastDot);
    const hmac = token.slice(lastDot + 1);
    const flipped = (hmac[0] === "0" ? "1" : "0") + hmac.slice(1);
    expect(verifySessionToken(`${payload}.${flipped}`, now)).toBeNull();
  });

  it("rejects a token with a tampered (extended) expiry", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", SECRET);
    const now = 1_000_000_000_000;
    const token = createSessionToken(ADMIN_ID, now);
    const lastDot = token.lastIndexOf(".");
    const payload = token.slice(0, lastDot);
    const hmac = token.slice(lastDot + 1);
    const sep = payload.lastIndexOf(".");
    const idPart = payload.slice(0, sep);
    const expiry = payload.slice(sep + 1);
    const forgedExpiry = String(Number(expiry) + 1_000_000);
    expect(
      verifySessionToken(`${idPart}.${forgedExpiry}.${hmac}`, now),
    ).toBeNull();
  });

  it("rejects a token with a swapped admin id", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", SECRET);
    const now = 1_000_000_000_000;
    const token = createSessionToken(ADMIN_ID, now);
    const lastDot = token.lastIndexOf(".");
    const payload = token.slice(0, lastDot);
    const hmac = token.slice(lastDot + 1);
    const sep = payload.lastIndexOf(".");
    const expiry = payload.slice(sep + 1);
    // Reuse a valid signature with a different id: the payload no longer matches.
    expect(
      verifySessionToken(`other-admin-id.${expiry}.${hmac}`, now),
    ).toBeNull();
  });

  it("rejects empty and garbage tokens", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", SECRET);
    expect(verifySessionToken("", 0)).toBeNull();
    expect(verifySessionToken("garbage", 0)).toBeNull();
    expect(verifySessionToken("123", 0)).toBeNull();
    expect(verifySessionToken("id.abc", 0)).toBeNull();
    expect(verifySessionToken("id.123.", 0)).toBeNull();
    expect(verifySessionToken("id.notanumber.abc", 0)).toBeNull();
    expect(verifySessionToken("id.123.nothex", 0)).toBeNull();
  });

  it("rejects a token signed under a different secret", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", SECRET);
    const now = 1_000_000_000_000;
    const token = createSessionToken(ADMIN_ID, now);
    vi.stubEnv("ADMIN_SESSION_SECRET", "a different secret");
    expect(verifySessionToken(token, now)).toBeNull();
  });

  it("rejects any token when admin is unconfigured", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", SECRET);
    const now = 1_000_000_000_000;
    const token = createSessionToken(ADMIN_ID, now);
    vi.stubEnv("ADMIN_SESSION_SECRET", "");
    expect(verifySessionToken(token, now)).toBeNull();
  });
});
