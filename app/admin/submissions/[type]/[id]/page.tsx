import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import {
  claimSubmission,
  releaseSubmission,
  sendDecisionEmail,
} from "@/lib/actions/admin";
import { isSubmissionType } from "@/lib/admin/ref";
import { ReviewEditor } from "@/components/admin/ReviewEditor";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { db } from "@/lib/db";
import { STATUS_LABELS, isTerminalStatus, statusesForType } from "@/lib/status";

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
  // A finalized submission stays attributed to whoever handled it, so releasing
  // (or forcibly taking over) the claim is no longer offered.
  const finalized = isTerminalStatus(submission.status);

  const canEmail = type === "mentor" || type === "mentee";
  // The user-supplied fields are everything except the system/envelope fields.
  const systemFields = new Set([
    "id",
    "type",
    "status",
    "notes",
    "reviewedBy",
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
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-bold capitalize text-ink">
                {submission.type} submission
              </h1>
              <StatusBadge status={submission.status} />
            </div>
            <p className="mt-2 font-body text-sm text-muted">
              Received {formatDateTime(submission.createdAt)}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
            {reviewedBy === null && finalized ? (
              <p className="font-body text-sm text-muted">
                No longer open for review.
              </p>
            ) : reviewedBy === null ? (
              <form action={claimSubmission}>
                <input type="hidden" name="type" value={submission.type} />
                <input type="hidden" name="id" value={submission.id} />
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center rounded-pill bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  Start review
                </button>
              </form>
            ) : isMine ? (
              <>
                <p className="font-body text-sm font-semibold text-success">
                  {finalized
                    ? "Finalized · attributed to you"
                    : "You are reviewing this"}
                </p>
                {finalized ? null : (
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
                )}
              </>
            ) : (
              <>
                <p className="font-body text-sm text-muted">
                  {finalized
                    ? `Finalized by ${holder?.name ?? "another admin"}`
                    : `Under review by ${holder?.name ?? "another admin"}`}
                </p>
                {finalized ? null : (
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
                )}
              </>
            )}
          </div>
        </div>
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
        <h2 className="font-display text-lg font-semibold text-ink">
          Status &amp; notes
        </h2>
        {isMine ? (
          <ReviewEditor
            type={submission.type}
            id={submission.id}
            status={submission.status}
            notes={submission.notes}
            statuses={statusesForType(submission.type)}
          />
        ) : (
          <div className="mt-4 space-y-4">
            <p className="font-body text-sm text-muted">
              Current status: {STATUS_LABELS[submission.status]}.{" "}
              {finalized
                ? "This submission is finalized."
                : "Start a review to change the status and edit notes."}
            </p>
            <div>
              <p className="font-body text-sm font-semibold text-muted">Notes</p>
              <p className="mt-1 font-body text-sm whitespace-pre-wrap text-ink">
                {submission.notes || "(no notes yet)"}
              </p>
            </div>
          </div>
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
