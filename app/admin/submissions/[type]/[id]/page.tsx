import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import {
  claimSubmission,
  releaseSubmission,
  saveSubmissionNotes,
  sendDecisionEmail,
  updateSubmissionStatus,
} from "@/lib/actions/admin";
import { isSubmissionType } from "@/lib/admin/ref";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { db } from "@/lib/db";
import { STATUS_LABELS, statusesForType } from "@/lib/status";

export const dynamic = "force-dynamic";

function humanize(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const admin = await requireAdmin();

  const { type, id } = await params;
  if (!isSubmissionType(type)) notFound();

  const submission = await db.getSubmission(type, id);
  if (!submission) notFound();

  // Claim state drives which review controls render. Only the holder may edit;
  // any admin can take over a claim via a force release.
  const reviewedBy = submission.reviewedBy;
  const isMine = reviewedBy !== null && reviewedBy === admin.id;
  const isHeldByOther = reviewedBy !== null && reviewedBy !== admin.id;
  const holder = isHeldByOther ? await db.getAdminById(reviewedBy) : null;

  const canEmail = type === "mentor" || type === "mentee";
  // The user-supplied fields are everything except the system/envelope fields.
  const systemFields = new Set([
    "id",
    "type",
    "status",
    "notes",
    "from",
    "createdAt",
    "updatedAt",
  ]);
  const detailEntries = Object.entries(
    submission as Record<string, unknown>,
  ).filter(([key]) => !systemFields.has(key));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/submissions"
          className="font-body text-sm font-semibold text-primary hover:text-primary-press"
        >
          ← Back to submissions
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold capitalize text-ink">
            {submission.type} submission
          </h1>
          <StatusBadge status={submission.status} />
        </div>
        <p className="mt-2 font-body text-sm text-muted">
          Received {formatDateTime(submission.createdAt)}
          {submission.from ? ` · from ${submission.from}` : ""}
        </p>
      </div>

      <section className="rounded-lg border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Details</h2>
        <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-[200px_1fr]">
          {detailEntries.map(([key, value]) => (
            <div key={key} className="contents">
              <dt className="font-body text-sm font-semibold text-muted">
                {humanize(key)}
              </dt>
              <dd className="font-body text-sm whitespace-pre-wrap text-ink">
                {value === null || value === ""
                  ? "(not provided)"
                  : String(value)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-lg border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Review</h2>
        {reviewedBy === null ? (
          <div className="mt-4">
            <p className="font-body text-sm text-muted">
              This submission is not under review. Start a review to claim it
              for exclusive editing.
            </p>
            <form action={claimSubmission} className="mt-3">
              <input type="hidden" name="type" value={submission.type} />
              <input type="hidden" name="id" value={submission.id} />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-pill bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Start review
              </button>
            </form>
          </div>
        ) : isMine ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-body text-sm text-success">
              You are reviewing this submission.
            </p>
            <form action={releaseSubmission}>
              <input type="hidden" name="type" value={submission.type} />
              <input type="hidden" name="id" value={submission.id} />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-pill px-4 py-2 font-body text-sm font-semibold text-charcoal-700 shadow-[inset_0_0_0_2px_var(--rise-line)] transition-colors hover:bg-surface-sunk"
              >
                Release
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-body text-sm text-muted">
              Under review by {holder?.name ?? "another admin"}. The controls
              are read-only until released.
            </p>
            <form action={releaseSubmission}>
              <input type="hidden" name="type" value={submission.type} />
              <input type="hidden" name="id" value={submission.id} />
              <input type="hidden" name="force" value="1" />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-pill px-4 py-2 font-body text-sm font-semibold text-danger shadow-[inset_0_0_0_2px_var(--rise-line)] transition-colors hover:bg-surface-sunk"
              >
                Force release
              </button>
            </form>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Status</h2>
        {!isMine ? (
          <p className="mt-4 font-body text-sm text-muted">
            Current status: {STATUS_LABELS[submission.status]}. Start a review
            to change it.
          </p>
        ) : (
        <form
          action={updateSubmissionStatus}
          className="mt-4 flex flex-wrap items-end gap-3"
        >
          <input type="hidden" name="type" value={submission.type} />
          <input type="hidden" name="id" value={submission.id} />
          <div>
            <label
              htmlFor="status"
              className="block font-body text-sm font-semibold text-ink"
            >
              Review status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={submission.status}
              className="mt-1.5 rounded-md border border-line bg-surface px-3 py-2.5 font-body text-sm text-ink outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-tint"
            >
              {statusesForType(submission.type).map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-pill bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Save status
          </button>
        </form>
        )}
      </section>

      <section className="rounded-lg border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Notes</h2>
        {!isMine ? (
          <div className="mt-4">
            <p className="font-body text-sm whitespace-pre-wrap text-ink">
              {submission.notes || "(no notes yet)"}
            </p>
            <p className="mt-2 font-body text-sm text-muted">
              Start a review to edit notes.
            </p>
          </div>
        ) : (
        <form action={saveSubmissionNotes} className="mt-4 space-y-3">
          <input type="hidden" name="type" value={submission.type} />
          <input type="hidden" name="id" value={submission.id} />
          <textarea
            name="notes"
            rows={5}
            maxLength={5000}
            defaultValue={submission.notes}
            placeholder="Internal review notes (not shared with the applicant)."
            className="w-full rounded-md border border-line bg-surface px-3 py-2.5 font-body text-sm text-ink outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-tint"
          />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-pill bg-charcoal px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-charcoal-700"
          >
            Save notes
          </button>
        </form>
        )}
      </section>

      {canEmail && isMine ? (
        <section className="rounded-lg border border-line bg-surface p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Decision email
          </h2>
          <p className="mt-2 font-body text-sm text-muted">
            Sends a decision message to the applicant. This does not change the
            review status above; update that separately.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <form action={sendDecisionEmail}>
              <input type="hidden" name="type" value={submission.type} />
              <input type="hidden" name="id" value={submission.id} />
              <input type="hidden" name="decision" value="accepted" />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-pill bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Send acceptance email
              </button>
            </form>
            <form action={sendDecisionEmail}>
              <input type="hidden" name="type" value={submission.type} />
              <input type="hidden" name="id" value={submission.id} />
              <input type="hidden" name="decision" value="declined" />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-pill px-5 py-2.5 font-body text-sm font-semibold text-charcoal-700 shadow-[inset_0_0_0_2px_var(--rise-line)] transition-colors hover:bg-surface-sunk"
              >
                Send decline email
              </button>
            </form>
          </div>
        </section>
      ) : null}
    </div>
  );
}
