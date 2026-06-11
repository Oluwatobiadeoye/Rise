// @vitest-environment node
import { mkdtemp, rm, writeFile, mkdir, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFsSubmissionStore } from "../fs";
import type { SubmissionStore } from "../types";
import type { ContactPayload, MenteePayload } from "@/lib/types";

const contactPayload: ContactPayload = {
  fullName: "Ada Obi",
  email: "ada@example.com",
  role: "Student",
  message: "Hello RISE.",
};

const menteePayload: MenteePayload = {
  fullName: "Bisi Ade",
  email: "bisi@example.com",
  institution: "LAUTECH",
  dateOfBirth: "2004-05-12",
  essay: "My background and goals.",
};

describe("createFsSubmissionStore", () => {
  let root: string;
  let store: SubmissionStore;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), "rise-store-"));
    store = createFsSubmissionStore(root);
  });

  afterEach(async () => {
    vi.useRealTimers();
    await rm(root, { recursive: true, force: true });
  });

  it("creates a submission with new status, empty notes, and timestamps", async () => {
    const submission = await store.createSubmission("contact", contactPayload);

    expect(submission.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(submission.type).toBe("contact");
    expect(submission.status).toBe("new");
    expect(submission.notes).toBe("");
    expect(submission.from).toBeNull();
    expect(submission.createdAt).toBe(submission.updatedAt);
    expect(submission.payload).toEqual(contactPayload);
  });

  it("records the from slug when provided", async () => {
    const submission = await store.createSubmission("contact", contactPayload, {
      from: "home",
    });
    expect(submission.from).toBe("home");
  });

  it("round-trips a submission through getSubmission", async () => {
    const created = await store.createSubmission("mentee", menteePayload);
    const fetched = await store.getSubmission("mentee", created.id);
    expect(fetched).toEqual(created);
  });

  it("returns null for a missing submission", async () => {
    expect(await store.getSubmission("contact", "no-such-id")).toBeNull();
  });

  it("lists submissions newest first and filters by type and status", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T10:00:00Z"));
    const older = await store.createSubmission("contact", contactPayload);
    vi.setSystemTime(new Date("2026-06-01T11:00:00Z"));
    const newer = await store.createSubmission("contact", contactPayload);
    vi.setSystemTime(new Date("2026-06-01T12:00:00Z"));
    const mentee = await store.createSubmission("mentee", menteePayload);

    const all = await store.listSubmissions();
    expect(all.map((s) => s.id)).toEqual([mentee.id, newer.id, older.id]);

    const contactsOnly = await store.listSubmissions({ type: "contact" });
    expect(contactsOnly.map((s) => s.id)).toEqual([newer.id, older.id]);

    await store.updateSubmission("contact", older.id, { status: "in_review" });
    const stillNew = await store.listSubmissions({
      type: "contact",
      status: "new",
    });
    expect(stillNew.map((s) => s.id)).toEqual([newer.id]);
  });

  it("returns an empty list when nothing has been stored", async () => {
    expect(await store.listSubmissions()).toEqual([]);
  });

  it("updates status and notes and bumps updatedAt", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T10:00:00Z"));
    const created = await store.createSubmission("contact", contactPayload);

    vi.setSystemTime(new Date("2026-06-01T10:30:00Z"));
    const updated = await store.updateSubmission("contact", created.id, {
      status: "accepted",
      notes: "Strong applicant.",
    });

    expect(updated.status).toBe("accepted");
    expect(updated.notes).toBe("Strong applicant.");
    expect(updated.createdAt).toBe(created.createdAt);
    expect(updated.updatedAt > created.updatedAt).toBe(true);

    const persisted = await store.getSubmission("contact", created.id);
    expect(persisted).toEqual(updated);
  });

  it("throws when updating a submission that does not exist", async () => {
    await expect(
      store.updateSubmission("contact", "missing-id", { status: "archived" }),
    ).rejects.toThrow(/not found/i);
  });

  it("defaults both cycles to closed when no cycles file exists", async () => {
    expect(await store.getCycles()).toEqual({
      mentor: { open: false, updatedAt: null },
      mentee: { open: false, updatedAt: null },
    });
  });

  it("toggles a cycle and persists the change", async () => {
    const afterOpen = await store.setCycle("mentor", true);
    expect(afterOpen.mentor.open).toBe(true);
    expect(afterOpen.mentor.updatedAt).not.toBeNull();
    expect(afterOpen.mentee).toEqual({ open: false, updatedAt: null });

    const reread = await store.getCycles();
    expect(reread.mentor.open).toBe(true);

    const afterClose = await store.setCycle("mentor", false);
    expect(afterClose.mentor.open).toBe(false);
  });

  it("is idempotent for notify-me signups per role and lowercased email", async () => {
    const first = await store.addNotifyMe("mentor", "Ada@Example.COM");
    const second = await store.addNotifyMe("mentor", "ada@example.com");
    expect(first.email).toBe("ada@example.com");
    expect(second.id).toBe(first.id);

    const mentorList = await store.listNotifyMe("mentor");
    expect(mentorList).toHaveLength(1);

    // The same email under another role is a separate entry.
    const menteeEntry = await store.addNotifyMe("mentee", "ada@example.com");
    expect(menteeEntry.id).not.toBe(first.id);
    expect(await store.listNotifyMe("mentee")).toHaveLength(1);
  });

  it("skips unparseable submission files without crashing", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const valid = await store.createSubmission("contact", contactPayload);

    const dir = path.join(root, "submissions", "contact");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "corrupt.json"), "{not json", "utf8");

    const listed = await store.listSubmissions({ type: "contact" });
    expect(listed.map((s) => s.id)).toEqual([valid.id]);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("leaves no temp files behind after writes", async () => {
    await store.createSubmission("contact", contactPayload);
    await store.setCycle("mentee", true);
    const contactDir = await readdir(path.join(root, "submissions", "contact"));
    const rootDir = await readdir(root);
    expect(contactDir.some((f) => f.endsWith(".tmp"))).toBe(false);
    expect(rootDir.some((f) => f.endsWith(".tmp"))).toBe(false);
  });
});
