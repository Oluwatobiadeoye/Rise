import type { SubmissionType } from "@/lib/types";

const SUBMISSION_TYPES: readonly SubmissionType[] = [
  "contact",
  "mentor",
  "mentee",
  "volunteer",
];

// Canonical version-4 UUID shape. The filesystem store builds record paths from
// the type and id, so an id that is not a plain UUID could escape the data root
// (path traversal). Validate both before any store call that touches the disk.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isSubmissionType(value: unknown): value is SubmissionType {
  return (
    typeof value === "string" &&
    (SUBMISSION_TYPES as readonly string[]).includes(value)
  );
}

export type SubmissionRef = { type: SubmissionType; id: string };

/**
 * Validates a submission reference taken from untrusted input (form fields,
 * route params). Returns the narrowed reference, or null when the type is not
 * one of the known unions or the id is not a UUID.
 */
export function validateSubmissionRef(
  type: unknown,
  id: unknown,
): SubmissionRef | null {
  if (!isSubmissionType(type)) return null;
  if (typeof id !== "string" || !UUID_PATTERN.test(id)) return null;
  return { type, id };
}
