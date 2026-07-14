"use client";

import { useState } from "react";
import { saveSubmissionNotes, saveSubmissionReview } from "@/lib/actions/admin";
import { STATUS_LABELS } from "@/lib/status";
import type { SubmissionStatus, SubmissionType } from "@/lib/types";

type NotesState = "idle" | "saving" | "saved" | "error";

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
  // Tracks the last value confirmed saved so an unchanged blur is a no-op and a
  // failed save can be reported without falsely claiming the notes persisted.
  const [savedNotes, setSavedNotes] = useState(notes);
  const [notesState, setNotesState] = useState<NotesState>("idle");

  async function handleNotesBlur(value: string) {
    if (value === savedNotes || notesState === "saving") return;
    setNotesState("saving");
    const data = new FormData();
    data.set("type", type);
    data.set("id", id);
    data.set("notes", value);
    try {
      await saveSubmissionNotes(data);
      setSavedNotes(value);
      setNotesState("saved");
    } catch {
      // Leave savedNotes unchanged so the reviewer isn't told a failed write
      // succeeded; the message prompts them to use Save.
      setNotesState("error");
    }
  }

  const notesStatusMessage =
    notesState === "saving"
      ? "Saving notes…"
      : notesState === "saved"
        ? "Notes saved."
        : notesState === "error"
          ? "Could not auto-save notes. Press Save to try again."
          : "Notes save automatically.";

  return (
    <form action={saveSubmissionReview} className="mt-4 space-y-5">
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
        <p
          className={`mt-1.5 font-body text-xs ${
            notesState === "error" ? "text-danger" : "text-muted"
          }`}
          aria-live="polite"
        >
          {notesStatusMessage}
        </p>
      </div>

      <button
        type="submit"
        disabled={notesState === "saving"}
        className="inline-flex min-h-11 items-center rounded-pill bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        Save
      </button>
    </form>
  );
}
