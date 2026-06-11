import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { CycleCard } from "@/components/admin/CycleCard";
import { db } from "@/lib/db";
import type {
  CycleRole,
  SubmissionStatus,
  SubmissionType,
} from "@/lib/types";

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
const ROLES: readonly CycleRole[] = ["mentor", "mentee"];

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="font-display text-2xl font-bold text-ink">{value}</p>
      <p className="mt-1 font-body text-sm text-muted">{label}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [submissions, cycles] = await Promise.all([
    db.listSubmissions(),
    db.getCycles(),
  ]);
  const notifyCounts = await Promise.all(
    ROLES.map((role) => db.listNotifyMe(role).then((list) => list.length)),
  );

  const byType = (type: SubmissionType) =>
    submissions.filter((s) => s.type === type).length;
  const byStatus = (status: SubmissionStatus) =>
    submissions.filter((s) => s.status === status).length;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <p className="mt-2 font-body text-sm text-muted">
          {submissions.length} submission{submissions.length === 1 ? "" : "s"} in
          total.
        </p>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">
          By type
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {TYPES.map((type) => (
            <Link key={type} href={`/admin/submissions?type=${type}`}>
              <Stat label={`${type} submissions`} value={byType(type)} />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">
          By status
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {STATUSES.map((status) => (
            <Link
              key={status}
              href={`/admin/submissions?status=${status}`}
            >
              <Stat label={STATUS_LABELS[status]} value={byStatus(status)} />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">
          Application cycles
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {ROLES.map((role) => (
            <CycleCard key={role} role={role} state={cycles[role]} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">
          Notify-me list
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {ROLES.map((role, index) => (
            <Stat
              key={role}
              label={`${role} notify-me signups`}
              value={notifyCounts[index]}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
