// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// `server-only` throws when imported outside a server runtime; stub it so the
// adapter can be unit-tested in Node.
vi.mock("server-only", () => ({}));

// Mock of the Supabase client. `rpc()` resolves `state.rpc`; each `from(table)`
// query resolves `state.tables[table]`. Mutations are captured for assertions.
const state: {
  rpc: { data: unknown; error: unknown };
  tables: Record<string, { data: unknown; error: unknown }>;
  lastRpcParams: unknown;
  lastUpdate: unknown;
} = { rpc: { data: null, error: null }, tables: {}, lastRpcParams: null, lastUpdate: null };

function builder(table: string) {
  const result = () =>
    Promise.resolve(state.tables[table] ?? { data: null, error: null });
  const b: Record<string, unknown> = {};
  for (const method of [
    "select",
    "eq",
    "order",
    "insert",
    "upsert",
    "delete",
    "lte",
    "gt",
    "limit",
  ]) {
    b[method] = () => b;
  }
  b.update = (value: unknown) => ((state.lastUpdate = value), b);
  b.single = () => result();
  b.maybeSingle = () => result();
  b.then = (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
    result().then(resolve, reject);
  return b;
}

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table: string) => builder(table),
    rpc: (_name: string, params: unknown) => {
      state.lastRpcParams = params;
      return Promise.resolve(state.rpc);
    },
  }),
}));

import { createSupabaseSubmissionStore, isSupabaseConfigured } from "../supabase";

beforeEach(() => {
  state.rpc = { data: null, error: null };
  state.tables = {};
  state.lastRpcParams = null;
  state.lastUpdate = null;
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
  it("calls the RPC with typed params and assembles base + detail into a Submission", async () => {
    const id = "11111111-1111-4111-8111-111111111111";
    state.rpc = { data: id, error: null };
    state.tables.submissions = {
      data: {
        id,
        type: "contact",
        full_name: "Ada",
        email: "ada@example.com",
        status: "new",
        notes: "",
        from_ref: "home",
        created_at: "2026-06-12T10:00:00.000Z",
        updated_at: "2026-06-12T10:00:00.000Z",
      },
      error: null,
    };
    state.tables.contact_submissions = {
      data: { submission_id: id, role: "parent", message: "Hello" },
      error: null,
    };

    const store = createSupabaseSubmissionStore();
    const submission = await store.createSubmission(
      { type: "contact", fullName: "Ada", email: "ada@example.com", role: "parent", message: "Hello" },
      { from: "home" },
    );

    const params = state.lastRpcParams as Record<string, unknown>;
    expect(params.p_type).toBe("contact");
    expect(params.p_full_name).toBe("Ada");
    expect(params.p_from_ref).toBe("home");
    expect(params.p_cycle_id).toBeNull();
    expect(params.p_contact_role).toBe("parent");

    expect(submission.type).toBe("contact");
    expect(submission.from).toBe("home");
    expect(submission.fullName).toBe("Ada");
    if (submission.type === "contact") {
      expect(submission.role).toBe("parent");
      expect(submission.message).toBe("Hello");
    }
  });

  it("passes the cycle id from meta into the RPC for a mentor submission", async () => {
    const id = "33333333-3333-4333-8333-333333333333";
    state.rpc = { data: id, error: null };
    state.tables.submissions = {
      data: {
        id,
        type: "mentor",
        full_name: "Tunde",
        email: "tunde@example.com",
        status: "pending",
        notes: "",
        from_ref: null,
        cycle_id: "cycle-abc",
        created_at: "2026-06-12T10:00:00.000Z",
        updated_at: "2026-06-12T10:00:00.000Z",
      },
      error: null,
    };
    state.tables.mentor_submissions = {
      data: {
        submission_id: id,
        field_of_expertise: "Software",
        audience_preference: "either",
        availability: "monthly",
        message: null,
      },
      error: null,
    };

    const store = createSupabaseSubmissionStore();
    const submission = await store.createSubmission(
      {
        type: "mentor",
        fullName: "Tunde",
        email: "tunde@example.com",
        fieldOfExpertise: "Software",
        audiencePreference: "either",
        availability: "monthly",
        message: null,
      },
      { cycleId: "cycle-abc" },
    );

    const params = state.lastRpcParams as Record<string, unknown>;
    expect(params.p_cycle_id).toBe("cycle-abc");
    if (submission.type === "mentor") {
      expect(submission.cycleId).toBe("cycle-abc");
    }
  });

  it("throws when the RPC returns an error", async () => {
    state.rpc = { data: null, error: { message: "boom" } };
    const store = createSupabaseSubmissionStore();
    await expect(
      store.createSubmission({
        type: "volunteer",
        fullName: "Sam",
        email: "sam@example.com",
        interestArea: "events",
        message: null,
      }),
    ).rejects.toThrow(/boom/);
  });
});

describe("getSubmission", () => {
  it("returns null when the base row is not found", async () => {
    state.tables.submissions = { data: null, error: null };
    const store = createSupabaseSubmissionStore();
    await expect(
      store.getSubmission("mentor", "22222222-2222-4222-8222-222222222222"),
    ).resolves.toBeNull();
  });
});

describe("getActiveCycle", () => {
  it("maps a returned row from snake_case to a Cycle, or null", async () => {
    state.tables.cycles = {
      data: {
        id: "cycle-1",
        role: "mentor",
        label: "Summer 2026",
        open_at: "2026-06-01T00:00:00.000Z",
        close_at: "2026-07-01T00:00:00.000Z",
        created_at: "2026-05-01T00:00:00.000Z",
        updated_at: "2026-05-01T00:00:00.000Z",
      },
      error: null,
    };
    const store = createSupabaseSubmissionStore();
    const cycle = await store.getActiveCycle("mentor");
    expect(cycle).toEqual({
      id: "cycle-1",
      role: "mentor",
      label: "Summer 2026",
      openAt: "2026-06-01T00:00:00.000Z",
      closeAt: "2026-07-01T00:00:00.000Z",
      createdAt: "2026-05-01T00:00:00.000Z",
      updatedAt: "2026-05-01T00:00:00.000Z",
    });

    state.tables.cycles = { data: null, error: null };
    expect(await store.getActiveCycle("mentee")).toBeNull();
  });
});

describe("createCycle", () => {
  it("inserts open_at/close_at and returns the mapped row", async () => {
    state.tables.cycles = {
      data: {
        id: "cycle-2",
        role: "mentee",
        label: "Mentee 2026",
        open_at: "2026-06-01T00:00:00.000Z",
        close_at: "2026-07-01T00:00:00.000Z",
        created_at: "2026-05-01T00:00:00.000Z",
        updated_at: "2026-05-01T00:00:00.000Z",
      },
      error: null,
    };
    const store = createSupabaseSubmissionStore();
    const cycle = await store.createCycle({
      role: "mentee",
      label: "Mentee 2026",
      openAt: "2026-06-01T00:00:00.000Z",
      closeAt: "2026-07-01T00:00:00.000Z",
    });
    expect(cycle.id).toBe("cycle-2");
    expect(cycle.openAt).toBe("2026-06-01T00:00:00.000Z");
    expect(cycle.closeAt).toBe("2026-07-01T00:00:00.000Z");
  });
});
