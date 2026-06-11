import { cn } from "@/lib/cn";
import type { SubmissionStatus } from "@/lib/types";

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: "New",
  in_review: "In review",
  accepted: "Accepted",
  declined: "Declined",
  archived: "Archived",
};

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  new: "bg-evergreen-50 text-evergreen-700",
  in_review: "bg-gold-50 text-gold-600",
  accepted: "bg-success-tint text-success",
  declined: "bg-charcoal-50 text-danger",
  archived: "bg-charcoal-50 text-charcoal-700",
};

/** Tinted pill conveying a submission's review status. */
export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-3 py-1 font-body text-xs font-semibold",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
