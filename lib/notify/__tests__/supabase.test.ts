// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// `server-only` throws when imported outside a server runtime; stub it so the
// adapter can be unit-tested in Node.
vi.mock("server-only", () => ({}));

// Mock of the Supabase client. Each `from(table)` query resolves
// `state.tables[table]`; inserts are captured for assertions.
const state: {
  tables: Record<string, { data: unknown; error: unknown }>;
  lastInsert: unknown;
  lastEq: { column: string; value: unknown } | null;
} = { tables: {}, lastInsert: null, lastEq: null };

function builder(table: string) {
  const result = () =>
    Promise.resolve(state.tables[table] ?? { data: null, error: null });
  const b: Record<string, unknown> = {};
  for (const method of ["select", "order"]) {
    b[method] = () => b;
  }
  b.insert = (value: unknown) => ((state.lastInsert = value), b);
  b.eq = (column: string, value: unknown) => (
    (state.lastEq = { column, value }), b
  );
  b.single = () => result();
  b.maybeSingle = () => result();
  b.then = (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
    result().then(resolve, reject);
  return b;
}

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table: string) => builder(table),
  }),
}));

import { createSupabaseNotifier } from "../supabase";

beforeEach(() => {
  state.tables = {};
  state.lastInsert = null;
  state.lastEq = null;
  vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-test-key");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("send", () => {
  it("inserts the mapped row and returns a NotificationRecord", async () => {
    const id = "11111111-1111-4111-8111-111111111111";
    state.tables.notifications = {
      data: {
        id,
        kind: "submission-received",
        recipient: "team@example.invalid",
        subject: "New contact submission",
        body: "A new submission arrived.",
        submission_type: "contact",
        submission_id: "abc-123",
        created_at: "2026-06-12T10:00:00.000Z",
      },
      error: null,
    };

    const notifier = createSupabaseNotifier();
    const record = await notifier.send({
      kind: "submission-received",
      to: "team@example.invalid",
      subject: "New contact submission",
      body: "A new submission arrived.",
      submission: { type: "contact", id: "abc-123" },
    });

    const insert = state.lastInsert as Record<string, unknown>;
    expect(insert).toEqual({
      kind: "submission-received",
      recipient: "team@example.invalid",
      subject: "New contact submission",
      body: "A new submission arrived.",
      submission_type: "contact",
      submission_id: "abc-123",
    });

    expect(record).toEqual({
      id,
      kind: "submission-received",
      to: "team@example.invalid",
      subject: "New contact submission",
      body: "A new submission arrived.",
      submission: { type: "contact", id: "abc-123" },
      createdAt: "2026-06-12T10:00:00.000Z",
    });
  });

  it("maps a null submission to null insert columns", async () => {
    state.tables.notifications = {
      data: {
        id: "22222222-2222-4222-8222-222222222222",
        kind: "decision-email",
        recipient: "applicant@example.invalid",
        subject: "Your application",
        body: "Decision body.",
        submission_type: null,
        submission_id: null,
        created_at: "2026-06-12T11:00:00.000Z",
      },
      error: null,
    };

    const notifier = createSupabaseNotifier();
    const record = await notifier.send({
      kind: "decision-email",
      to: "applicant@example.invalid",
      subject: "Your application",
      body: "Decision body.",
      submission: null,
    });

    const insert = state.lastInsert as Record<string, unknown>;
    expect(insert.submission_type).toBeNull();
    expect(insert.submission_id).toBeNull();
    expect(record.submission).toBeNull();
    expect(record.to).toBe("applicant@example.invalid");
  });

  it("throws when the insert returns an error", async () => {
    state.tables.notifications = { data: null, error: { message: "boom" } };
    const notifier = createSupabaseNotifier();
    await expect(
      notifier.send({
        kind: "submission-received",
        to: "team@example.invalid",
        subject: "x",
        body: "y",
        submission: null,
      }),
    ).rejects.toThrow(/boom/);
  });
});

describe("listNotifications", () => {
  it("maps rows back to records, reconstructing recipient and submission", async () => {
    state.tables.notifications = {
      data: [
        {
          id: "aaaa",
          kind: "submission-received",
          recipient: "team@example.invalid",
          subject: "New mentor application",
          body: "body 1",
          submission_type: "mentor",
          submission_id: "sub-1",
          created_at: "2026-06-12T12:00:00.000Z",
        },
        {
          id: "bbbb",
          kind: "decision-email",
          recipient: "applicant@example.invalid",
          subject: "Decision",
          body: "body 2",
          submission_type: null,
          submission_id: null,
          created_at: "2026-06-11T12:00:00.000Z",
        },
      ],
      error: null,
    };

    const notifier = createSupabaseNotifier();
    const records = await notifier.listNotifications();

    expect(records).toHaveLength(2);
    expect(records[0]).toEqual({
      id: "aaaa",
      kind: "submission-received",
      to: "team@example.invalid",
      subject: "New mentor application",
      body: "body 1",
      submission: { type: "mentor", id: "sub-1" },
      createdAt: "2026-06-12T12:00:00.000Z",
    });
    expect(records[1].to).toBe("applicant@example.invalid");
    expect(records[1].submission).toBeNull();
  });

  it("filters by kind via eq", async () => {
    state.tables.notifications = { data: [], error: null };
    const notifier = createSupabaseNotifier();
    await notifier.listNotifications({ kind: "decision-email" });
    expect(state.lastEq).toEqual({ column: "kind", value: "decision-email" });
  });

  it("throws when the query returns an error", async () => {
    state.tables.notifications = { data: null, error: { message: "nope" } };
    const notifier = createSupabaseNotifier();
    await expect(notifier.listNotifications()).rejects.toThrow(/nope/);
  });
});
