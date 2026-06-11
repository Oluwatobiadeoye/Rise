import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import type { Submission } from "@/lib/types";

function field(payload: unknown, key: "fullName" | "email"): string {
  if (payload && typeof payload === "object" && key in payload) {
    const value = (payload as Record<string, unknown>)[key];
    if (typeof value === "string") return value;
  }
  return "";
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Read-only list of submissions, each row linking to its detail page. */
export function SubmissionTable({
  submissions,
}: {
  submissions: Submission[];
}) {
  if (submissions.length === 0) {
    return (
      <p className="rounded-md border border-line bg-surface px-5 py-6 font-body text-sm text-muted">
        No submissions match these filters yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-left font-body text-sm">
        <thead>
          <tr className="border-b border-line bg-surface-sunk text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-semibold">Received</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">From</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr
              key={`${submission.type}/${submission.id}`}
              className="border-b border-line last:border-0 hover:bg-surface-sunk"
            >
              <td className="px-4 py-3 text-muted">
                {formatDate(submission.createdAt)}
              </td>
              <td className="px-4 py-3 capitalize text-ink">
                {submission.type}
              </td>
              <td className="px-4 py-3 text-ink">
                <Link
                  href={`/admin/submissions/${submission.type}/${submission.id}`}
                  className="font-semibold text-primary hover:text-primary-press"
                >
                  {field(submission.payload, "fullName") || "(no name)"}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted">
                {field(submission.payload, "email") || "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={submission.status} />
              </td>
              <td className="px-4 py-3 text-muted">{submission.from ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
