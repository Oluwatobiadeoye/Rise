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
} from "@/lib/admin/auth";
import { hashPassword, verifyPassword } from "@/lib/admin/password";
import { requireCan } from "@/lib/admin/permissions";
import { validateSubmissionRef } from "@/lib/admin/ref";
import { db } from "@/lib/db";
import { notifier } from "@/lib/notify";
import { checkRateLimit } from "@/lib/rate-limit";
import { isStatusForType } from "@/lib/status";
import type {
  AdminRole,
  CycleRole,
  SubmissionOf,
  SubmissionType,
} from "@/lib/types";

const NOTES_MAX_LENGTH = 5000;

async function clientIp(): Promise<string> {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  const first = forwardedFor?.split(",")[0]?.trim();
  return first || "local";
}

function isCycleRole(value: unknown): value is CycleRole {
  return value === "mentor" || value === "mentee";
}

function detailPath(type: SubmissionType, id: string): string {
  return `/admin/submissions/${type}/${id}`;
}

// A valid scrypt hash verified against on the no-account login path so that a
// missing account costs the same work as a real one (no user-enumeration via
// timing).
const DUMMY_PASSWORD_HASH = hashPassword("timing-equalizer-not-a-real-password");

/**
 * Throws if removing the given admin from the pool of active superadmins would
 * leave zero of them, so a demotion, deletion, or deactivation can never lock
 * everyone out of account management through the UI. Only active superadmins
 * count: an account that can no longer sign in is not a usable superadmin.
 */
async function assertNotLastActiveSuperadmin(id: string): Promise<void> {
  const target = await db.getAdminById(id);
  if (target?.role !== "superadmin" || !target.active) return;
  const activeSuperadmins = (await db.listAdmins()).filter(
    (a) => a.role === "superadmin" && a.active,
  );
  if (activeSuperadmins.length <= 1) {
    throw new Error("Cannot remove the last active superadmin");
  }
}

/**
 * Loads a submission and enforces that the given admin holds its review claim.
 * Throws "Submission is not under your review" when the claim is unheld or held
 * by another admin, so review mutations can only proceed under an active claim.
 */
async function loadClaimedSubmission<K extends SubmissionType>(
  type: K,
  id: string,
  adminId: string,
): Promise<SubmissionOf<K>> {
  const submission = await db.getSubmission(type, id);
  if (!submission) notFound();
  if (submission.reviewedBy !== adminId) {
    throw new Error("Submission is not under your review");
  }
  return submission;
}

export async function loginAdmin(formData: FormData): Promise<void> {
  if (!isAdminConfigured()) notFound();

  if (!checkRateLimit(`admin-login:${await clientIp()}`)) {
    redirect("/admin/login?error=1");
  }

  const identifier = formData.get("identifier");
  const password = formData.get("password");
  if (typeof identifier !== "string" || typeof password !== "string") {
    redirect("/admin/login?error=1");
  }

  // Look up by username or email, then verify the password. A single generic
  // failure path for both a missing account and a wrong password avoids
  // revealing which field was wrong (and which usernames exist).
  const record = await db.getAdminByIdentifier(identifier as string);
  if (!record) {
    // Spend the same work as a real verify so the timing doesn't reveal that
    // no account exists for this identifier.
    verifyPassword(password as string, DUMMY_PASSWORD_HASH);
    redirect("/admin/login?error=1");
  }
  const passwordOk = verifyPassword(password as string, record.passwordHash);
  // Verify the password even for a deactivated account, then fail through the
  // same generic path: a deactivated account must not be distinguishable from a
  // wrong password (no enumeration), and the work keeps the timing even.
  if (!passwordOk || !record.active) {
    redirect("/admin/login?error=1");
  }

  (await cookies()).set(
    ADMIN_SESSION_COOKIE,
    createSessionToken(record!.id),
    sessionCookieOptions,
  );
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  (await cookies()).delete({ name: ADMIN_SESSION_COOKIE, path: "/admin" });
  redirect("/admin/login");
}

/**
 * Saves the whole review in one shot (the detail page's single Save button):
 * status and notes together, under the caller's active claim.
 */
