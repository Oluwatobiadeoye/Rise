import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { db } from "@/lib/db";
import { ALL_STATUSES, STATUS_LABELS } from "@/lib/status";
import { CYCLE_ROLE_LABELS, formatCycleDate } from "@/lib/cycle-phase";
import type {
  Cycle,
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
const STATUSES = ALL_STATUSES;
const ROLES: readonly CycleRole[] = ["mentor", "mentee"];

function Stat({
  label,
  value,
  interactive = false,
}: {
  label: string;
  value: number;
  interactive?: boolean;
}) {
  return (
    <div
      className={`h-full rounded-lg border border-line bg-surface p-4 ${
        interactive ? "transition-colors hover:border-primary" : ""
      }`}
    >
      <p className="font-display text-2xl font-bold text-ink">{value}</p>
      <p className="mt-1 font-body text-sm text-muted">{label}</p>
    </div>
  );
}

const cardLinkClass =
  "block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2";

function CycleStatusRow({
  role,
  cycle,
}: {
  role: CycleRole;
  cycle: Cycle | null;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-base font-semibold text-ink">
          {CYCLE_ROLE_LABELS[role]}
        </p>
        <span
          className={`inline-flex items-center rounded-pill px-3 py-1 font-body text-xs font-semibold ${
            cycle
              ? "bg-success-tint text-success"
              : "bg-charcoal-50 text-charcoal-700"
          }`}
        >
          {cycle ? "Open" : "Closed"}
        </span>
      </div>
      <p className="mt-2 font-body text-sm text-muted">
        {cycle
          ? `${cycle.label}, closes ${formatCycleDate(cycle.closeAt)}`
          : "No cycle is currently open."}
      </p>
    </div>
  );
}

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Super admin",
  owner: "Owner",
  reviewer: "Reviewer",
};

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const showCycles = can(admin.role, "manage-cycles");
  const showAdmins = can(admin.role, "manage-admins");

  const submissions = await db.listSubmissions();
  const activeCycles = await Promise.all(
    ROLES.map((role) => db.getActiveCycle(role)),
  );
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
          Signed in as {admin.name} ({ROLE_LABELS[admin.role] ?? admin.role}).
        </p>
        <p className="mt-1 font-body text-sm text-muted">
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
            <Link
              key={type}
              href={`/admin/submissions?type=${type}`}
              className={cardLinkClass}
            >
              <Stat
                label={`${type} submissions`}
                value={byType(type)}
                interactive
              />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">
          By status
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {STATUSES.map((status) => (
            <Link
              key={status}
              href={`/admin/submissions?status=${status}`}
              className={cardLinkClass}
            >
              <Stat
                label={STATUS_LABELS[status]}
                value={byStatus(status)}
                interactive
              />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Application cycles
          </h2>
          {showCycles ? (
            <Link
              href="/admin/cycles"
              className="font-body text-sm font-semibold text-primary hover:underline"
            >
              Manage cycles
            </Link>
          ) : null}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {ROLES.map((role, index) => (
            <CycleStatusRow key={role} role={role} cycle={activeCycles[index]} />
          ))}
        </div>
      </section>

      {showAdmins ? (
        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-ink">
              Admin accounts
            </h2>
            <Link
              href="/admin/admins"
              className="font-body text-sm font-semibold text-primary hover:underline"
            >
              Manage admins
            </Link>
          </div>
        </section>
      ) : null}

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
