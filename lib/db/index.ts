import { createDrizzleSubmissionStore } from "./drizzle";
import type { SubmissionStore } from "./types";

/**
 * The single submission store the app depends on: Drizzle over a direct
 * Postgres connection (Supabase's transaction pooler). The connection is opened
 * lazily on first use, so a missing `DATABASE_URL` surfaces at call time, not
 * at import.
 */
export const db: SubmissionStore = createDrizzleSubmissionStore();
