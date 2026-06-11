import { toggleCycle } from "@/lib/actions/admin";
import { cn } from "@/lib/cn";
import type { CycleRole, CycleState } from "@/lib/types";

const ROLE_LABELS: Record<CycleRole, string> = {
  mentor: "Mentor applications",
  mentee: "Mentee applications",
};

/** A cycle's open/closed badge plus a native form that flips its state. */
export function CycleCard({
  role,
  state,
}: {
  role: CycleRole;
  state: CycleState;
}) {
  const open = state.open;

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-ink">
          {ROLE_LABELS[role]}
        </h3>
        <span
          className={cn(
            "inline-flex items-center rounded-pill px-3 py-1 font-body text-xs font-semibold",
            open
              ? "bg-success-tint text-success"
              : "bg-charcoal-50 text-charcoal-700",
          )}
        >
          {open ? "Open" : "Closed"}
        </span>
      </div>

      <p className="mt-2 font-body text-sm text-muted">
        {open
          ? "The apply page is live and accepting submissions."
          : "The apply page shows a closed notice with a notify-me form."}
      </p>

      <form action={toggleCycle} className="mt-4">
        <input type="hidden" name="role" value={role} />
        <input type="hidden" name="open" value={open ? "false" : "true"} />
        <button
          type="submit"
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-pill px-5 py-2 font-body text-sm font-semibold transition-colors",
            open
              ? "bg-charcoal text-white hover:bg-charcoal-700"
              : "bg-primary text-white hover:bg-primary-hover",
          )}
        >
          {open ? "Close cycle" : "Open cycle"}
        </button>
      </form>
    </div>
  );
}
