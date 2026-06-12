import type { Cycle, CycleRole } from "@/lib/types";

export type CyclePhase = "open" | "upcoming" | "past";

export const CYCLE_ROLE_LABELS: Record<CycleRole, string> = {
  mentor: "Mentor",
  mentee: "Mentee",
};

export const CYCLE_PHASE_LABELS: Record<CyclePhase, string> = {
  open: "Open",
  upcoming: "Upcoming",
  past: "Closed",
};

/** Where a cycle sits relative to `now`: currently open, not yet, or over. */
export function cyclePhase(cycle: Cycle, now: Date = new Date()): CyclePhase {
  const nowIso = now.toISOString();
  if (nowIso < cycle.openAt) return "upcoming";
  if (nowIso >= cycle.closeAt) return "past";
  return "open";
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Formats an ISO timestamp for the admin UI (e.g. "31 Jul 2026, 23:59"). */
export function formatCycleDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return DATE_FORMAT.format(date);
}

/**
 * Converts an ISO timestamp to the `YYYY-MM-DDTHH:mm` shape a `datetime-local`
 * input expects, in the server's local time so it round-trips with the
 * `new Date(value)` parse the action applies to the same wall-clock value.
 */
export function toDateTimeLocal(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}
