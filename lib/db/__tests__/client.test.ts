// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// `server-only` throws when imported outside a server runtime; stub it so the
// client module can be loaded in Node.
vi.mock("server-only", () => ({}));

import { getDb } from "../client";

describe("getDb", () => {
  const original = process.env.DATABASE_URL;

  beforeEach(() => {
    delete process.env.DATABASE_URL;
  });

  afterEach(() => {
    if (original === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = original;
  });

  it("throws a clear error when DATABASE_URL is unset", () => {
    expect(() => getDb()).toThrow(/DATABASE_URL/);
  });
});
