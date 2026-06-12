// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// `server-only` throws when imported outside a server runtime; stub it so the
// client module can be loaded in Node.
vi.mock("server-only", () => ({}));

import { isDatabaseConfigured } from "../client";

describe("isDatabaseConfigured", () => {
  const original = process.env.DATABASE_URL;

  beforeEach(() => {
    delete process.env.DATABASE_URL;
  });

  afterEach(() => {
    if (original === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = original;
  });

  it("is false when DATABASE_URL is unset", () => {
    expect(isDatabaseConfigured()).toBe(false);
  });

  it("is false when DATABASE_URL is an empty string", () => {
    process.env.DATABASE_URL = "";
    expect(isDatabaseConfigured()).toBe(false);
  });

  it("is true when DATABASE_URL is set", () => {
    process.env.DATABASE_URL = "postgresql://localhost:6543/postgres";
    expect(isDatabaseConfigured()).toBe(true);
  });
});
