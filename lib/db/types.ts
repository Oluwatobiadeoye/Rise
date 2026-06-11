import type {
  CycleRole,
  Cycles,
  NotifyMeEntry,
  PayloadByType,
  Submission,
  SubmissionStatus,
  SubmissionType,
} from "@/lib/types";

/**
 * Persistence seam for form submissions, application cycles, and
 * notify-me signups. The filesystem implementation behind it can be swapped
 * for a hosted database (e.g. Supabase) by changing one line in
 * `lib/db/index.ts`.
 */
export interface SubmissionStore {
  createSubmission<T extends SubmissionType>(
    type: T,
    payload: PayloadByType[T],
    meta?: { from?: string | null },
  ): Promise<Submission<T>>;

  /** Lists submissions newest first, optionally filtered by type and status. */
  listSubmissions(filter?: {
    type?: SubmissionType;
    status?: SubmissionStatus;
  }): Promise<Submission[]>;

  getSubmission<T extends SubmissionType>(
    type: T,
    id: string,
  ): Promise<Submission<T> | null>;

  /** Applies the patch and bumps `updatedAt`. Throws if the submission does not exist. */
  updateSubmission<T extends SubmissionType>(
    type: T,
    id: string,
    patch: { status?: SubmissionStatus; notes?: string },
  ): Promise<Submission<T>>;

  getCycles(): Promise<Cycles>;

  setCycle(role: CycleRole, open: boolean): Promise<Cycles>;

  /** Idempotent per role + lowercased email. */
  addNotifyMe(role: CycleRole, email: string): Promise<NotifyMeEntry>;

  listNotifyMe(role: CycleRole): Promise<NotifyMeEntry[]>;
}
