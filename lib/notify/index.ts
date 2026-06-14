import { createDrizzleNotifier } from "./drizzle";
import type { Notifier } from "./types";

// Records notifications to Postgres via Drizzle (the durable, queryable audit
// path). A Resend-backed adapter would record AND deliver — both are the
// notifier's job. NotificationInput.body is plain text; any HTML-rendering
// adapter must escape interpolated applicant values (names, messages) before
// placing them in markup.
export const notifier: Notifier = createDrizzleNotifier();

/** Internal alert recipient for new-submission notifications. */
export function alertRecipient(): string {
  return process.env.RISE_NOTIFY_EMAIL ?? "tobi@example.invalid";
}
