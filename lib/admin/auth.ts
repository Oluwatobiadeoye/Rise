import "server-only";

import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "rise_admin_session";

// Sessions last a day; the timestamp is signed into the token so a tampered or
// stale token never verifies.
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

/** Admin is enabled only when a password is configured. */
export function isAdminConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/** Length-stable equality so a wrong-length input cannot crash timingSafeEqual. */
function constantTimeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Constant-time password check over the SHA-256 digests of the candidate and
 * the configured password. Hashing first keeps the comparison length-stable
 * regardless of the inputs.
 */
export function verifyPassword(candidate: string): boolean {
  if (!isAdminConfigured()) return false;
  return constantTimeEqual(sha256(candidate), sha256(adminPassword()));
}

/** Signing key derived from the configured password, namespaced and versioned. */
function sessionKey(): Buffer {
  return sha256(`rise-admin-v1:${adminPassword()}`);
}

function signExpiry(expiresAtMs: number): string {
  return createHmac("sha256", sessionKey())
    .update(String(expiresAtMs))
    .digest("hex");
}

/** `${expiresAtMs}.${hmacHex}` — the expiry is signed, not encrypted. */
export function createSessionToken(now: number = Date.now()): string {
  const expiresAtMs = now + SESSION_TTL_MS;
  return `${expiresAtMs}.${signExpiry(expiresAtMs)}`;
}

/** True only for a well-formed, unexpired, untampered token. */
export function verifySessionToken(
  token: string,
  now: number = Date.now(),
): boolean {
  if (!isAdminConfigured()) return false;
  if (typeof token !== "string") return false;

  const dot = token.indexOf(".");
  if (dot <= 0 || dot === token.length - 1) return false;

  const expiryPart = token.slice(0, dot);
  const hmacPart = token.slice(dot + 1);

  if (!/^\d+$/.test(expiryPart)) return false;
  const expiresAtMs = Number(expiryPart);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= now) return false;

  const expectedHex = signExpiry(expiresAtMs);
  if (!/^[0-9a-f]+$/i.test(hmacPart)) return false;

  return constantTimeEqual(
    Buffer.from(hmacPart, "hex"),
    Buffer.from(expectedHex, "hex"),
  );
}

/**
 * Cookie attributes shared by the set and delete paths. `strict` because the
 * admin area has no inbound cross-site link flows, so it closes the residual
 * cross-site request forgery gap at no usability cost.
 */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/admin",
} as const;

async function hasValidSession(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return typeof token === "string" && verifySessionToken(token);
}

/**
 * Page guard. When admin is not configured the whole surface is hidden (404);
 * otherwise an invalid session is redirected to the login page.
 */
export async function requireAdmin(): Promise<void> {
  if (!isAdminConfigured()) notFound();
  if (!(await hasValidSession())) redirect("/admin/login");
}

/**
 * Server-action guard. Same checks as {@link requireAdmin} but throws instead
 * of redirecting, so a tampered action call fails loudly rather than silently.
 */
export async function assertAdmin(): Promise<void> {
  if (!isAdminConfigured() || !(await hasValidSession())) {
    throw new Error("Unauthorized");
  }
}