export async function saveSubmissionReview(formData: FormData): Promise<void> {
  const admin = await assertAdmin();

  const ref = validateSubmissionRef(
    formData.get("type"),
    formData.get("id"),
  );
  if (!ref) notFound();

  const status = formData.get("status");
  if (!isStatusForType(ref.type, status)) throw new Error("Invalid status");

  const raw = formData.get("notes");
  const notes = (typeof raw === "string" ? raw : "").slice(0, NOTES_MAX_LENGTH);

  await loadClaimedSubmission(ref.type, ref.id, admin.id);
  await db.updateSubmission(ref.type, ref.id, { status, notes });

  revalidatePath("/admin/submissions");
  revalidatePath(detailPath(ref.type, ref.id));
}

/**
 * Saves only the notes (the detail page auto-saves these on blur, so a status
 * change still in progress is never persisted before the reviewer commits it).
 */
export async function saveSubmissionNotes(formData: FormData): Promise<void> {
  const admin = await assertAdmin();

  const ref = validateSubmissionRef(
    formData.get("type"),
    formData.get("id"),
  );
  if (!ref) notFound();

  const raw = formData.get("notes");
  const notes = (typeof raw === "string" ? raw : "").slice(0, NOTES_MAX_LENGTH);

  await loadClaimedSubmission(ref.type, ref.id, admin.id);
  await db.updateSubmission(ref.type, ref.id, { notes });

  revalidatePath(detailPath(ref.type, ref.id));
}

export async function claimSubmission(formData: FormData): Promise<void> {
  const admin = await assertAdmin();

  const ref = validateSubmissionRef(formData.get("type"), formData.get("id"));
  if (!ref) notFound();

  await db.claimSubmission(ref.type, ref.id, admin.id);

  revalidatePath("/admin/submissions");
  revalidatePath(detailPath(ref.type, ref.id));
}

export async function releaseSubmission(formData: FormData): Promise<void> {
  const admin = await assertAdmin();

  const ref = validateSubmissionRef(formData.get("type"), formData.get("id"));
  if (!ref) notFound();

  // A force release (taking over another admin's claim) is an explicit,
  // opt-in field; the holder can always release their own claim regardless.
  const force = formData.get("force") === "1";
  await db.releaseSubmission(ref.type, ref.id, admin.id, { force });

  revalidatePath("/admin/submissions");
  revalidatePath(detailPath(ref.type, ref.id));
}

const CYCLE_LABEL_MAX_LENGTH = 120;

function revalidateCycles(): void {
  revalidatePath("/admin/cycles");
  revalidatePath("/admin");
}

/**
 * Parses a `datetime-local` form value (e.g. "2026-07-01T09:00", local time,
 * no zone) to an ISO 8601 instant. Returns null if it cannot be parsed.
 */
