// @vitest-environment node
import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../password";

const PASSWORD = "correct horse battery staple";

describe("hashPassword / verifyPassword", () => {
  it("verifies a password against its own hash", () => {
    const stored = hashPassword(PASSWORD);
    expect(verifyPassword(PASSWORD, stored)).toBe(true);
  });

  it("rejects a wrong password", () => {
    const stored = hashPassword(PASSWORD);
    expect(verifyPassword("wrong", stored)).toBe(false);
    expect(verifyPassword("", stored)).toBe(false);
    expect(verifyPassword(`${PASSWORD} `, stored)).toBe(false);
  });

  it("produces a salt:key hex string", () => {
    const stored = hashPassword(PASSWORD);
    expect(stored).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
  });

  it("produces a different hash each time (random salt)", () => {
    expect(hashPassword(PASSWORD)).not.toBe(hashPassword(PASSWORD));
  });

  it("returns false for malformed stored values, never throwing", () => {
    expect(verifyPassword(PASSWORD, "")).toBe(false);
    expect(verifyPassword(PASSWORD, "no-separator")).toBe(false);
    expect(verifyPassword(PASSWORD, ":onlykey")).toBe(false);
    expect(verifyPassword(PASSWORD, "onlysalt:")).toBe(false);
    expect(verifyPassword(PASSWORD, "nothex:nothex")).toBe(false);
    // @ts-expect-error exercising non-string input
    expect(verifyPassword(PASSWORD, null)).toBe(false);
    // @ts-expect-error exercising non-string input
    expect(verifyPassword(123, hashPassword(PASSWORD))).toBe(false);
  });
});
