/**
 * Shared domain types for form submissions, application cycles, and
 * notifications. Storage and notifier implementations both speak these types,
 * so swapping the filesystem backends for hosted services later does not
 * ripple through the rest of the app.
 */

export type SubmissionType = "contact" | "mentor" | "mentee" | "volunteer";

/**
 * Review lifecycle for the application types (mentor, mentee): they are
 * accepted or declined onto a programme.
 */
export type ApplicationStatus =
  | "pending"
  | "in_review"
  | "accepted"
  | "declined"
  | "archived";

/**
 * Review lifecycle for the always-on enquiry types (contact, volunteer):
 * they are handled and closed, never "accepted".
 */
export type EnquiryStatus = "pending" | "in_review" | "closed" | "archived";

/** Every status value, for code that handles submissions of any type. */
export type SubmissionStatus = ApplicationStatus | EnquiryStatus;

export type CycleRole = "mentor" | "mentee";

/**
 * User-supplied fields collected by each form. These are what validation
 * produces and what {@link SubmissionInput} carries into the store. `fullName`
 * and `email` are common to every type (and live on the supertype table); the
 * remaining fields are specific to each.
 */
export type ContactFields = {
  fullName: string;
  email: string;
  /** Who the enquirer is (e.g. parent, school, partner). */
  role: string;
  message: string;
};

export type MentorFields = {
  fullName: string;
  email: string;
  fieldOfExpertise: string;
  audiencePreference: "tertiary" | "early-career" | "either";
  availability: "monthly" | "fortnightly" | "flexible";
  message: string | null;
};

export type MenteeFields = {
  fullName: string;
  email: string;
  institution: string;
  /** Calendar date in YYYY-MM-DD form. */
  dateOfBirth: string;
  essay: string;
};

export type VolunteerFields = {
  fullName: string;
  email: string;
  interestArea: string;
  message: string | null;
};

export type FieldsByType = {
  contact: ContactFields;
  mentor: MentorFields;
  mentee: MenteeFields;
  volunteer: VolunteerFields;
};

/**
 * What a form contributes at creation time: the type discriminant plus its
 * fields. A discriminated union, so `input.type === "mentee"` narrows to
 * {@link MenteeFields}.
 */
export type SubmissionInput =
  | ({ type: "contact" } & ContactFields)
  | ({ type: "mentor" } & MentorFields)
  | ({ type: "mentee" } & MenteeFields)
  | ({ type: "volunteer" } & VolunteerFields);

/**
 * System-managed fields shared by every stored submission (the supertype).
 * `status` is not here because its valid values depend on the type, so it is
 * declared per variant below.
 */
export type SubmissionBase = {
  id: string;
  notes: string;
  /** Sanitized referrer slug from the page that hosted the form, if any. */
  from: string | null;
  /** ISO 8601 timestamp. */
  createdAt: string;
  /** ISO 8601 timestamp. */
  updatedAt: string;
};

/**
 * A stored submission: a discriminated union on `type`. Each variant carries
 * the shared base, its own status lifecycle, and its type-specific fields, so
 * `submission.type === "mentee"` narrows to the mentee fields and the
 * application status with no casts.
 */
export type Submission =
  | (SubmissionBase & { type: "contact"; status: EnquiryStatus } & ContactFields)
  | (SubmissionBase & { type: "mentor"; status: ApplicationStatus } & MentorFields)
  | (SubmissionBase & { type: "mentee"; status: ApplicationStatus } & MenteeFields)
  | (SubmissionBase & {
      type: "volunteer";
      status: EnquiryStatus;
    } & VolunteerFields);

/** A stored submission narrowed to one type. */
export type SubmissionOf<K extends SubmissionType> = Extract<
  Submission,
  { type: K }
>;

/**
 * Listing-level view for the admin inbox: the shared fields plus type and
 * status, no type-specific detail. Lets the inbox query the supertype table
 * without joining every detail table.
 */
export type SubmissionSummary = SubmissionBase & {
  type: SubmissionType;
  status: SubmissionStatus;
  fullName: string;
  email: string;
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
