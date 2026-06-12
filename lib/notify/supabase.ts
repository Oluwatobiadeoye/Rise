import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  NotificationInput,
  NotificationKind,
  NotificationRecord,
  SubmissionType,
} from "@/lib/types";
import type { Notifier } from "./types";

/** A row on the `notifications` table. */
type NotificationRow = {
  id: string;
  kind: NotificationKind;
  recipient: string;
  subject: string;
  body: string;
  submission_type: SubmissionType | null;
  submission_id: string | null;
  created_at: string;
};

function rowToRecord(row: NotificationRow): NotificationRecord {
  return {
    id: row.id,
    kind: row.kind,
    to: row.recipient,
    subject: row.subject,
    body: row.body,
    submission:
      row.submission_type && row.submission_id
        ? { type: row.submission_type, id: row.submission_id }
        : null,
    createdAt: row.created_at,
  };
}

/**
 * Supabase-backed {@link Notifier}. Records each notification to the
 * `notifications` table using the service-role key, so it runs only on the
 * server and bypasses Row-Level Security (RLS on the table blocks anon reads).
 * A future Resend adapter would record here AND deliver the email.
 */
export function createSupabaseNotifier(): Notifier {
  // Created lazily so a missing key never breaks the build, only a live call.
  let cached: SupabaseClient | null = null;
  const client = (): SupabaseClient => {
    if (cached) return cached;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Supabase notifier selected but SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is unset.",
      );
    }
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return cached;
  };

  return {
    async send(input: NotificationInput): Promise<NotificationRecord> {
      const { data, error } = await client()
        .from("notifications")
        .insert({
          kind: input.kind,
          recipient: input.to,
          subject: input.subject,
          body: input.body,
          submission_type: input.submission?.type ?? null,
          submission_id: input.submission?.id ?? null,
        })
        .select()
        .single();
      if (error) {
        throw new Error(`Failed to record notification: ${error.message}`);
      }
      return rowToRecord(data as NotificationRow);
    },

    async listNotifications(filter?: {
      kind?: NotificationKind;
    }): Promise<NotificationRecord[]> {
      let query = client()
        .from("notifications")
        .select()
        .order("created_at", { ascending: false });
      if (filter?.kind) query = query.eq("kind", filter.kind);
      const { data, error } = await query;
      if (error) {
        throw new Error(`Failed to list notifications: ${error.message}`);
      }
      return (data as NotificationRow[]).map(rowToRecord);
    },
  };
}
