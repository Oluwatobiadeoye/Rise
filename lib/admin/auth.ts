import "server-only";

import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { Admin } from "@/lib/types";

export const ADMIN_SESSION_COOKIE = "rise_admin_session";

// Sessions last a day; the expiry is signed into the token so a tampered or
// stale token never verifies.
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Admin is enabled only when a session signing secret is configured. The secret
 * is independent of any account password, so rotating an admin's password never
 * invalidates everyone's sessions.
 */
export function isAdminConfigured(): boolean {
  return !!process.env.ADMIN_SESSION_SECRET;
}

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/** Length-stable equality so a wrong-length input cannot crash timingSafeEqual. */
function constantTimeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Signing key derived from the configured secret, namespaced and versioned. */
function sessionKey(): Buffer {
  return sha256(`rise-admin-v1:${sessionSecret()}`);
}

/** HMAC over the signed payload (the admin id and the expiry). */
function signPayload(payload: string): string {
  return createHmac("sha256", sessionKey()).update(payload).digest("hex");
}

/**
 * `${adminId}.${expiresAtMs}.${hmacHex}` — the admin id and expiry are signed,
 * not encrypted. Binding the admin id means a session names exactly one account.
 */
export function createSessionToken(
  adminId: string,
  now: number = Date.now(),
): string {
  const expiresAtMs = now + SESSION_TTL_MS;
  const payload = `${adminId}.${expiresAtMs}`;
  return `${payload}.${signPayload(payload)}`;
}

/**
 * Returns the admin id for a well-formed, unexpired, untampered token, else
 * null. The signature is checked in constant time. Note: the admin id itself
 * (a UUID) may contain no dots, so the token is split on its last two dots.
 */
export function verifySessionToken(
  token: string,
  now: number = Date.now(),
): string | null {
  if (!isAdminConfigured()) return null;
  if (typeof token !== "string") return null;

  const lastDot = token.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === token.length - 1) return null;
  const payload = token.slice(0, lastDot);
  const hmacPart = token.slice(lastDot + 1);

  const sep = payload.lastIndexOf(".");
  if (sep <= 0 || sep === payload.length - 1) return null;
  const adminId = payload.slice(0, sep);
  const expiryPart = payload.slice(sep + 1);

  if (!/^\d+$/.test(expiryPart)) return null;
  const expiresAtMs = Number(expiryPart);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= now) return null;

  if (!/^[0-9a-f]+$/i.test(hmacPart)) return null;
  const ok = constantTimeEqual(
    Buffer.from(hmacPart, "hex"),
    Buffer.from(signPayload(payload), "hex"),
  );
  return ok ? adminId : null;
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

/** Reads the session cookie and resolves the bound admin, or null. */
export async function getCurrentAdmin(): Promise<Admin | null> {
  if (!isAdminConfigured()) return null;
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (typeof token !== "string") return null;
  const adminId = verifySessionToken(token);
  if (!adminId) return null;
  return db.getAdminById(adminId);
}

/**
 * Page guard. When admin is not configured the whole surface is hidden (404);
 * otherwise a missing or invalid session is redirected to the login page.
 * Returns the authenticated admin.
 */
export async function requireAdmin(): Promise<Admin> {
  if (!isAdminConfigured()) notFound();
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/**
 * Server-action guard. Same checks as {@link requireAdmin} but throws instead
 * of redirecting, so a tampered action call fails loudly rather than silently.
 */
export async function assertAdmin(): Promise<Admin> {
  const admin = isAdminConfigured() ? await getCurrentAdmin() : null;
  if (!admin) throw new Error("Unauthorized");
  return admin;
}
