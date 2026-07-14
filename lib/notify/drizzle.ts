import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { notifications } from "@/lib/db/schema";
import type {
  NotificationInput,
  NotificationKind,
  NotificationRecord,
  SubmissionType,
} from "@/lib/types";
import type { Notifier } from "./types";

type NotificationRow = typeof notifications.$inferSelect;

function rowToRecord(row: NotificationRow): NotificationRecord {
  return {
    id: row.id,
    kind: row.kind as NotificationKind,
    to: row.recipient,
    subject: row.subject,
    body: row.body,
    submission:
      row.submissionType && row.submissionId
        ? {
            type: row.submissionType as SubmissionType,
            id: row.submissionId,
          }
        : null,
    createdAt: row.createdAt,
  };
}

/**
 * Drizzle-backed {@link Notifier}. Records each notification to the
 * `notifications` table over the direct Postgres connection (which bypasses
 * Row-Level Security; RLS with no policies blocks anonymous reads). This module
 * is server-only. A future Resend adapter would record here AND deliver.
 */
export function createDrizzleNotifier(): Notifier {
  return {
    async send(input: NotificationInput): Promise<NotificationRecord> {
      const db = getDb();
      const [row] = await db
        .insert(notifications)
        .values({
          kind: input.kind,
          recipient: input.to,
          subject: input.subject,
          body: input.body,
          submissionType: input.submission?.type ?? null,
          submissionId: input.submission?.id ?? null,
        })
        .returning();
      return rowToRecord(row);
    },

    async listNotifications(filter?: {
      kind?: NotificationKind;
    }): Promise<NotificationRecord[]> {
      const db = getDb();
      const rows = await db
        .select()
        .from(notifications)
        .where(filter?.kind ? eq(notifications.kind, filter.kind) : undefined)
        .orderBy(desc(notifications.createdAt));
      return rows.map(rowToRecord);
    },
  };
}
