import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { cn } from "@/lib/cn";
import { notifier } from "@/lib/notify";
import type { NotificationKind } from "@/lib/types";

export const dynamic = "force-dynamic";

const KIND_LABELS: Record<NotificationKind, string> = {
  "submission-received": "submission alert",
  "decision-email": "decision email",
};

const KIND_STYLES: Record<NotificationKind, string> = {
  "submission-received": "bg-evergreen-50 text-evergreen-700",
  "decision-email": "bg-gold-50 text-gold-600",
};

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminNotificationsPage() {
  await requireAdmin();

  const notifications = await notifier.listNotifications();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Notifications
        </h1>
        <p className="mt-2 font-body text-sm text-muted">
          {notifications.length} record
          {notifications.length === 1 ? "" : "s"}.
        </p>
      </div>

      {notifications.length === 0 ? (
        <p className="rounded-md border border-line bg-surface px-5 py-6 font-body text-sm text-muted">
          No notifications recorded yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full border-collapse text-left font-body text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-sunk text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Sent</th>
                <th className="px-4 py-3 font-semibold">Kind</th>
                <th className="px-4 py-3 font-semibold">Recipient</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Submission</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr
                  key={notification.id}
                  className="border-b border-line last:border-0 hover:bg-surface-sunk"
                >
                  <td className="px-4 py-3 text-muted">
                    {formatDateTime(notification.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-pill px-3 py-1 font-body text-xs font-semibold",
                        KIND_STYLES[notification.kind],
                      )}
                    >
                      {KIND_LABELS[notification.kind]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink">{notification.to}</td>
                  <td className="px-4 py-3 text-muted">
                    {notification.subject}
                  </td>
                  <td className="px-4 py-3">
                    {notification.submission ? (
                      <Link
                        href={`/admin/submissions/${notification.submission.type}/${notification.submission.id}`}
                        className="font-semibold capitalize text-primary hover:text-primary-press"
                      >
                        {notification.submission.type}
                      </Link>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
