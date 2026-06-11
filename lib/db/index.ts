import { createFsSubmissionStore } from "./fs";
import type { SubmissionStore } from "./types";

// Swap point: replace the factory call (e.g. with a Supabase-backed store)
// and the rest of the app is unaffected.
export const db: SubmissionStore = createFsSubmissionStore();
