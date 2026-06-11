import type { NotificationInput, NotificationRecord } from "@/lib/types";

/**
 * Notification seam. The filesystem implementation records what would be
 * sent; an email provider (e.g. Resend) can replace it by changing one line
 * in `lib/notify/index.ts`.
 */
export interface Notifier {
  send(input: NotificationInput): Promise<NotificationRecord>;
}
