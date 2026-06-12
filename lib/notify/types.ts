import type {
  NotificationInput,
  NotificationKind,
  NotificationRecord,
} from "@/lib/types";

/**
 * Notification seam. The filesystem implementation records what would be
 * sent; an email provider (e.g. Resend) can replace it by changing one line
 * in `lib/notify/index.ts`.
 */
export interface Notifier {
  send(input: NotificationInput): Promise<NotificationRecord>;
  /** Recorded notifications, newest first, optionally narrowed by kind. */
  listNotifications(filter?: {
    kind?: NotificationKind;
  }): Promise<NotificationRecord[]>;
}
