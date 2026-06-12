import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// scrypt cost parameters. N must be a power of two; these match the OWASP
// baseline (N=16384, r=8, p=1) and produce a 64-byte derived key. The 16-byte
// random salt makes every stored hash unique even for identical passwords.
const SALT_BYTES = 16;
const KEY_LENGTH = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

/**
 * Hashes a plaintext password with scrypt and a fresh random salt. The result
 * is `"<saltHex>:<keyHex>"`, self-describing so {@link verifyPassword} can
 * re-derive without any external parameter store.
 *
 * No `server-only` import here on purpose: this is a pure function so it can be
 * unit-tested under the node environment and reused by the create-admin script.
 */
export function hashPassword(plain: string): string {
  const salt = randomBytes(SALT_BYTES);
  const derived = scryptSync(plain, salt, KEY_LENGTH, SCRYPT_PARAMS);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

/**
 * Re-derives the key from the stored salt and compares it to the stored key in
 * constant time. Returns false for any malformed stored value and never throws,
 * so a corrupt record can never crash a login.
 */
export function verifyPassword(plain: string, stored: string): boolean {
  if (typeof plain !== "string" || typeof stored !== "string") return false;

  const sep = stored.indexOf(":");
  if (sep <= 0 || sep === stored.length - 1) return false;

  const saltHex = stored.slice(0, sep);
  const keyHex = stored.slice(sep + 1);
  if (!/^[0-9a-f]+$/i.test(saltHex) || !/^[0-9a-f]+$/i.test(keyHex)) {
    return false;
  }

  try {
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(keyHex, "hex");
    if (salt.length === 0 || expected.length === 0) return false;

    const derived = scryptSync(plain, salt, expected.length, SCRYPT_PARAMS);
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
