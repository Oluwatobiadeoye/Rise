import { isSupabaseConfigured } from "@/lib/db/supabase";
import { createFsNotifier } from "./fs";
import { createSupabaseNotifier } from "./supabase";
import type { Notifier } from "./types";

// Swap point: records to Supabase when its credentials are configured (the
// durable, queryable audit path) and falls back to the filesystem log
// otherwise, so local development and tests need no keys. A Resend-backed
// adapter would record AND deliver — both are the notifier's job.
// NotificationInput.body is plain text; any HTML-rendering adapter must escape
// interpolated applicant values (names, messages) before placing them in markup.
export const notifier: Notifier = isSupabaseConfigured()
  ? createSupabaseNotifier()
  : createFsNotifier();

/** Internal alert recipient for new-submission notifications. */
export function alertRecipient(): string {
  return process.env.RISE_NOTIFY_EMAIL ?? "tobi@example.invalid";
}
