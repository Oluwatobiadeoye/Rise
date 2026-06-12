import type {
  ApplicationStatus,
  EnquiryStatus,
  SubmissionStatus,
  SubmissionType,
} from "@/lib/types";

/** Display labels for every status across both lifecycles. */
export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: "Pending",
  in_review: "In review",
  accepted: "Accepted",
  declined: "Declined",
  closed: "Closed",
  archived: "Archived",
};

const APPLICATION_STATUSES: readonly ApplicationStatus[] = [
  "pending",
  "in_review",
  "accepted",
  "declined",
  "archived",
];

const ENQUIRY_STATUSES: readonly EnquiryStatus[] = [
  "pending",
  "in_review",
  "closed",
  "archived",
];

/** Every status value (for dashboard counts and list filters). */
export const ALL_STATUSES: readonly SubmissionStatus[] = [
  "pending",
  "in_review",
  "accepted",
  "declined",
  "closed",
  "archived",
];

// Once a submission reaches one of these it is finalized: the review is over,
// so it stays attributed to whoever handled it (no release).
const TERMINAL_STATUSES: readonly SubmissionStatus[] = [
  "accepted",
  "declined",
  "closed",
  "archived",
];

/** Whether a status is a finalized/terminal state (review complete). */
export function isTerminalStatus(status: SubmissionStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/** The statuses valid for a given submission type. */
export function statusesForType(
  type: SubmissionType,
): readonly SubmissionStatus[] {
  return type === "mentor" || type === "mentee"
    ? APPLICATION_STATUSES
    : ENQUIRY_STATUSES;
}

/** Whether a value is a status valid for the given type. */
export function isStatusForType(
  type: SubmissionType,
  value: unknown,
): value is SubmissionStatus {
  return (
    typeof value === "string" &&
    (statusesForType(type) as readonly string[]).includes(value)
  );
}