function parseDateTimeLocal(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

/** Validates a label and the open/close window from a cycle form. */
function readCycleWindow(formData: FormData): {
  label: string;
  openAt: string;
  closeAt: string;
} {
  const labelRaw = formData.get("label");
  const label = (typeof labelRaw === "string" ? labelRaw : "").trim();
  if (!label || label.length > CYCLE_LABEL_MAX_LENGTH) {
    throw new Error("Invalid cycle label");
  }

  const openAt = parseDateTimeLocal(formData.get("openAt"));
  const closeAt = parseDateTimeLocal(formData.get("closeAt"));
  if (!openAt || !closeAt) throw new Error("Invalid cycle dates");
  if (closeAt <= openAt) {
    throw new Error("Cycle close time must be after the open time");
  }

  return { label, openAt, closeAt };
}

export async function createCycle(formData: FormData): Promise<void> {
  await requireCan("manage-cycles");

  const role = formData.get("role");
  if (!isCycleRole(role)) throw new Error("Invalid role");

  const { label, openAt, closeAt } = readCycleWindow(formData);
  await db.createCycle({ role, label, openAt, closeAt });

  revalidateCycles();
}

export async function updateCycle(formData: FormData): Promise<void> {
  await requireCan("manage-cycles");

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Invalid cycle id");

  const { label, openAt, closeAt } = readCycleWindow(formData);
  await db.updateCycle(id, { label, openAt, closeAt });

  revalidateCycles();
}

export async function deleteCycle(formData: FormData): Promise<void> {
  await requireCan("manage-cycles");

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Invalid cycle id");

  await db.deleteCycle(id);

  revalidateCycles();
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
  const admin = await assertAdmin();

  const ref = validateSubmissionRef(
    formData.get("type"),
    formData.get("id"),
  );
  if (!ref) notFound();

  const decision = formData.get("decision");
  if (decision !== "accepted" && decision !== "declined") {
    throw new Error("Invalid decision");
  }

  const submission = await loadClaimedSubmission(ref.type, ref.id, admin.id);

  const name = submission.fullName.trim() ? submission.fullName : "there";

  const copy = DECISION_COPY[decision];
  await notifier.send({
    kind: "decision-email",
    to: submission.email,
    subject: copy.subject,
    body: copy.body(name),
    submission: { type: ref.type, id: ref.id },
  });

  revalidatePath(detailPath(ref.type, ref.id));
}

// --- Admin account management (superadmin only) ---

const USERNAME_PATTERN = /^[a-z0-9._-]{3,40}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX_LENGTH = 120;
const PASSWORD_MIN_LENGTH = 12;

function isAdminRole(value: unknown): value is AdminRole {
  return value === "superadmin" || value === "owner" || value === "reviewer";
}

function revalidateAdmins(): void {
  revalidatePath("/admin/admins");
  revalidatePath("/admin");
}

export async function createAdminAccount(formData: FormData): Promise<void> {
  await requireCan("manage-admins");

  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const role = formData.get("role");
  const password = formData.get("password");

  if (!USERNAME_PATTERN.test(username)) throw new Error("Invalid username");
  if (!EMAIL_PATTERN.test(email)) throw new Error("Invalid email");
  if (!name || name.length > NAME_MAX_LENGTH) throw new Error("Invalid name");
  if (!isAdminRole(role)) throw new Error("Invalid role");
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    throw new Error("Password must be at least 12 characters");
  }

  await db.createAdmin({
    username,
    email,
    name,
    role,
    passwordHash: hashPassword(password),
  });

  revalidateAdmins();
}

export async function updateAdminAccount(formData: FormData): Promise<void> {
  await requireCan("manage-admins");

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Invalid admin id");

  const patch: { name?: string; role?: AdminRole; passwordHash?: string } = {};

  const nameRaw = formData.get("name");
  if (typeof nameRaw === "string" && nameRaw.trim()) {
    const name = nameRaw.trim();
    if (name.length > NAME_MAX_LENGTH) throw new Error("Invalid name");
    patch.name = name;
  }

  const role = formData.get("role");
  if (role !== null) {
    if (!isAdminRole(role)) throw new Error("Invalid role");
    patch.role = role;
  }

  const password = formData.get("password");
  if (typeof password === "string" && password.length > 0) {
    if (password.length < PASSWORD_MIN_LENGTH) {
      throw new Error("Password must be at least 12 characters");
    }
    patch.passwordHash = hashPassword(password);
  }

  // Never demote the last active superadmin out of the role.
  if (patch.role && patch.role !== "superadmin") {
    await assertNotLastActiveSuperadmin(id);
  }

  await db.updateAdmin(id, patch);

  revalidateAdmins();
}

export async function deleteAdminAccount(formData: FormData): Promise<void> {
  const admin = await requireCan("manage-admins");

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Invalid admin id");
  // A superadmin cannot delete their own account, which would risk locking the
  // last administrator out of account management.
  if (id === admin.id) throw new Error("You cannot delete your own account");
  await assertNotLastActiveSuperadmin(id);

  await db.deleteAdmin(id);

  revalidateAdmins();
}

export async function setAdminActive(formData: FormData): Promise<void> {
  const admin = await requireCan("manage-admins");

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Invalid admin id");

  const activeRaw = formData.get("active");
  if (activeRaw !== "true" && activeRaw !== "false") {
    throw new Error("Invalid active flag");
  }
  const active = activeRaw === "true";

  // You cannot deactivate your own account (mirrors the self-delete guard); it
  // would risk locking the last administrator out of account management.
  if (!active && id === admin.id) {
    throw new Error("You cannot deactivate your own account");
  }
  // Deactivating must not remove the last active superadmin.
  if (!active) await assertNotLastActiveSuperadmin(id);

  await db.setAdminActive(id, active);

  revalidateAdmins();
}
