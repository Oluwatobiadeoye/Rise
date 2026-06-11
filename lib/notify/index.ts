import { createFsNotifier } from "./fs";
import type { Notifier } from "./types";

// Swap point: replace the factory call (e.g. with a Resend-backed notifier)
// and the rest of the app is unaffected.
export const notifier: Notifier = createFsNotifier();

/** Internal alert recipient for new-submission notifications. */
export function alertRecipient(): string {
  return process.env.RISE_NOTIFY_EMAIL ?? "tobi@example.invalid";
}
