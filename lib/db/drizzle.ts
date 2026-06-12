import "server-only";

import { and, asc, desc, eq, isNull, or, sql } from "drizzle-orm";
import type {
  Admin,
  AdminInput,
  AdminRecord,
  AdminRole,
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
import { getDb } from "./client";
import {
  admins,
  contactSubmissions,
  cycles,
  menteeSubmissions,
  mentorSubmissions,
  notifyMe,
  submissions,
  volunteerSubmissions,
} from "./schema";
import type { SubmissionStore } from "./types";

/** Shape selected from the `submissions` supertype row. */
type BaseRow = typeof submissions.$inferSelect;
type CycleRow = typeof cycles.$inferSelect;
type NotifyMeRow = typeof notifyMe.$inferSelect;
type AdminRow = typeof admins.$inferSelect;

function rowToAdmin(row: AdminRow): Admin {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    name: row.name,
    role: row.role as AdminRole,
    active: row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** The detail table that holds each type's specific fields. */
const DETAIL_TABLE = {
  contact: contactSubmissions,
  mentor: mentorSubmissions,
  mentee: menteeSubmissions,
  volunteer: volunteerSubmissions,
} as const;

function baseToSummary(row: BaseRow): SubmissionSummary {
  return {
    id: row.id,
    type: row.type as SubmissionType,
    fullName: row.fullName,
    email: row.email,
    status: row.status,
    notes: row.notes ?? "",
    from: row.fromRef,
    reviewedBy: row.reviewedBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
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
    from: base.fromRef,
    reviewedBy: base.reviewedBy,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
    fullName: base.fullName,
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
        cycleId: base.cycleId,
        fieldOfExpertise: detail.fieldOfExpertise as string,
        audiencePreference: detail.audiencePreference as
          | "tertiary"
          | "early-career"
          | "either",
        availability: detail.availability as
          | "monthly"
          | "fortnightly"
          | "flexible",
        message: (detail.message as string | null) ?? null,
      } as SubmissionOf<K>;
    case "mentee":
      return {
        ...common,
        type: "mentee",
        cycleId: base.cycleId,
        institution: detail.institution as string,
        dateOfBirth: detail.dateOfBirth as string,
        essay: detail.essay as string,
      } as SubmissionOf<K>;
    default:
      return {
        ...common,
        type: "volunteer",
        interestArea: detail.interestArea as string,
        message: (detail.message as string | null) ?? null,
      } as SubmissionOf<K>;
  }
}

function rowToCycle(row: CycleRow): Cycle {
  return {
    id: row.id,
    role: row.role as CycleRole,
    label: row.label,
    openAt: row.openAt,
    closeAt: row.closeAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function rowToNotifyMe(row: NotifyMeRow): NotifyMeEntry {
  return {
    id: row.id,
    role: row.role as CycleRole,
    email: row.email,
    createdAt: row.createdAt,
  };
}

/**
 * Drizzle-backed {@link SubmissionStore} over a direct Postgres connection
 * (Supabase's transaction pooler). The connection bypasses Row-Level Security;
 * RLS on the tables (no policies) blocks any anonymous/public access path. This
 * module is server-only, so the connection string never reaches the client.
 */
export function createDrizzleSubmissionStore(): SubmissionStore {
  async function getOne<K extends SubmissionType>(
    type: K,
    id: string,
  ): Promise<SubmissionOf<K> | null> {
    const db = getDb();
    const [base] = await db
      .select()
      .from(submissions)
      .where(and(eq(submissions.id, id), eq(submissions.type, type)))
      .limit(1);
    if (!base) return null;

    // The union of detail tables defeats select().from() inference; the result
    // is cast to a record either way, so a single concrete table type is used.
    const detailTable = DETAIL_TABLE[type] as typeof contactSubmissions;
    const [detail] = await db
      .select()
      .from(detailTable)
      .where(eq(detailTable.submissionId, id))
      .limit(1);
    return assemble<K>(base, (detail as Record<string, unknown>) ?? {});
  }

  return {
    async createSubmission(
      input: SubmissionInput,
      meta?: { from?: string | null; cycleId?: string | null },
    ): Promise<Submission> {
      const db = getDb();
      const from = meta?.from ?? null;
      const cycleId =
        input.type === "mentor" || input.type === "mentee"
          ? (meta?.cycleId ?? null)
          : null;

      const created = await db.transaction(async (tx) => {
        const [base] = await tx
          .insert(submissions)
          .values({
            type: input.type,
            fullName: input.fullName,
            email: input.email,
            fromRef: from,
            cycleId,
          })
          .returning();

        switch (input.type) {
          case "contact":
            await tx.insert(contactSubmissions).values({
              submissionId: base.id,
              role: input.role,
              message: input.message,
            });
            break;
          case "mentor":
            await tx.insert(mentorSubmissions).values({
              submissionId: base.id,
              fieldOfExpertise: input.fieldOfExpertise,
              audiencePreference: input.audiencePreference,
              availability: input.availability,
              message: input.message,
            });
            break;
          case "mentee":
            await tx.insert(menteeSubmissions).values({
              submissionId: base.id,
              institution: input.institution,
              dateOfBirth: input.dateOfBirth,
              essay: input.essay,
            });
            break;
          case "volunteer":
            await tx.insert(volunteerSubmissions).values({
              submissionId: base.id,
              interestArea: input.interestArea,
              message: input.message,
            });
            break;
        }
        return base;
      });

      const full = await getOne(input.type, created.id);
      if (!full) {
        throw new Error("Submission was created but could not be read back.");
      }
      return full;
    },

    async listSubmissions(filter?: {
      type?: SubmissionType;
      status?: SubmissionStatus;
    }): Promise<SubmissionSummary[]> {
      const db = getDb();
      const conditions = [];
      if (filter?.type) conditions.push(eq(submissions.type, filter.type));
      if (filter?.status) conditions.push(eq(submissions.status, filter.status));
      const rows = await db
        .select()
        .from(submissions)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(submissions.createdAt), asc(submissions.id));
      return rows.map(baseToSummary);
    },

    getSubmission: getOne,

    async updateSubmission<K extends SubmissionType>(
      type: K,
      id: string,
      patch: { status?: SubmissionOf<K>["status"]; notes?: string },
    ): Promise<SubmissionOf<K>> {
      const db = getDb();
      const update: {
        updatedAt: string;
        status?: SubmissionStatus;
        notes?: string;
      } = { updatedAt: new Date().toISOString() };
      if (patch.status !== undefined) update.status = patch.status;
      if (patch.notes !== undefined) update.notes = patch.notes;

      const updated = await db
        .update(submissions)
        .set(update)
        .where(and(eq(submissions.id, id), eq(submissions.type, type)))
        .returning();
      if (updated.length === 0) {
        throw new Error(`Submission not found: ${type}/${id}`);
      }

      const full = await getOne(type, id);
      if (!full) throw new Error(`Submission not found: ${type}/${id}`);
      return full;
    },

    async listCycles(role?: CycleRole): Promise<Cycle[]> {
      const db = getDb();
      const rows = await db
        .select()
        .from(cycles)
        .where(role ? eq(cycles.role, role) : undefined)
        .orderBy(desc(cycles.openAt));
      return rows.map(rowToCycle);
    },

    async getActiveCycle(role: CycleRole): Promise<Cycle | null> {
      const db = getDb();
      const [row] = await db
        .select()
        .from(cycles)
        .where(
          and(
            eq(cycles.role, role),
            sql`${cycles.openAt} <= now()`,
            sql`${cycles.closeAt} > now()`,
          ),
        )
        .orderBy(desc(cycles.openAt))
        .limit(1);
      return row ? rowToCycle(row) : null;
    },

    async createCycle(input: CycleInput): Promise<Cycle> {
      const db = getDb();
      const [row] = await db
        .insert(cycles)
        .values({
          role: input.role,
          label: input.label,
          openAt: input.openAt,
          closeAt: input.closeAt,
        })
        .returning();
      return rowToCycle(row);
    },

    async updateCycle(
      id: string,
      patch: { label?: string; openAt?: string; closeAt?: string },
    ): Promise<Cycle> {
      const db = getDb();
      const update: {
        updatedAt: string;
        label?: string;
        openAt?: string;
        closeAt?: string;
      } = { updatedAt: new Date().toISOString() };
      if (patch.label !== undefined) update.label = patch.label;
      if (patch.openAt !== undefined) update.openAt = patch.openAt;
      if (patch.closeAt !== undefined) update.closeAt = patch.closeAt;

      const rows = await db
        .update(cycles)
        .set(update)
        .where(eq(cycles.id, id))
        .returning();
      if (rows.length === 0) throw new Error(`Cycle not found: ${id}`);
      return rowToCycle(rows[0]);
    },

    async deleteCycle(id: string): Promise<void> {
      const db = getDb();
      await db.delete(cycles).where(eq(cycles.id, id));
    },

    async addNotifyMe(role: CycleRole, email: string): Promise<NotifyMeEntry> {
      const db = getDb();
      const normalized = email.trim().toLowerCase();
      await db
        .insert(notifyMe)
        .values({ role, email: normalized })
        .onConflictDoNothing({ target: [notifyMe.role, notifyMe.email] });

      const [row] = await db
        .select()
        .from(notifyMe)
        .where(and(eq(notifyMe.role, role), eq(notifyMe.email, normalized)))
        .limit(1);
      return rowToNotifyMe(row);
    },

    async listNotifyMe(role: CycleRole): Promise<NotifyMeEntry[]> {
      const db = getDb();
      const rows = await db
        .select()
        .from(notifyMe)
        .where(eq(notifyMe.role, role))
        .orderBy(desc(notifyMe.createdAt));
      return rows.map(rowToNotifyMe);
    },

    async createAdmin(input: AdminInput): Promise<Admin> {
      const db = getDb();
      try {
        const [row] = await db
          .insert(admins)
          .values({
            username: input.username.trim(),
            email: input.email.trim().toLowerCase(),
            name: input.name.trim(),
            role: input.role,
            passwordHash: input.passwordHash,
          })
          .returning();
        return rowToAdmin(row);
      } catch (error) {
        // Postgres unique_violation; surface a clear, non-leaky message.
        if ((error as { code?: string }).code === "23505") {
          throw new Error("An admin with that username or email already exists.");
        }
        throw error;
      }
    },

    async getAdminByIdentifier(
      identifier: string,
    ): Promise<AdminRecord | null> {
      const db = getDb();
      const trimmed = identifier.trim();
      if (!trimmed) return null;
      const lowered = trimmed.toLowerCase();
      const [row] = await db
        .select()
        .from(admins)
        .where(
          or(
            eq(admins.username, trimmed),
            eq(sql`lower(${admins.email})`, lowered),
          ),
        )
        .limit(1);
      if (!row) return null;
      return { ...rowToAdmin(row), passwordHash: row.passwordHash };
    },

    async getAdminById(id: string): Promise<Admin | null> {
      const db = getDb();
      const [row] = await db
        .select()
        .from(admins)
        .where(eq(admins.id, id))
        .limit(1);
      return row ? rowToAdmin(row) : null;
    },

    async listAdmins(): Promise<Admin[]> {
      const db = getDb();
      const rows = await db
        .select()
        .from(admins)
        .orderBy(desc(admins.createdAt), asc(admins.id));
      return rows.map(rowToAdmin);
    },

    async updateAdmin(
      id: string,
      patch: { name?: string; role?: AdminRole; passwordHash?: string },
    ): Promise<Admin> {
      const db = getDb();
      const update: {
        updatedAt: string;
        name?: string;
        role?: AdminRole;
        passwordHash?: string;
      } = { updatedAt: new Date().toISOString() };
      if (patch.name !== undefined) update.name = patch.name.trim();
      if (patch.role !== undefined) update.role = patch.role;
      if (patch.passwordHash !== undefined) {
        update.passwordHash = patch.passwordHash;
      }

      const rows = await db
        .update(admins)
        .set(update)
        .where(eq(admins.id, id))
        .returning();
      if (rows.length === 0) throw new Error(`Admin not found: ${id}`);
      return rowToAdmin(rows[0]);
    },

    async setAdminActive(id: string, active: boolean): Promise<Admin> {
      const db = getDb();
      const rows = await db
        .update(admins)
        .set({ active, updatedAt: new Date().toISOString() })
        .where(eq(admins.id, id))
        .returning();
      if (rows.length === 0) throw new Error(`Admin not found: ${id}`);
      return rowToAdmin(rows[0]);
    },

    async deleteAdmin(id: string): Promise<void> {
      const db = getDb();
      await db.delete(admins).where(eq(admins.id, id));
    },

    async claimSubmission<K extends SubmissionType>(
      type: K,
      id: string,
      adminId: string,
    ): Promise<SubmissionOf<K> | null> {
      const db = getDb();
      // Atomic: the WHERE guard means at most one concurrent caller flips an
      // unclaimed row. A row already held by the same admin also matches
      // (idempotent); a row held by another admin matches nothing -> null.
      const updated = await db
        .update(submissions)
        .set({ reviewedBy: adminId, updatedAt: new Date().toISOString() })
        .where(
          and(
            eq(submissions.id, id),
            eq(submissions.type, type),
            or(isNull(submissions.reviewedBy), eq(submissions.reviewedBy, adminId)),
          ),
        )
        .returning({ id: submissions.id });
      if (updated.length === 0) return null;
      return getOne(type, id);
    },

    async releaseSubmission(
      type: SubmissionType,
      id: string,
      adminId: string,
      opts?: { force?: boolean },
    ): Promise<void> {
      const db = getDb();
      const holderGuard = opts?.force
        ? undefined
        : eq(submissions.reviewedBy, adminId);
      await db
        .update(submissions)
        .set({ reviewedBy: null, updatedAt: new Date().toISOString() })
        .where(
          and(
            eq(submissions.id, id),
            eq(submissions.type, type),
            ...(holderGuard ? [holderGuard] : []),
          ),
        );
    },
  };
}
