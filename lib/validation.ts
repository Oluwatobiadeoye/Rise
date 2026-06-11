import type {
  ContactPayload,
  CycleRole,
  MenteePayload,
  MentorPayload,
  VolunteerPayload,
} from "@/lib/types";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

const MAX_FIELD_LENGTH = 200;
const MAX_LONG_TEXT_LENGTH = 5000;
const MAX_EMAIL_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Record<string, string>;

function rawString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function requiredString(
  formData: FormData,
  name: string,
  errors: Errors,
  options: { message: string; maxLength?: number },
): string {
  const maxLength = options.maxLength ?? MAX_FIELD_LENGTH;
  const value = rawString(formData, name);
  if (!value) {
    errors[name] = options.message;
  } else if (value.length > maxLength) {
    errors[name] = `Please keep this under ${maxLength} characters.`;
  }
  return value;
}

function optionalString(
  formData: FormData,
  name: string,
  errors: Errors,
  options: { maxLength?: number } = {},
): string | null {
  const maxLength = options.maxLength ?? MAX_LONG_TEXT_LENGTH;
  const value = rawString(formData, name);
  if (!value) return null;
  if (value.length > maxLength) {
    errors[name] = `Please keep this under ${maxLength} characters.`;
  }
  return value;
}

function email(formData: FormData, name: string, errors: Errors): string {
  const value = rawString(formData, name).toLowerCase();
  if (!value) {
    errors[name] = "Please enter your email address.";
  } else if (value.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(value)) {
    errors[name] = "Please enter a valid email address.";
  }
  return value;
}

function oneOf<T extends string>(
  formData: FormData,
  name: string,
  allowed: readonly T[],
  errors: Errors,
  message: string,
): T {
  const value = rawString(formData, name);
  if (!allowed.includes(value as T)) {
    errors[name] = message;
  }
  return value as T;
}

/** Validates a YYYY-MM-DD string as a real calendar date that is not in the future. */
function dateYmd(
  formData: FormData,
  name: string,
  errors: Errors,
  message: string,
): string {
  const value = rawString(formData, name);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    errors[name] = message;
    return value;
  }
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  if (!isRealDate) {
    errors[name] = message;
  } else if (date.getTime() > Date.now()) {
    errors[name] = "Date of birth cannot be in the future.";
  }
  return value;
}

function toResult<T>(errors: Errors, data: T): Result<T> {
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, data };
}

export function validateContact(formData: FormData): Result<ContactPayload> {
  const errors: Errors = {};
  const data: ContactPayload = {
    fullName: requiredString(formData, "fullName", errors, {
      message: "Please enter your full name.",
    }),
    email: email(formData, "email", errors),
    role: requiredString(formData, "role", errors, {
      message: "Please tell us who you are.",
    }),
    message: requiredString(formData, "message", errors, {
      message: "Please enter a message.",
      maxLength: MAX_LONG_TEXT_LENGTH,
    }),
  };
  return toResult(errors, data);
}

export function validateMentor(formData: FormData): Result<MentorPayload> {
  const errors: Errors = {};
  const data: MentorPayload = {
    fullName: requiredString(formData, "fullName", errors, {
      message: "Please enter your full name.",
    }),
    email: email(formData, "email", errors),
    fieldOfExpertise: requiredString(formData, "fieldOfExpertise", errors, {
      message: "Please enter your field of expertise.",
    }),
    audiencePreference: oneOf(
      formData,
      "audiencePreference",
      ["tertiary", "early-career", "either"] as const,
      errors,
      "Please choose who you would like to mentor.",
    ),
    availability: oneOf(
      formData,
      "availability",
      ["monthly", "fortnightly", "flexible"] as const,
      errors,
      "Please choose how often you can meet.",
    ),
    message: optionalString(formData, "message", errors),
  };
  return toResult(errors, data);
}

export function validateMentee(formData: FormData): Result<MenteePayload> {
  const errors: Errors = {};
  const data: MenteePayload = {
    fullName: requiredString(formData, "fullName", errors, {
      message: "Please enter your full name.",
    }),
    email: email(formData, "email", errors),
    institution: requiredString(formData, "institution", errors, {
      message: "Please enter your institution.",
    }),
    dateOfBirth: dateYmd(
      formData,
      "dateOfBirth",
      errors,
      "Please enter a valid date of birth.",
    ),
    essay: requiredString(formData, "essay", errors, {
      message: "Please enter your short essay.",
      maxLength: MAX_LONG_TEXT_LENGTH,
    }),
  };
  return toResult(errors, data);
}

export function validateVolunteer(formData: FormData): Result<VolunteerPayload> {
  const errors: Errors = {};
  const data: VolunteerPayload = {
    fullName: requiredString(formData, "fullName", errors, {
      message: "Please enter your full name.",
    }),
    email: email(formData, "email", errors),
    interestArea: requiredString(formData, "interestArea", errors, {
      message: "Please choose an area of interest.",
    }),
    message: optionalString(formData, "message", errors),
  };
  return toResult(errors, data);
}

export function validateNotifyMe(
  formData: FormData,
): Result<{ role: CycleRole; email: string }> {
  const errors: Errors = {};
  const data = {
    role: oneOf(
      formData,
      "role",
      ["mentor", "mentee"] as const,
      errors,
      "Please choose a role.",
    ),
    email: email(formData, "email", errors),
  };
  return toResult(errors, data);
}
