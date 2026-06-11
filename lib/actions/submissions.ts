"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { alertRecipient, notifier } from "@/lib/notify";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  validateContact,
  validateMentee,
  validateMentor,
  validateNotifyMe,
  validateVolunteer,
  type Result,
} from "@/lib/validation";
import type {
  CycleRole,
  FormState,
  PayloadByType,
  SubmissionType,
} from "@/lib/types";

const FROM_PATTERN = /^[a-z0-9][a-z0-9-]{0,39}$/i;

const RATE_LIMIT_ERROR: FormState = {
  status: "error",
  errors: { _form: "Too many submissions. Please try again later." },
};

const CYCLE_CLOSED_ERROR: FormState = {
  status: "error",
  errors: { _form: "Applications are currently closed." },
};

/**
 * Bots fill every input; humans never see this one. A filled honeypot gets a
 * fake success so the bot has no signal it was caught, and nothing is stored.
 */
function honeypotTripped(formData: FormData): boolean {
  const value = formData.get("company");
  return typeof value === "string" && value.trim().length > 0;
}

async function clientIp(): Promise<string> {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  const first = forwardedFor?.split(",")[0]?.trim();
  return first || "local";
}

/** Keeps the referrer slug only when it looks like a safe page identifier. */
function sanitizedFrom(formData: FormData): string | null {
  const raw = formData.get("from");
  return typeof raw === "string" && FROM_PATTERN.test(raw) ? raw : null;
}

function summaryBody(
  type: SubmissionType,
  payload: Record<string, string | null>,
): string {
  const lines = Object.entries(payload).map(
    ([key, value]) => `${key}: ${value ?? ""}`,
  );
  return [`New ${type} submission received.`, "", ...lines].join("\n");
}

async function handleSubmission<T extends SubmissionType>(
  type: T,
  formData: FormData,
  validate: (formData: FormData) => Result<PayloadByType[T]>,
  cycleRole?: CycleRole,
): Promise<FormState> {
  if (honeypotTripped(formData)) return { status: "success" };

  if (!checkRateLimit(`${type}:${await clientIp()}`)) return RATE_LIMIT_ERROR;

  const result = validate(formData);
  if (!result.ok) return { status: "error", errors: result.errors };

  if (cycleRole) {
    const cycles = await db.getCycles();
    if (!cycles[cycleRole].open) return CYCLE_CLOSED_ERROR;
  }

  const submission = await db.createSubmission(type, result.data, {
    from: sanitizedFrom(formData),
  });

  try {
    await notifier.send({
      kind: "submission-received",
      to: alertRecipient(),
      subject: `New ${type} submission from ${result.data.fullName}`,
      body: summaryBody(type, result.data as Record<string, string | null>),
      submission: { type, id: submission.id },
    });
  } catch (error) {
    // The submission is already stored; a failed alert must not fail the user.
    console.error("Failed to record submission notification", error);
  }

  return { status: "success" };
}

export async function submitContact(
  prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return handleSubmission("contact", formData, validateContact);
}

export async function submitMentor(
  prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return handleSubmission("mentor", formData, validateMentor, "mentor");
}

export async function submitMentee(
  prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return handleSubmission("mentee", formData, validateMentee, "mentee");
}

export async function submitVolunteer(
  prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return handleSubmission("volunteer", formData, validateVolunteer);
}

export async function submitNotifyMe(
  prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (honeypotTripped(formData)) return { status: "success" };

  if (!checkRateLimit(`notify-me:${await clientIp()}`)) {
    return RATE_LIMIT_ERROR;
  }

  const result = validateNotifyMe(formData);
  if (!result.ok) return { status: "error", errors: result.errors };

  await db.addNotifyMe(result.data.role, result.data.email);
  return { status: "success" };
}
