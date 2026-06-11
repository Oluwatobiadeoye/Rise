import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  CycleRole,
  Cycles,
  NotifyMeEntry,
  PayloadByType,
  Submission,
  SubmissionStatus,
  SubmissionType,
} from "@/lib/types";
import type { SubmissionStore } from "./types";

const SUBMISSION_TYPES: readonly SubmissionType[] = [
  "contact",
  "mentor",
  "mentee",
  "volunteer",
];

function defaultCycles(): Cycles {
  return {
    mentor: { open: false, updatedAt: null },
    mentee: { open: false, updatedAt: null },
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
  const cyclesFile = () => path.join(resolveRoot(), "cycles.json");
  const notifyMeDir = (role: CycleRole) =>
    path.join(resolveRoot(), "notify-me", role);

  async function getCycles(): Promise<Cycles> {
    let stored: Partial<Cycles> | null = null;
    try {
      stored = await readJsonIfExists<Partial<Cycles>>(cyclesFile());
    } catch (error) {
      console.error(`Skipping unreadable cycles file ${cyclesFile()}`, error);
    }
    return { ...defaultCycles(), ...stored };
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
    async createSubmission<T extends SubmissionType>(
      type: T,
      payload: PayloadByType[T],
      meta?: { from?: string | null },
    ): Promise<Submission<T>> {
      const now = new Date().toISOString();
      const submission: Submission<T> = {
        id: randomUUID(),
        type,
        payload,
        status: "new",
        notes: "",
        from: meta?.from ?? null,
        createdAt: now,
        updatedAt: now,
      };
      await writeJsonAtomic(submissionFile(type, submission.id), submission);
      return submission;
    },

    async listSubmissions(filter?: {
      type?: SubmissionType;
      status?: SubmissionStatus;
    }): Promise<Submission[]> {
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
      return filtered;
    },

    async getSubmission<T extends SubmissionType>(
      type: T,
      id: string,
    ): Promise<Submission<T> | null> {
      return readJsonIfExists<Submission<T>>(submissionFile(type, id));
    },

    async updateSubmission<T extends SubmissionType>(
      type: T,
      id: string,
      patch: { status?: SubmissionStatus; notes?: string },
    ): Promise<Submission<T>> {
      const existing = await readJsonIfExists<Submission<T>>(
        submissionFile(type, id),
      );
      if (!existing) {
        throw new Error(`Submission not found: ${type}/${id}`);
      }
      const updated: Submission<T> = {
        ...existing,
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
        updatedAt: new Date().toISOString(),
      };
      await writeJsonAtomic(submissionFile(type, id), updated);
      return updated;
    },

    getCycles,

    async setCycle(role: CycleRole, open: boolean): Promise<Cycles> {
      const cycles = await getCycles();
      cycles[role] = { open, updatedAt: new Date().toISOString() };
      await writeJsonAtomic(cyclesFile(), cycles);
      return cycles;
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
  };
}
