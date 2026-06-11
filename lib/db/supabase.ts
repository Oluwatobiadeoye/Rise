import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  CycleRole,
  Cycles,
  NotifyMeEntry,
  PayloadByType,
  Submission,
  SubmissionStatus,
  SubmissionType,
} from "@/lib/types";
import type { SubmissionStore } from "./types";

/** Whether Supabase credentials are configured (used to pick the store). */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/** Row shapes as stored. Snake_case columns map to the camelCase domain types. */
type SubmissionRow = {
  id: string;
  type: SubmissionType;
  payload: PayloadByType[SubmissionType];
  status: SubmissionStatus;
  notes: string;
  from_ref: string | null;
  created_at: string;
  updated_at: string;
};

type CycleRow = { role: CycleRole; open: boolean; updated_at: string | null };
type NotifyMeRow = {
  id: string;
  role: CycleRole;
  email: string;
  created_at: string;
};

function toSubmission<T extends SubmissionType>(row: SubmissionRow): Submission<T> {
  return {
    id: row.id,
    type: row.type as T,
    payload: row.payload as PayloadByType[T],
    status: row.status,
    notes: row.notes ?? "",
    from: row.from_ref,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function defaultCycles(): Cycles {
  return {
    mentor: { open: false, updatedAt: null },
    mentee: { open: false, updatedAt: null },
  };
}

/**
 * Supabase-backed {@link SubmissionStore}. Uses the service-role key, so it
 * runs only on the server and bypasses Row-Level Security; RLS on the tables
 * blocks anonymous/client reads (see supabase/schema.sql). The key is never
 * exposed to the client because this module is server-only.
 */
export function createSupabaseSubmissionStore(): SubmissionStore {
  // Created lazily so a missing key never breaks the build, only a live call.
  let cached: SupabaseClient | null = null;
  const client = (): SupabaseClient => {
    if (cached) return cached;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Supabase store selected but SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is unset.",
      );
    }
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return cached;
  };

  return {
    async createSubmission<T extends SubmissionType>(
      type: T,
      payload: PayloadByType[T],
      meta?: { from?: string | null },
    ): Promise<Submission<T>> {
      const { data, error } = await client()
        .from("submissions")
        .insert({
          type,
          payload,
          status: "new",
          notes: "",
          from_ref: meta?.from ?? null,
        })
        .select()
        .single();
      if (error) throw new Error(`Failed to create submission: ${error.message}`);
      return toSubmission<T>(data as SubmissionRow);
    },

    async listSubmissions(filter?: {
      type?: SubmissionType;
      status?: SubmissionStatus;
    }): Promise<Submission[]> {
      let query = client()
        .from("submissions")
        .select()
        .order("created_at", { ascending: false })
        .order("id", { ascending: true });
      if (filter?.type) query = query.eq("type", filter.type);
      if (filter?.status) query = query.eq("status", filter.status);
      const { data, error } = await query;
      if (error) throw new Error(`Failed to list submissions: ${error.message}`);
      return (data as SubmissionRow[]).map((row) => toSubmission(row));
    },

    async getSubmission<T extends SubmissionType>(
      type: T,
      id: string,
    ): Promise<Submission<T> | null> {
      const { data, error } = await client()
        .from("submissions")
        .select()
        .eq("type", type)
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(`Failed to read submission: ${error.message}`);
      return data ? toSubmission<T>(data as SubmissionRow) : null;
    },

    async updateSubmission<T extends SubmissionType>(
      type: T,
      id: string,
      patch: { status?: SubmissionStatus; notes?: string },
    ): Promise<Submission<T>> {
      const update: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (patch.status !== undefined) update.status = patch.status;
      if (patch.notes !== undefined) update.notes = patch.notes;

      const { data, error } = await client()
        .from("submissions")
        .update(update)
        .eq("type", type)
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) throw new Error(`Failed to update submission: ${error.message}`);
      if (!data) throw new Error(`Submission not found: ${type}/${id}`);
      return toSubmission<T>(data as SubmissionRow);
    },

    async getCycles(): Promise<Cycles> {
      const { data, error } = await client().from("cycles").select();
      if (error) throw new Error(`Failed to read cycles: ${error.message}`);
      const cycles = defaultCycles();
      for (const row of (data as CycleRow[]) ?? []) {
        if (row.role === "mentor" || row.role === "mentee") {
          cycles[row.role] = { open: row.open, updatedAt: row.updated_at };
        }
      }
      return cycles;
    },

    async setCycle(role: CycleRole, open: boolean): Promise<Cycles> {
      const { error } = await client()
        .from("cycles")
        .upsert(
          { role, open, updated_at: new Date().toISOString() },
          { onConflict: "role" },
        );
      if (error) throw new Error(`Failed to set cycle: ${error.message}`);
      return this.getCycles();
    },

    async addNotifyMe(role: CycleRole, email: string): Promise<NotifyMeEntry> {
      const normalized = email.trim().toLowerCase();
      // Idempotent per (role, email): the unique index turns a repeat into a
      // no-op, then we read the existing row back.
      const { error } = await client()
        .from("notify_me")
        .upsert(
          { role, email: normalized },
          { onConflict: "role,email", ignoreDuplicates: true },
        );
      if (error) throw new Error(`Failed to add notify-me: ${error.message}`);

      const { data, error: readError } = await client()
        .from("notify_me")
        .select()
        .eq("role", role)
        .eq("email", normalized)
        .single();
      if (readError) {
        throw new Error(`Failed to read notify-me: ${readError.message}`);
      }
      const row = data as NotifyMeRow;
      return {
        id: row.id,
        role: row.role,
        email: row.email,
        createdAt: row.created_at,
      };
    },

    async listNotifyMe(role: CycleRole): Promise<NotifyMeEntry[]> {
      const { data, error } = await client()
        .from("notify_me")
        .select()
        .eq("role", role)
        .order("created_at", { ascending: false });
      if (error) throw new Error(`Failed to list notify-me: ${error.message}`);
      return (data as NotifyMeRow[]).map((row) => ({
        id: row.id,
        role: row.role,
        email: row.email,
        createdAt: row.created_at,
      }));
    },
  };
}
