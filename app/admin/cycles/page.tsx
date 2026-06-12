import { requireAdmin } from "@/lib/admin/auth";
import { createCycle, deleteCycle, updateCycle } from "@/lib/actions/admin";
import { db } from "@/lib/db";
import {
  CYCLE_PHASE_LABELS,
  CYCLE_ROLE_LABELS,
  cyclePhase,
  formatCycleDate,
  toDateTimeLocal,
} from "@/lib/cycle-phase";
import type { Cycle, CycleRole } from "@/lib/types";

export const dynamic = "force-dynamic";

const ROLES: readonly CycleRole[] = ["mentor", "mentee"];

const labelClass =
  "block font-body text-sm font-semibold text-ink";
const inputClass =
  "mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 font-body text-sm text-ink outline-none focus-visible:border-primary";
const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-pill bg-primary px-5 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-primary-hover";
const ghostButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-pill px-4 py-2 font-body text-sm font-semibold text-charcoal-700 shadow-[inset_0_0_0_2px_var(--rise-line)] transition-colors hover:bg-surface-sunk";

const PHASE_BADGE: Record<string, string> = {
  open: "bg-success-tint text-success",
  upcoming: "bg-evergreen-50 text-evergreen-700",
  past: "bg-charcoal-50 text-charcoal-700",
};

function CycleRow({ cycle }: { cycle: Cycle }) {
  const phase = cyclePhase(cycle);

  return (
    <li className="rounded-lg border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-ink">
          {cycle.label}
        </h3>
        <span
          className={`inline-flex items-center rounded-pill px-3 py-1 font-body text-xs font-semibold ${PHASE_BADGE[phase]}`}
        >
          {CYCLE_PHASE_LABELS[phase]}
        </span>
      </div>
      <p className="mt-2 font-body text-sm text-muted">
        Opens {formatCycleDate(cycle.openAt)} · closes{" "}
        {formatCycleDate(cycle.closeAt)}
      </p>

      <form action={updateCycle} className="mt-4 grid gap-4 sm:grid-cols-3">
        <input type="hidden" name="id" value={cycle.id} />
        <div className="sm:col-span-3">
          <label className={labelClass} htmlFor={`label-${cycle.id}`}>
            Label
          </label>
          <input
            id={`label-${cycle.id}`}
            name="label"
            type="text"
            required
            maxLength={120}
            defaultValue={cycle.label}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`openAt-${cycle.id}`}>
            Opens
          </label>
          <input
            id={`openAt-${cycle.id}`}
            name="openAt"
            type="datetime-local"
            required
            defaultValue={toDateTimeLocal(cycle.openAt)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`closeAt-${cycle.id}`}>
            Closes
          </label>
          <input
            id={`closeAt-${cycle.id}`}
            name="closeAt"
            type="datetime-local"
            required
            defaultValue={toDateTimeLocal(cycle.closeAt)}
            className={inputClass}
          />
        </div>
        <div className="flex items-end">
          <button type="submit" className={primaryButtonClass}>
            Save changes
          </button>
        </div>
      </form>

      <form action={deleteCycle} className="mt-3">
        <input type="hidden" name="id" value={cycle.id} />
        <button type="submit" className={ghostButtonClass}>
          Delete cycle
        </button>
      </form>
    </li>
  );
}

function CreateCycleForm() {
  return (
    <form
      action={createCycle}
      className="grid gap-4 rounded-lg border border-line bg-surface p-5 sm:grid-cols-2"
    >
      <div>
        <label className={labelClass} htmlFor="new-role">
          Role
        </label>
        <select
          id="new-role"
          name="role"
          required
          defaultValue="mentor"
          className={inputClass}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {CYCLE_ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="new-label">
          Label
        </label>
        <input
          id="new-label"
          name="label"
          type="text"
          required
          maxLength={120}
          placeholder="Summer 2026"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="new-openAt">
          Opens
        </label>
        <input
          id="new-openAt"
          name="openAt"
          type="datetime-local"
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="new-closeAt">
          Closes
        </label>
        <input
          id="new-closeAt"
          name="closeAt"
          type="datetime-local"
          required
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" className={primaryButtonClass}>
          Create cycle
        </button>
      </div>
    </form>
  );
}

export default async function AdminCyclesPage() {
  await requireAdmin();

  const cycles = await db.listCycles();
  const byRole = (role: CycleRole) => cycles.filter((c) => c.role === role);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Application cycles
        </h1>
        <p className="mt-2 font-body text-sm text-muted">
          Each cycle is a scheduled open/close window. A role is open while the
          current time falls inside one of its cycles.
        </p>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">
          Add a cycle
        </h2>
        <div className="mt-4">
          <CreateCycleForm />
        </div>
      </section>

      {ROLES.map((role) => {
        const roleCycles = byRole(role);
        return (
          <section key={role}>
            <h2 className="font-display text-lg font-semibold text-ink">
              {CYCLE_ROLE_LABELS[role]} cycles
            </h2>
            {roleCycles.length === 0 ? (
              <p className="mt-4 font-body text-sm text-muted">
                No cycles yet.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-4">
                {roleCycles.map((cycle) => (
                  <CycleRow key={cycle.id} cycle={cycle} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
