import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { SubmissionTable } from "@/components/admin/SubmissionTable";
import { isSubmissionType } from "@/lib/admin/ref";
import { cn } from "@/lib/cn";
import { db } from "@/lib/db";
import type { SubmissionStatus, SubmissionType } from "@/lib/types";

export const dynamic = "force-dynamic";

const TYPES: readonly SubmissionType[] = [
  "contact",
  "mentor",
  "mentee",
  "volunteer",
];
const STATUSES: readonly SubmissionStatus[] = [
  "new",
  "in_review",
  "accepted",
  "declined",
  "archived",
];
const STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: "New",
  in_review: "In review",
  accepted: "Accepted",
  declined: "Declined",
  archived: "Archived",
};

function isStatus(value: string | undefined): value is SubmissionStatus {
  return (
    typeof value === "string" &&
    (STATUSES as readonly string[]).includes(value)
  );
}

function buildHref(params: {
  type?: SubmissionType;
  status?: SubmissionStatus;
}): string {
  const search = new URLSearchParams();
  if (params.type) search.set("type", params.type);
  if (params.status) search.set("status", params.status);
  const query = search.toString();
  return query ? `/admin/submissions?${query}` : "/admin/submissions";
}

function Pill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-pill px-3 py-1.5 font-body text-sm font-semibold transition-colors",
        active
          ? "bg-primary text-white"
          : "bg-surface text-charcoal-700 shadow-[inset_0_0_0_1px_var(--rise-line)] hover:bg-surface-sunk",
      )}
    >
      {label}
    </Link>
  );
}

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>;
}) {
  await requireAdmin();

  const { type: rawType, status: rawStatus } = await searchParams;
  const type = isSubmissionType(rawType) ? rawType : undefined;
  const status = isStatus(rawStatus) ? rawStatus : undefined;

  const submissions = await db.listSubmissions({ type, status });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Submissions
        </h1>
        <p className="mt-2 font-body text-sm text-muted">
          {submissions.length} result{submissions.length === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">
            Type
          </span>
          <Pill
            href={buildHref({ status })}
            label="All"
            active={!type}
          />
          {TYPES.map((value) => (
            <Pill
              key={value}
              href={buildHref({ type: value, status })}
              label={value.charAt(0).toUpperCase() + value.slice(1)}
              active={type === value}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">
            Status
          </span>
          <Pill href={buildHref({ type })} label="All" active={!status} />
          {STATUSES.map((value) => (
            <Pill
              key={value}
              href={buildHref({ type, status: value })}
              label={STATUS_LABELS[value]}
              active={status === value}
            />
          ))}
        </div>
      </div>

      <SubmissionTable submissions={submissions} />
    </div>
  );
}
