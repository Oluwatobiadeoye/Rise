// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// `server-only` throws when imported outside a server runtime; stub it so the
// adapter can be unit-tested in Node.
vi.mock("server-only", () => ({}));

// A chainable stand-in for the Supabase query builder. Every chaining method
// returns the builder; terminal calls resolve to `state.result`. Mutations are
// captured so tests can assert what was written.
const state: {
  result: { data: unknown; error: unknown };
  lastInsert: unknown;
  lastUpdate: unknown;
  lastUpsert: unknown;
} = { result: { data: null, error: null }, lastInsert: null, lastUpdate: null, lastUpsert: null };

function builder() {
  const b: Record<string, unknown> = {};
  for (const method of ["select", "eq", "order"]) {
    b[method] = () => b;
  }
  b.insert = (value: unknown) => ((state.lastInsert = value), b);
  b.update = (value: unknown) => ((state.lastUpdate = value), b);
  b.upsert = (value: unknown) => ((state.lastUpsert = value), b);
  b.single = () => Promise.resolve(state.result);
  b.maybeSingle = () => Promise.resolve(state.result);
  b.then = (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
    Promise.resolve(state.result).then(resolve, reject);
  return b;
}

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ from: () => builder() }),
}));

import { createSupabaseSubmissionStore, isSupabaseConfigured } from "../supabase";

beforeEach(() => {
  state.result = { data: null, error: null };
  state.lastInsert = null;
  state.lastUpdate = null;
  state.lastUpsert = null;
  vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-test-key");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isSupabaseConfigured", () => {
  it("is true only when both keys are set", () => {
    expect(isSupabaseConfigured()).toBe(true);
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    expect(isSupabaseConfigured()).toBe(false);
  });
});

describe("createSubmission", () => {
  it("writes from as from_ref and maps the row back to the domain shape", async () => {
    state.result = {
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        type: "contact",
        payload: { fullName: "Ada", email: "ada@example.com", role: "parent", message: "Hello" },
        status: "new",
        notes: "",
        from_ref: "home",
        created_at: "2026-06-12T10:00:00.000Z",
        updated_at: "2026-06-12T10:00:00.000Z",
      },
      error: null,
    };

    const store = createSupabaseSubmissionStore();
    const submission = await store.createSubmission(
      "contact",
      { fullName: "Ada", email: "ada@example.com", role: "parent", message: "Hello" },
      { from: "home" },
    );

    expect((state.lastInsert as { from_ref: string }).from_ref).toBe("home");
    expect((state.lastInsert as { status: string }).status).toBe("new");
    expect(submission.from).toBe("home");
    expect(submission.createdAt).toBe("2026-06-12T10:00:00.000Z");
    expect(submission.type).toBe("contact");
  });

  it("throws when Supabase returns an error", async () => {
    state.result = { data: null, error: { message: "boom" } };
    const store = createSupabaseSubmissionStore();
    await expect(
      store.createSubmission("volunteer", {
        fullName: "Sam",
        email: "sam@example.com",
        interestArea: "events",
        message: null,
      }),
    ).rejects.toThrow(/boom/);
  });
});

describe("getSubmission", () => {
  it("returns null when no row is found", async () => {
    state.result = { data: null, error: null };
    const store = createSupabaseSubmissionStore();
    await expect(
      store.getSubmission("mentor", "22222222-2222-4222-8222-222222222222"),
    ).resolves.toBeNull();
  });
});

describe("getCycles", () => {
  it("maps stored rows and defaults missing roles to closed", async () => {
    state.result = {
      data: [{ role: "mentor", open: true, updated_at: "2026-06-12T09:00:00.000Z" }],
      error: null,
    };
    const store = createSupabaseSubmissionStore();
    const cycles = await store.getCycles();
    expect(cycles.mentor).toEqual({ open: true, updatedAt: "2026-06-12T09:00:00.000Z" });
    expect(cycles.mentee).toEqual({ open: false, updatedAt: null });
  });
});
