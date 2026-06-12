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

/**
 * Persistence seam for form submissions, application cycles, and
 * notify-me signups. The filesystem implementation behind it is swapped for
 * Supabase in `lib/db/index.ts` when its keys are configured.
 */
export interface SubmissionStore {
  /** Stores a new submission and returns the complete record. */
  createSubmission(
    input: SubmissionInput,
    meta?: { from?: string | null; cycleId?: string | null },
  ): Promise<Submission>;

  /**
   * Lists submissions newest first as lightweight summaries (shared fields
   * only), optionally filtered by type and status.
   */
  listSubmissions(filter?: {
    type?: SubmissionType;
    status?: SubmissionStatus;
  }): Promise<SubmissionSummary[]>;

  /** Full submission (including type-specific fields) or null if not found. */
  getSubmission<K extends SubmissionType>(
    type: K,
    id: string,
  ): Promise<SubmissionOf<K> | null>;

  /** Applies the patch and bumps `updatedAt`. Throws if the submission does not exist. */
  updateSubmission<K extends SubmissionType>(
    type: K,
    id: string,
    patch: { status?: SubmissionOf<K>["status"]; notes?: string },
  ): Promise<SubmissionOf<K>>;

  /** All cycles (optionally for one role), newest first by `openAt` descending. */
  listCycles(role?: CycleRole): Promise<Cycle[]>;

  /**
   * The cycle for a role whose window contains the current instant
   * (`openAt <= now < closeAt`), or null if none is currently open.
   */
  getActiveCycle(role: CycleRole): Promise<Cycle | null>;

  /** Creates a cycle, stamping id and timestamps. */
  createCycle(input: CycleInput): Promise<Cycle>;

  /** Applies the patch and bumps `updatedAt`. Throws if the cycle does not exist. */
  updateCycle(
    id: string,
    patch: { label?: string; openAt?: string; closeAt?: string },
  ): Promise<Cycle>;

  /** Removes a cycle. A missing cycle is a no-op. */
  deleteCycle(id: string): Promise<void>;

  /** Idempotent per role + lowercased email. */
  addNotifyMe(role: CycleRole, email: string): Promise<NotifyMeEntry>;

  listNotifyMe(role: CycleRole): Promise<NotifyMeEntry[]>;
}
