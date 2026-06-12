import { isDatabaseConfigured } from "./client";
import { createDrizzleSubmissionStore } from "./drizzle";
import { createFsSubmissionStore } from "./fs";
import type { SubmissionStore } from "./types";

/**
 * The single submission store the app depends on. It uses Drizzle over a direct
 * Postgres connection when `DATABASE_URL` is configured (the durable production
 * path) and falls back to the filesystem store otherwise, so local development
 * and tests need no keys.
 */
export const db: SubmissionStore = isDatabaseConfigured()
  ? createDrizzleSubmissionStore()
  : createFsSubmissionStore();
