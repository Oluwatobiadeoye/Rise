import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  Cycle,
  CycleInput,
  CycleRole,
  NotifyMeEntry,
  Submission,
  SubmissionInput,
  SubmissionOf,
  SubmissionStatus,
  SubmissionSummary,
  SubmissionType,
} from "@/lib/types";
import type { SubmissionStore } from "./types";

/** Whether Supabase credentials are configured (used to pick the store). */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/** Shared (supertype) columns on the `submissions` table. */
type BaseRow = {
  id: string;
  type: SubmissionType;
  full_name: string;
  email: string;
  status: SubmissionStatus;
  notes: string;
  from_ref: string | null;
  cycle_id: string | null;
  created_at: string;
  updated_at: string;
};

type CycleRow = {
  id: string;
  role: CycleRole;
  label: string;
  open_at: string;
  close_at: string;
  created_at: string;
  updated_at: string;
};
type NotifyMeRow = {
  id: string;
  role: CycleRole;
  email: string;
  created_at: string;
};

/** The detail table that holds each type's specific fields. */
const DETAIL_TABLE: Record<SubmissionType, string> = {
  contact: "contact_submissions",
  mentor: "mentor_submissions",
  mentee: "mentee_submissions",
  volunteer: "volunteer_submissions",
};

function baseToSummary(row: BaseRow): SubmissionSummary {
  return {
    id: row.id,
    type: row.type,
    fullName: row.full_name,
    email: row.email,
    status: row.status,
    notes: row.notes ?? "",
    from: row.from_ref,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Combines a base row and its detail row into the discriminated Submission. */
function assemble<K extends SubmissionType>(
  base: BaseRow,
  detail: Record<string, unknown>,
): SubmissionOf<K> {
  const common = {
    id: base.id,
    status: base.status,
    notes: base.notes ?? "",
    from: base.from_ref,
    createdAt: base.created_at,
    updatedAt: base.updated_at,
    fullName: base.full_name,
    email: base.email,
  };

  switch (base.type) {
    case "contact":
      return {
        ...common,
        type: "contact",
        role: detail.role as string,
        message: detail.message as string,
      } as SubmissionOf<K>;
    case "mentor":
      return {
        ...common,
        type: "mentor",
        cycleId: base.cycle_id,
        fieldOfExpertise: detail.field_of_expertise as string,
        audiencePreference: detail.audience_preference as "tertiary" | "early-career" | "either",
        availability: detail.availability as "monthly" | "fortnightly" | "flexible",
        message: (detail.message as string | null) ?? null,
      } as SubmissionOf<K>;
    case "mentee":
      return {
        ...common,
        type: "mentee",
        cycleId: base.cycle_id,
        institution: detail.institution as string,
        dateOfBirth: detail.date_of_birth as string,
        essay: detail.essay as string,
      } as SubmissionOf<K>;
    case "volunteer":
      return {
        ...common,
        type: "volunteer",
        interestArea: detail.interest_area as string,
        message: (detail.message as string | null) ?? null,
      } as SubmissionOf<K>;
  }
}

/** Maps a SubmissionInput to the typed parameters of the create_submission RPC. */
function rpcParams(
  input: SubmissionInput,
  from: string | null,
  cycleId: string | null,
) {
  const params: Record<string, unknown> = {
    p_type: input.type,
    p_full_name: input.fullName,
    p_email: input.email,
    p_from_ref: from,
    p_cycle_id: cycleId,
  };
  switch (input.type) {
    case "contact":
      params.p_contact_role = input.role;
      params.p_contact_message = input.message;
      break;
    case "mentor":
      params.p_mentor_field = input.fieldOfExpertise;
      params.p_mentor_audience = input.audiencePreference;
      params.p_mentor_availability = input.availability;
      params.p_mentor_message = input.message;
      break;
    case "mentee":
      params.p_mentee_institution = input.institution;
      params.p_mentee_dob = input.dateOfBirth;
      params.p_mentee_essay = input.essay;
      break;
    case "volunteer":
      params.p_volunteer_interest = input.interestArea;
      params.p_volunteer_message = input.message;
      break;
  }
  return params;
}

function rowToCycle(row: CycleRow): Cycle {
  return {
    id: row.id,
    role: row.role,
    label: row.label,
    openAt: row.open_at,
    closeAt: row.close_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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

  async function getOne<K extends SubmissionType>(
    type: K,
    id: string,
  ): Promise<SubmissionOf<K> | null> {
    const { data: base, error: baseError } = await client()
      .from("submissions")
      .select()
      .eq("id", id)
      .eq("type", type)
      .maybeSingle();
    if (baseError) throw new Error(`Failed to read submission: ${baseError.message}`);
    if (!base) return null;

    const { data: detail, error: detailError } = await client()
      .from(DETAIL_TABLE[type])
      .select()
      .eq("submission_id", id)
      .maybeSingle();
    if (detailError) {
      throw new Error(`Failed to read submission detail: ${detailError.message}`);
    }
    return assemble<K>(base as BaseRow, (detail as Record<string, unknown>) ?? {});
  }

  return {
    async createSubmission(
      input: SubmissionInput,
      meta?: { from?: string | null; cycleId?: string | null },
    ): Promise<Submission> {
      const { data: newId, error } = await client().rpc(
        "create_submission",
        rpcParams(input, meta?.from ?? null, meta?.cycleId ?? null),
      );
      if (error) throw new Error(`Failed to create submission: ${error.message}`);
      const created = await getOne(input.type, newId as string);
      if (!created) {
        throw new Error("Submission was created but could not be read back.");
      }
      return created;
    },

    async listSubmissions(filter?: {
      type?: SubmissionType;
      status?: SubmissionStatus;
    }): Promise<SubmissionSummary[]> {
      let query = client()
        .from("submissions")
        .select()
        .order("created_at", { ascending: false })
        .order("id", { ascending: true });
      if (filter?.type) query = query.eq("type", filter.type);
      if (filter?.status) query = query.eq("status", filter.status);
      const { data, error } = await query;
      if (error) throw new Error(`Failed to list submissions: ${error.message}`);
      return (data as BaseRow[]).map(baseToSummary);
    },

    getSubmission: getOne,

    async updateSubmission<K extends SubmissionType>(
      type: K,
      id: string,
      patch: { status?: SubmissionOf<K>["status"]; notes?: string },
    ): Promise<SubmissionOf<K>> {
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

      const full = await getOne(type, id);
      if (!full) throw new Error(`Submission not found: ${type}/${id}`);
      return full;
    },

    async listCycles(role?: CycleRole): Promise<Cycle[]> {
      let query = client()
        .from("cycles")
        .select()
        .order("open_at", { ascending: false });
      if (role) query = query.eq("role", role);
      const { data, error } = await query;
      if (error) throw new Error(`Failed to list cycles: ${error.message}`);
      return (data as CycleRow[]).map(rowToCycle);
    },

    async getActiveCycle(role: CycleRole): Promise<Cycle | null> {
      const nowIso = new Date().toISOString();
      const { data, error } = await client()
        .from("cycles")
        .select()
        .eq("role", role)
        .lte("open_at", nowIso)
        .gt("close_at", nowIso)
        .order("open_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(`Failed to read active cycle: ${error.message}`);
      return data ? rowToCycle(data as CycleRow) : null;
    },

    async createCycle(input: CycleInput): Promise<Cycle> {
      const { data, error } = await client()
        .from("cycles")
        .insert({
          role: input.role,
          label: input.label,
          open_at: input.openAt,
          close_at: input.closeAt,
        })
        .select()
        .single();
      if (error) throw new Error(`Failed to create cycle: ${error.message}`);
      return rowToCycle(data as CycleRow);
    },

    async updateCycle(
      id: string,
      patch: { label?: string; openAt?: string; closeAt?: string },
    ): Promise<Cycle> {
      const update: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (patch.label !== undefined) update.label = patch.label;
      if (patch.openAt !== undefined) update.open_at = patch.openAt;
      if (patch.closeAt !== undefined) update.close_at = patch.closeAt;

      const { data, error } = await client()
        .from("cycles")
        .update(update)
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) throw new Error(`Failed to update cycle: ${error.message}`);
      if (!data) throw new Error(`Cycle not found: ${id}`);
      return rowToCycle(data as CycleRow);
    },

    async deleteCycle(id: string): Promise<void> {
      const { error } = await client().from("cycles").delete().eq("id", id);
      if (error) throw new Error(`Failed to delete cycle: ${error.message}`);
    },

    async addNotifyMe(role: CycleRole, email: string): Promise<NotifyMeEntry> {
      const normalized = email.trim().toLowerCase();
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
