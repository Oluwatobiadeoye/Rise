import { createFsSubmissionStore } from "./fs";
import { createSupabaseSubmissionStore, isSupabaseConfigured } from "./supabase";
import type { SubmissionStore } from "./types";

/**
 * The single submission store the app depends on. It uses Supabase when its
 * credentials are configured (the durable production path) and falls back to
 * the filesystem store otherwise, so local development and tests need no keys.
 */
export const db: SubmissionStore = isSupabaseConfigured()
  ? createSupabaseSubmissionStore()
  : createFsSubmissionStore();
