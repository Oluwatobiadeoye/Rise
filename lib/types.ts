/**
 * Shared domain types for form submissions, application cycles, and
 * notifications. Storage and notifier implementations both speak these types,
 * so swapping the filesystem backends for hosted services later does not
 * ripple through the rest of the app.
 */

export type SubmissionType = "contact" | "mentor" | "mentee" | "volunteer";

export type SubmissionStatus =
  | "new"
  | "in_review"
  | "accepted"
  | "declined"
  | "archived";

export type CycleRole = "mentor" | "mentee";

export type ContactPayload = {
  fullName: string;
  email: string;
  role: string;
  message: string;
};

export type MentorPayload = {
  fullName: string;
  email: string;
  fieldOfExpertise: string;
  audiencePreference: "tertiary" | "early-career" | "either";
  availability: string;
  message: string | null;
};

export type MenteePayload = {
  fullName: string;
  email: string;
  institution: string;
  /** Calendar date in YYYY-MM-DD form. */
  dateOfBirth: string;
  essay: string;
};

export type VolunteerPayload = {
  fullName: string;
  email: string;
  interestArea: string;
  message: string | null;
};

export type PayloadByType = {
  contact: ContactPayload;
  mentor: MentorPayload;
  mentee: MenteePayload;
  volunteer: VolunteerPayload;
};

export type Submission<T extends SubmissionType = SubmissionType> = {
  id: string;
  type: T;
  payload: PayloadByType[T];
  status: SubmissionStatus;
  notes: string;
  /** Sanitized referrer slug from the page that hosted the form, if any. */
  from: string | null;
  /** ISO 8601 timestamp. */
  createdAt: string;
  /** ISO 8601 timestamp. */
  updatedAt: string;
};

export type CycleState = {
  open: boolean;
  /** ISO 8601 timestamp of the last toggle; null until first set. */
  updatedAt: string | null;
};

export type Cycles = Record<CycleRole, CycleState>;

export type NotifyMeEntry = {
  id: string;
  role: CycleRole;
  email: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
};

export type NotificationKind = "submission-received" | "decision-email";

export type NotificationInput = {
  kind: NotificationKind;
  to: string;
  subject: string;
  body: string;
  submission: { type: SubmissionType; id: string } | null;
};

export type NotificationRecord = NotificationInput & {
  id: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
};

/**
 * Result of a form server action, consumed by `useActionState`. Field errors
 * are keyed by input name; the reserved `_form` key carries errors that do not
 * belong to a single field (rate limiting, closed cycles).
 */
export type FormState = {
  status: "idle" | "success" | "error";
  errors?: Record<string, string>;
};
