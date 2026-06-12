import type {
  CycleRole,
  Cycles,
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
    meta?: { from?: string | null },
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
    patch: { status?: SubmissionStatus; notes?: string },
  ): Promise<SubmissionOf<K>>;

  getCycles(): Promise<Cycles>;

  setCycle(role: CycleRole, open: boolean): Promise<Cycles>;

  /** Idempotent per role + lowercased email. */
  addNotifyMe(role: CycleRole, email: string): Promise<NotifyMeEntry>;

  listNotifyMe(role: CycleRole): Promise<NotifyMeEntry[]>;
}
