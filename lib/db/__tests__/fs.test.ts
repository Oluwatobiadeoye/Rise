// @vitest-environment node
import { mkdtemp, rm, writeFile, mkdir, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFsSubmissionStore } from "../fs";
import type { SubmissionStore } from "../types";
import type { AdminInput, SubmissionInput } from "@/lib/types";

const contactInput: SubmissionInput = {
  type: "contact",
  fullName: "Ada Obi",
  email: "ada@example.com",
  role: "Student",
  message: "Hello RISE.",
};

const menteeInput: SubmissionInput = {
  type: "mentee",
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

  it("creates a submission with pending status, empty notes, and timestamps", async () => {
    const submission = await store.createSubmission(contactInput);

    expect(submission.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(submission.type).toBe("contact");
    expect(submission.status).toBe("pending");
    expect(submission.notes).toBe("");
    expect(submission.from).toBeNull();
    expect(submission.createdAt).toBe(submission.updatedAt);
    expect(submission).toMatchObject(contactInput);
  });

  it("records the from slug when provided", async () => {
    const submission = await store.createSubmission(contactInput, {
      from: "home",
    });
    expect(submission.from).toBe("home");
  });

  it("round-trips a submission through getSubmission", async () => {
    const created = await store.createSubmission(menteeInput);
    const fetched = await store.getSubmission("mentee", created.id);
    expect(fetched).toEqual(created);
  });

  it("returns null for a missing submission", async () => {
    expect(await store.getSubmission("contact", "no-such-id")).toBeNull();
  });

  it("lists submissions newest first and filters by type and status", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T10:00:00Z"));
    const older = await store.createSubmission(contactInput);
    vi.setSystemTime(new Date("2026-06-01T11:00:00Z"));
    const newer = await store.createSubmission(contactInput);
    vi.setSystemTime(new Date("2026-06-01T12:00:00Z"));
    const mentee = await store.createSubmission(menteeInput);

    const all = await store.listSubmissions();
    expect(all.map((s) => s.id)).toEqual([mentee.id, newer.id, older.id]);

    const contactsOnly = await store.listSubmissions({ type: "contact" });
    expect(contactsOnly.map((s) => s.id)).toEqual([newer.id, older.id]);

    await store.updateSubmission("contact", older.id, { status: "in_review" });
    const stillPending = await store.listSubmissions({
      type: "contact",
      status: "pending",
    });
    expect(stillPending.map((s) => s.id)).toEqual([newer.id]);
  });

  it("returns an empty list when nothing has been stored", async () => {
    expect(await store.listSubmissions()).toEqual([]);
  });

  it("updates status and notes and bumps updatedAt", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T10:00:00Z"));
    const created = await store.createSubmission(menteeInput);

    vi.setSystemTime(new Date("2026-06-01T10:30:00Z"));
    const updated = await store.updateSubmission("mentee", created.id, {
      status: "accepted",
      notes: "Strong applicant.",
    });

    expect(updated.status).toBe("accepted");
    expect(updated.notes).toBe("Strong applicant.");
    expect(updated.createdAt).toBe(created.createdAt);
    expect(updated.updatedAt > created.updatedAt).toBe(true);

    const persisted = await store.getSubmission("mentee", created.id);
    expect(persisted).toEqual(updated);
  });

  it("throws when updating a submission that does not exist", async () => {
    await expect(
      store.updateSubmission("contact", "missing-id", { status: "archived" }),
    ).rejects.toThrow(/not found/i);
  });

  it("creates a cycle with id and timestamps and lists it back", async () => {
    const cycle = await store.createCycle({
      role: "mentor",
      label: "Summer 2026",
      openAt: "2026-06-01T00:00:00.000Z",
      closeAt: "2026-07-31T23:59:00.000Z",
    });

    expect(cycle.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(cycle.role).toBe("mentor");
    expect(cycle.label).toBe("Summer 2026");
    expect(cycle.createdAt).toBe(cycle.updatedAt);

    const listed = await store.listCycles();
    expect(listed).toEqual([cycle]);
  });

  it("lists cycles newest first by openAt and filters by role", async () => {
    const early = await store.createCycle({
      role: "mentor",
      label: "Spring 2026",
      openAt: "2026-03-01T00:00:00.000Z",
      closeAt: "2026-03-31T00:00:00.000Z",
    });
    const late = await store.createCycle({
      role: "mentor",
      label: "Summer 2026",
      openAt: "2026-06-01T00:00:00.000Z",
      closeAt: "2026-07-01T00:00:00.000Z",
    });
    const mentee = await store.createCycle({
      role: "mentee",
      label: "Mentee 2026",
      openAt: "2026-05-01T00:00:00.000Z",
      closeAt: "2026-06-01T00:00:00.000Z",
    });

    const all = await store.listCycles();
    expect(all.map((c) => c.id)).toEqual([late.id, mentee.id, early.id]);

    const mentorOnly = await store.listCycles("mentor");
    expect(mentorOnly.map((c) => c.id)).toEqual([late.id, early.id]);
  });

  it("getActiveCycle returns the cycle whose window contains now, else null", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00.000Z"));

    const active = await store.createCycle({
      role: "mentor",
      label: "Summer 2026",
      openAt: "2026-06-01T00:00:00.000Z",
      closeAt: "2026-07-01T00:00:00.000Z",
    });
    // A future window for the same role does not overlap.
    await store.createCycle({
      role: "mentor",
      label: "Autumn 2026",
      openAt: "2026-09-01T00:00:00.000Z",
      closeAt: "2026-10-01T00:00:00.000Z",
    });

    expect((await store.getActiveCycle("mentor"))?.id).toBe(active.id);
    // No mentee cycle exists.
    expect(await store.getActiveCycle("mentee")).toBeNull();

    // Move past the window: no cycle is active.
    vi.setSystemTime(new Date("2026-08-01T00:00:00.000Z"));
    expect(await store.getActiveCycle("mentor")).toBeNull();
  });

  it("updates a cycle, bumps updatedAt, and throws when missing", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T10:00:00.000Z"));
    const created = await store.createCycle({
      role: "mentee",
      label: "Draft",
      openAt: "2026-06-01T00:00:00.000Z",
      closeAt: "2026-07-01T00:00:00.000Z",
    });

    vi.setSystemTime(new Date("2026-06-01T10:30:00.000Z"));
    const updated = await store.updateCycle(created.id, { label: "Final" });
    expect(updated.label).toBe("Final");
    expect(updated.createdAt).toBe(created.createdAt);
    expect(updated.updatedAt > created.updatedAt).toBe(true);

    await expect(
      store.updateCycle("missing-id", { label: "x" }),
    ).rejects.toThrow(/not found/i);
  });

  it("deletes a cycle", async () => {
    const created = await store.createCycle({
      role: "mentor",
      label: "Summer 2026",
      openAt: "2026-06-01T00:00:00.000Z",
      closeAt: "2026-07-01T00:00:00.000Z",
    });
    await store.deleteCycle(created.id);
    expect(await store.listCycles()).toEqual([]);
    // Deleting a missing cycle is a no-op.
    await expect(store.deleteCycle("missing-id")).resolves.toBeUndefined();
  });

  it("stamps a mentor submission with the cycle id from meta", async () => {
    const mentorInput: SubmissionInput = {
      type: "mentor",
      fullName: "Tunde Bello",
      email: "tunde@example.com",
      fieldOfExpertise: "Software",
      audiencePreference: "either",
      availability: "monthly",
      message: null,
    };
    const submission = await store.createSubmission(mentorInput, {
      cycleId: "cycle-123",
    });
    if (submission.type === "mentor") {
      expect(submission.cycleId).toBe("cycle-123");
    } else {
      throw new Error("expected a mentor submission");
    }

    // Contact submissions carry no cycle id.
    const contact = await store.createSubmission(contactInput);
    expect("cycleId" in contact).toBe(false);
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
    const valid = await store.createSubmission(contactInput);

    const dir = path.join(root, "submissions", "contact");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "corrupt.json"), "{not json", "utf8");

    const listed = await store.listSubmissions({ type: "contact" });
    expect(listed.map((s) => s.id)).toEqual([valid.id]);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("leaves no temp files behind after writes", async () => {
    await store.createSubmission(contactInput);
    await store.createCycle({
      role: "mentee",
      label: "Summer 2026",
      openAt: "2026-06-01T00:00:00.000Z",
      closeAt: "2026-07-01T00:00:00.000Z",
    });
    const contactDir = await readdir(path.join(root, "submissions", "contact"));
    const cyclesDir = await readdir(path.join(root, "cycles"));
    expect(contactDir.some((f) => f.endsWith(".tmp"))).toBe(false);
    expect(cyclesDir.some((f) => f.endsWith(".tmp"))).toBe(false);
  });

  describe("admin accounts", () => {
    const adminInput: AdminInput = {
      username: "ada",
      email: "Ada@Example.COM",
      name: "Ada Lovelace",
      role: "superadmin",
      passwordHash: "deadbeef:cafef00d",
    };

    it("creates an admin, lowercasing email, and returns no password hash", async () => {
      const admin = await store.createAdmin(adminInput);
      expect(admin.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(admin.email).toBe("ada@example.com");
      expect(admin.role).toBe("superadmin");
      expect("passwordHash" in admin).toBe(false);
    });

    it("rejects a duplicate username or email", async () => {
      await store.createAdmin(adminInput);
      await expect(
        store.createAdmin({ ...adminInput, email: "other@example.com" }),
      ).rejects.toThrow(/already exists/i);
      await expect(
        store.createAdmin({ ...adminInput, username: "other" }),
      ).rejects.toThrow(/already exists/i);
    });

    it("looks up by username or email (case-insensitive) with the hash", async () => {
      const created = await store.createAdmin(adminInput);
      const byUsername = await store.getAdminByIdentifier("ada");
      const byEmail = await store.getAdminByIdentifier("ADA@example.com");
      expect(byUsername?.id).toBe(created.id);
      expect(byUsername?.passwordHash).toBe("deadbeef:cafef00d");
      expect(byEmail?.id).toBe(created.id);
      expect(await store.getAdminByIdentifier("nobody")).toBeNull();
    });

    it("getAdminById and listAdmins strip the password hash", async () => {
      const created = await store.createAdmin(adminInput);
      const byId = await store.getAdminById(created.id);
      expect(byId?.name).toBe("Ada Lovelace");
      expect(byId && "passwordHash" in byId).toBe(false);

      const list = await store.listAdmins();
      expect(list).toHaveLength(1);
      expect("passwordHash" in list[0]).toBe(false);
    });

    it("updates name, role, and password hash and bumps updatedAt", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-06-01T10:00:00Z"));
      const created = await store.createAdmin(adminInput);

      vi.setSystemTime(new Date("2026-06-01T10:30:00Z"));
      const updated = await store.updateAdmin(created.id, {
        role: "reviewer",
        name: "Ada L.",
        passwordHash: "aa:bb",
      });
      expect(updated.role).toBe("reviewer");
      expect(updated.name).toBe("Ada L.");
      expect(updated.updatedAt > created.updatedAt).toBe(true);

      const record = await store.getAdminByIdentifier("ada");
      expect(record?.passwordHash).toBe("aa:bb");
    });

    it("throws when updating a missing admin and is a no-op deleting one", async () => {
      await expect(
        store.updateAdmin("missing", { role: "owner" }),
      ).rejects.toThrow(/not found/i);
      await expect(store.deleteAdmin("missing")).resolves.toBeUndefined();
    });

    it("deletes an admin", async () => {
      const created = await store.createAdmin(adminInput);
      await store.deleteAdmin(created.id);
      expect(await store.getAdminById(created.id)).toBeNull();
      expect(await store.listAdmins()).toEqual([]);
    });
  });

  describe("review claim lock", () => {
    const adminA = "11111111-1111-4111-8111-111111111111";
    const adminB = "22222222-2222-4222-8222-222222222222";

    it("claims a free submission and is idempotent for the same admin", async () => {
      const created = await store.createSubmission(contactInput);
      expect(created.reviewedBy).toBeNull();

      const claimed = await store.claimSubmission("contact", created.id, adminA);
      expect(claimed?.reviewedBy).toBe(adminA);

      // Re-claiming by the same admin succeeds (idempotent).
      const again = await store.claimSubmission("contact", created.id, adminA);
      expect(again?.reviewedBy).toBe(adminA);
    });

    it("returns null when another admin already holds the claim", async () => {
      const created = await store.createSubmission(contactInput);
      await store.claimSubmission("contact", created.id, adminA);
      const blocked = await store.claimSubmission("contact", created.id, adminB);
      expect(blocked).toBeNull();

      const fetched = await store.getSubmission("contact", created.id);
      expect(fetched?.reviewedBy).toBe(adminA);
    });

    it("returns null when claiming a missing submission", async () => {
      expect(
        await store.claimSubmission(
          "contact",
          "00000000-0000-4000-8000-000000000000",
          adminA,
        ),
      ).toBeNull();
    });

    it("releases the holder's own claim", async () => {
      const created = await store.createSubmission(contactInput);
      await store.claimSubmission("contact", created.id, adminA);
      await store.releaseSubmission("contact", created.id, adminA);
      const fetched = await store.getSubmission("contact", created.id);
      expect(fetched?.reviewedBy).toBeNull();
    });

    it("does not release another admin's claim without force", async () => {
      const created = await store.createSubmission(contactInput);
      await store.claimSubmission("contact", created.id, adminA);
      await store.releaseSubmission("contact", created.id, adminB);
      const fetched = await store.getSubmission("contact", created.id);
      expect(fetched?.reviewedBy).toBe(adminA);
    });

    it("force-releases another admin's claim", async () => {
      const created = await store.createSubmission(contactInput);
      await store.claimSubmission("contact", created.id, adminA);
      await store.releaseSubmission("contact", created.id, adminB, {
        force: true,
      });
      const fetched = await store.getSubmission("contact", created.id);
      expect(fetched?.reviewedBy).toBeNull();
    });
  });
});
