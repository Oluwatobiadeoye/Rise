"use client";

import { useRef, useState, useTransition } from "react";
import { saveSubmissionNotes, saveSubmissionReview } from "@/lib/actions/admin";
import { STATUS_LABELS } from "@/lib/status";
import type { SubmissionStatus, SubmissionType } from "@/lib/types";

/**
 * The reviewer's editing surface: a status select and a notes field saved by a
 * single Save button. Notes additionally auto-save on blur so an interrupted
 * session never loses them; the status only persists when Save is pressed, so a
 * half-considered status change is never written behind the reviewer's back.
 */
export function ReviewEditor({
  type,
  id,
  status,
  notes,
  statuses,
}: {
  type: SubmissionType;
  id: string;
  status: SubmissionStatus;
  notes: string;
  statuses: readonly SubmissionStatus[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [savedNotes, setSavedNotes] = useState(notes);
  const [autoSaving, startAutoSave] = useTransition();

  function handleNotesBlur(value: string) {
    if (value === savedNotes) return;
    setSavedNotes(value);
    const data = new FormData();
    data.set("type", type);
    data.set("id", id);
    data.set("notes", value);
    startAutoSave(() => saveSubmissionNotes(data));
  }

  return (
    <form action={saveSubmissionReview} ref={formRef} className="mt-4 space-y-5">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="id" value={id} />

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
          defaultValue={status}
          className="mt-1.5 rounded-md border border-line bg-surface px-3 py-2.5 font-body text-sm text-ink outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-tint"
        >
          {statuses.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block font-body text-sm font-semibold text-ink"
        >
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={5}
          maxLength={5000}
          defaultValue={notes}
          onBlur={(e) => handleNotesBlur(e.target.value)}
          placeholder="Internal review notes (not shared with the applicant)."
          className="mt-1.5 w-full rounded-md border border-line bg-surface px-3 py-2.5 font-body text-sm text-ink outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-tint"
        />
        <p className="mt-1.5 font-body text-xs text-muted" aria-live="polite">
          {autoSaving ? "Saving notes…" : "Notes save automatically."}
        </p>
      </div>

      <button
        type="submit"
        className="inline-flex min-h-11 items-center rounded-pill bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        Save
      </button>
    </form>
  );
}
