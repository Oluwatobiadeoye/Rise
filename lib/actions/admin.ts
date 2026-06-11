"use server";

import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  ADMIN_SESSION_COOKIE,
  assertAdmin,
  createSessionToken,
  isAdminConfigured,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/admin/auth";
import { validateSubmissionRef } from "@/lib/admin/ref";
import { db } from "@/lib/db";
import { notifier } from "@/lib/notify";
import { checkRateLimit } from "@/lib/rate-limit";
import type {
  CycleRole,
  SubmissionStatus,
  SubmissionType,
} from "@/lib/types";

const SUBMISSION_STATUSES: readonly SubmissionStatus[] = [
  "new",
  "in_review",
  "accepted",
  "declined",
  "archived",
];

const NOTES_MAX_LENGTH = 5000;

async function clientIp(): Promise<string> {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  const first = forwardedFor?.split(",")[0]?.trim();
  return first || "local";
}

function isStatus(value: unknown): value is SubmissionStatus {
  return (
    typeof value === "string" &&
    (SUBMISSION_STATUSES as readonly string[]).includes(value)
  );
}

function isCycleRole(value: unknown): value is CycleRole {
  return value === "mentor" || value === "mentee";
}

function detailPath(type: SubmissionType, id: string): string {
  return `/admin/submissions/${type}/${id}`;
}

export async function loginAdmin(formData: FormData): Promise<void> {
  if (!isAdminConfigured()) notFound();

  if (!checkRateLimit(`admin-login:${await clientIp()}`)) {
    redirect("/admin/login?error=1");
  }

  const candidate = formData.get("password");
  if (typeof candidate !== "string" || !verifyPassword(candidate)) {
    redirect("/admin/login?error=1");
  }

  (await cookies()).set(
    ADMIN_SESSION_COOKIE,
    createSessionToken(),
    sessionCookieOptions,
  );
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  (await cookies()).delete({ name: ADMIN_SESSION_COOKIE, path: "/admin" });
  redirect("/admin/login");
}

export async function updateSubmissionStatus(
  formData: FormData,
): Promise<void> {
  await assertAdmin();

  const ref = validateSubmissionRef(
    formData.get("type"),
    formData.get("id"),
  );
  if (!ref) notFound();

  const status = formData.get("status");
  if (!isStatus(status)) throw new Error("Invalid status");

  await db.updateSubmission(ref.type, ref.id, { status });

  revalidatePath("/admin/submissions");
  revalidatePath(detailPath(ref.type, ref.id));
}

export async function saveSubmissionNotes(formData: FormData): Promise<void> {
  await assertAdmin();

  const ref = validateSubmissionRef(
    formData.get("type"),
    formData.get("id"),
  );
  if (!ref) notFound();

  const raw = formData.get("notes");
  const notes = (typeof raw === "string" ? raw : "").slice(0, NOTES_MAX_LENGTH);

  await db.updateSubmission(ref.type, ref.id, { notes });

  revalidatePath(detailPath(ref.type, ref.id));
}

export async function toggleCycle(formData: FormData): Promise<void> {
  await assertAdmin();

  const role = formData.get("role");
  if (!isCycleRole(role)) throw new Error("Invalid role");

  const openValue = formData.get("open");
  if (openValue !== "true" && openValue !== "false") {
    throw new Error("Invalid cycle state");
  }

  await db.setCycle(role, openValue === "true");

  revalidatePath("/admin");
}

const DECISION_COPY: Record<
  "accepted" | "declined",
  { subject: string; body: (name: string) => string }
> = {
  accepted: {
    subject: "Your RISE Initiative application",
    body: (name) =>
      `Hi ${name},\n\n` +
      "Thank you for applying to the RISE Initiative. We are glad to let you know " +
      "that your application has been accepted. A member of our team will be in " +
      "touch shortly with the next steps.\n\n" +
      "Warm regards,\nThe RISE Initiative team",
  },
  declined: {
    subject: "Your RISE Initiative application",
    body: (name) =>
      `Hi ${name},\n\n` +
      "Thank you for taking the time to apply to the RISE Initiative. After careful " +
      "consideration, we are unable to offer you a place in this cycle. We truly " +
      "appreciate your interest and encourage you to apply again in a future cycle.\n\n" +
      "Warm regards,\nThe RISE Initiative team",
  },
};

export async function sendDecisionEmail(formData: FormData): Promise<void> {
  await assertAdmin();

  const ref = validateSubmissionRef(
    formData.get("type"),
    formData.get("id"),
  );
  if (!ref) notFound();

  const decision = formData.get("decision");
  if (decision !== "accepted" && decision !== "declined") {
    throw new Error("Invalid decision");
  }

  const submission = await db.getSubmission(ref.type, ref.id);
  if (!submission) notFound();

  const payload = submission.payload as { email?: unknown; fullName?: unknown };
  const email = typeof payload.email === "string" ? payload.email : null;
  if (!email) throw new Error("Submission has no email address");

  const name =
    typeof payload.fullName === "string" && payload.fullName.trim()
      ? payload.fullName
      : "there";

  const copy = DECISION_COPY[decision];
  await notifier.send({
    kind: "decision-email",
    to: email,
    subject: copy.subject,
    body: copy.body(name),
    submission: { type: ref.type, id: ref.id },
  });

  revalidatePath(detailPath(ref.type, ref.id));
}
