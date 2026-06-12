import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  Admin,
  AdminInput,
  AdminRecord,
  AdminRole,
  Cycle,
  CycleInput,
  CycleRole,
  NotifyMeEntry,
  Submission,
  SubmissionInput,
  SubmissionOf,
  SubmissionStatus,
  SubmissionSummary,
  SubmissionType,
} from "@/lib/types";
import type { SubmissionStore } from "./types";

/** Strips the password hash from a stored admin record. */
function stripHash(record: AdminRecord): Admin {
  return {
    id: record.id,
    username: record.username,
    email: record.email,
    name: record.name,
    role: record.role,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

const SUBMISSION_TYPES: readonly SubmissionType[] = [
  "contact",
  "mentor",
  "mentee",
  "volunteer",
];

/** Projects a stored submission to the listing-level summary. */
function toSummary(submission: Submission): SubmissionSummary {
  return {
    id: submission.id,
    type: submission.type,
    fullName: submission.fullName,
    email: submission.email,
    status: submission.status,
    notes: submission.notes,
    from: submission.from,
    reviewedBy: submission.reviewedBy ?? null,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  };
}

/** Writes via a unique temp file + rename so readers never see partial JSON. */
async function writeJsonAtomic(file: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${randomUUID()}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await rename(tmp, file);
}

/** Returns null when the file does not exist; throws on other failures. */
async function readJsonIfExists<T>(file: string): Promise<T | null> {
  let raw: string;
  try {
    raw = await readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
  return JSON.parse(raw) as T;
}

/** Lists the JSON record files of a directory; a missing directory is an empty state. */
async function listJsonFiles(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir);
    return entries.filter((name) => name.endsWith(".json"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

/**
 * Filesystem-backed {@link SubmissionStore}: one JSON file per record under
 * the data root, created on demand.
 *
 * Concurrency note: read-modify-write here is not transactional, which is
 * acceptable for a single-process deployment at this traffic level. Supabase
 * replaces this implementation before scale becomes a concern.
 */
export function createFsSubmissionStore(root?: string): SubmissionStore {
  // Resolved lazily per call so tests and deploys can repoint the data root
  // through the environment without re-creating the store.
  const resolveRoot = () =>
    root ?? process.env.RISE_DATA_DIR ?? path.join(process.cwd(), "data");

  const submissionFile = (type: SubmissionType, id: string) =>
    path.join(resolveRoot(), "submissions", type, `${id}.json`);
  const submissionsDir = (type: SubmissionType) =>
    path.join(resolveRoot(), "submissions", type);
  const cyclesDir = () => path.join(resolveRoot(), "cycles");
  const cycleFile = (id: string) => path.join(cyclesDir(), `${id}.json`);
  const notifyMeDir = (role: CycleRole) =>
    path.join(resolveRoot(), "notify-me", role);
  const adminsDir = () => path.join(resolveRoot(), "admins");
  const adminFile = (id: string) => path.join(adminsDir(), `${id}.json`);

  async function listAdminRecords(): Promise<AdminRecord[]> {
    const dir = adminsDir();
    const files = await listJsonFiles(dir);
    const records: AdminRecord[] = [];
    for (const name of files) {
      const file = path.join(dir, name);
      try {
        const record = await readJsonIfExists<AdminRecord>(file);
        if (record) records.push(record);
      } catch (error) {
        console.error(`Skipping unreadable admin file ${file}`, error);
      }
    }
    records.sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id),
    );
    return records;
  }

  async function listCycles(role?: CycleRole): Promise<Cycle[]> {
    const dir = cyclesDir();
    const files = await listJsonFiles(dir);
    const cycles: Cycle[] = [];
    for (const name of files) {
      const file = path.join(dir, name);
      try {
        const cycle = await readJsonIfExists<Cycle>(file);
        if (cycle && (!role || cycle.role === role)) cycles.push(cycle);
      } catch (error) {
        console.error(`Skipping unreadable cycle file ${file}`, error);
      }
    }
    cycles.sort((a, b) => b.openAt.localeCompare(a.openAt));
    return cycles;
  }

  async function listNotifyMe(role: CycleRole): Promise<NotifyMeEntry[]> {
    const dir = notifyMeDir(role);
    const files = await listJsonFiles(dir);
    const entries: NotifyMeEntry[] = [];
    for (const name of files) {
      const file = path.join(dir, name);
      try {
        const entry = await readJsonIfExists<NotifyMeEntry>(file);
        if (entry) entries.push(entry);
      } catch (error) {
        console.error(`Skipping unreadable notify-me file ${file}`, error);
      }
    }
    entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return entries;
  }

  return {
    async createSubmission(
      input: SubmissionInput,
      meta?: { from?: string | null; cycleId?: string | null },
    ): Promise<Submission> {
      const now = new Date().toISOString();
      const submission = {
        ...input,
        id: randomUUID(),
        status: "pending",
        notes: "",
        from: meta?.from ?? null,
        reviewedBy: null,
        // Only applications belong to a cycle; enquiries are always-on.
        ...(input.type === "mentor" || input.type === "mentee"
          ? { cycleId: meta?.cycleId ?? null }
          : {}),
        createdAt: now,
        updatedAt: now,
      } as Submission;
      await writeJsonAtomic(submissionFile(input.type, submission.id), submission);
      return submission;
    },

    async listSubmissions(filter?: {
      type?: SubmissionType;
      status?: SubmissionStatus;
    }): Promise<SubmissionSummary[]> {
      const types = filter?.type ? [filter.type] : SUBMISSION_TYPES;
      const submissions: Submission[] = [];
      for (const type of types) {
        const dir = submissionsDir(type);
        for (const name of await listJsonFiles(dir)) {
          const file = path.join(dir, name);
          try {
            const submission = await readJsonIfExists<Submission>(file);
            if (submission) submissions.push(submission);
          } catch (error) {
            console.error(`Skipping unreadable submission file ${file}`, error);
          }
        }
      }
      const filtered = filter?.status
        ? submissions.filter((s) => s.status === filter.status)
        : submissions;
      filtered.sort(
        (a, b) =>
          b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id),
      );
      return filtered.map(toSummary);
    },

    async getSubmission<K extends SubmissionType>(
      type: K,
      id: string,
    ): Promise<SubmissionOf<K> | null> {
      const submission = await readJsonIfExists<SubmissionOf<K>>(
        submissionFile(type, id),
      );
      return submission;
    },

    async updateSubmission<K extends SubmissionType>(
      type: K,
      id: string,
      patch: { status?: SubmissionOf<K>["status"]; notes?: string },
    ): Promise<SubmissionOf<K>> {
      const existing = await readJsonIfExists<SubmissionOf<K>>(
        submissionFile(type, id),
      );
      if (!existing) {
        throw new Error(`Submission not found: ${type}/${id}`);
      }
      const updated: SubmissionOf<K> = {
        ...existing,
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
        updatedAt: new Date().toISOString(),
      };
      await writeJsonAtomic(submissionFile(type, id), updated);
      return updated;
    },

    listCycles,

    async getActiveCycle(role: CycleRole): Promise<Cycle | null> {
      const nowIso = new Date().toISOString();
      const cycles = await listCycles(role);
      return (
        cycles.find((c) => c.openAt <= nowIso && nowIso < c.closeAt) ?? null
      );
    },

    async createCycle(input: CycleInput): Promise<Cycle> {
      const now = new Date().toISOString();
      const cycle: Cycle = {
        id: randomUUID(),
        role: input.role,
        label: input.label,
        openAt: input.openAt,
        closeAt: input.closeAt,
        createdAt: now,
        updatedAt: now,
      };
      await writeJsonAtomic(cycleFile(cycle.id), cycle);
      return cycle;
    },

    async updateCycle(
      id: string,
      patch: { label?: string; openAt?: string; closeAt?: string },
    ): Promise<Cycle> {
      const existing = await readJsonIfExists<Cycle>(cycleFile(id));
      if (!existing) throw new Error(`Cycle not found: ${id}`);
      const updated: Cycle = {
        ...existing,
        ...(patch.label !== undefined ? { label: patch.label } : {}),
        ...(patch.openAt !== undefined ? { openAt: patch.openAt } : {}),
        ...(patch.closeAt !== undefined ? { closeAt: patch.closeAt } : {}),
        updatedAt: new Date().toISOString(),
      };
      await writeJsonAtomic(cycleFile(id), updated);
      return updated;
    },

    async deleteCycle(id: string): Promise<void> {
      await rm(cycleFile(id), { force: true });
    },

    async addNotifyMe(role: CycleRole, email: string): Promise<NotifyMeEntry> {
      const normalized = email.trim().toLowerCase();
      const existing = (await listNotifyMe(role)).find(
        (entry) => entry.email === normalized,
      );
      if (existing) return existing;
      const entry: NotifyMeEntry = {
        id: randomUUID(),
        role,
        email: normalized,
        createdAt: new Date().toISOString(),
      };
      await writeJsonAtomic(
        path.join(notifyMeDir(role), `${entry.id}.json`),
        entry,
      );
      return entry;
    },

    listNotifyMe,

    async createAdmin(input: AdminInput): Promise<Admin> {
      const username = input.username.trim();
      const email = input.email.trim().toLowerCase();
      const existing = await listAdminRecords();
      if (
        existing.some(
          (a) =>
            a.username.toLowerCase() === username.toLowerCase() ||
            a.email.toLowerCase() === email,
        )
      ) {
        throw new Error("An admin with that username or email already exists.");
      }
      const now = new Date().toISOString();
      const record: AdminRecord = {
        id: randomUUID(),
        username,
        email,
        name: input.name.trim(),
        role: input.role,
        passwordHash: input.passwordHash,
        createdAt: now,
        updatedAt: now,
      };
      await writeJsonAtomic(adminFile(record.id), record);
      return stripHash(record);
    },

    async getAdminByIdentifier(
      identifier: string,
    ): Promise<AdminRecord | null> {
      const trimmed = identifier.trim();
      if (!trimmed) return null;
      const lowered = trimmed.toLowerCase();
      const records = await listAdminRecords();
      return (
        records.find(
          (a) => a.username === trimmed || a.email.toLowerCase() === lowered,
        ) ?? null
      );
    },

    async getAdminById(id: string): Promise<Admin | null> {
      const record = await readJsonIfExists<AdminRecord>(adminFile(id));
      return record ? stripHash(record) : null;
    },

    async listAdmins(): Promise<Admin[]> {
      const records = await listAdminRecords();
      return records.map(stripHash);
    },

    async updateAdmin(
      id: string,
      patch: { name?: string; role?: AdminRole; passwordHash?: string },
    ): Promise<Admin> {
      const existing = await readJsonIfExists<AdminRecord>(adminFile(id));
      if (!existing) throw new Error(`Admin not found: ${id}`);
      const updated: AdminRecord = {
        ...existing,
        ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
        ...(patch.role !== undefined ? { role: patch.role } : {}),
        ...(patch.passwordHash !== undefined
          ? { passwordHash: patch.passwordHash }
          : {}),
        updatedAt: new Date().toISOString(),
      };
      await writeJsonAtomic(adminFile(id), updated);
      return stripHash(updated);
    },

    async deleteAdmin(id: string): Promise<void> {
      await rm(adminFile(id), { force: true });
    },

    async claimSubmission<K extends SubmissionType>(
      type: K,
      id: string,
      adminId: string,
    ): Promise<SubmissionOf<K> | null> {
      // Read-modify-write: NOT atomic under true concurrency. Acceptable for the
      // single-process dev fallback only; the Drizzle store enforces atomicity.
      const existing = await readJsonIfExists<SubmissionOf<K>>(
        submissionFile(type, id),
      );
      if (!existing) return null;
      const current = existing.reviewedBy ?? null;
      if (current !== null && current !== adminId) return null;
      const updated: SubmissionOf<K> = {
        ...existing,
        reviewedBy: adminId,
        updatedAt: new Date().toISOString(),
      };
      await writeJsonAtomic(submissionFile(type, id), updated);
      return updated;
    },

    async releaseSubmission(
      type: SubmissionType,
      id: string,
      adminId: string,
      opts?: { force?: boolean },
    ): Promise<void> {
      const existing = await readJsonIfExists<Submission>(
        submissionFile(type, id),
      );
      if (!existing) return;
      const current = existing.reviewedBy ?? null;
      if (!opts?.force && current !== adminId) return;
      const updated = {
        ...existing,
        reviewedBy: null,
        updatedAt: new Date().toISOString(),
      } as Submission;
      await writeJsonAtomic(submissionFile(type, id), updated);
    },
  };
}
