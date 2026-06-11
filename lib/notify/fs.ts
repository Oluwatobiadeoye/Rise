import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { NotificationInput, NotificationRecord } from "@/lib/types";
import type { Notifier } from "./types";

/**
 * Filesystem-backed {@link Notifier}: appends one JSON file per notification
 * under `data/notifications/` instead of sending email.
 */
export function createFsNotifier(root?: string): Notifier {
  // Resolved lazily per call so tests and deploys can repoint the data root
  // through the environment without re-creating the notifier.
  const resolveRoot = () =>
    root ?? process.env.RISE_DATA_DIR ?? path.join(process.cwd(), "data");

  return {
    async send(input: NotificationInput): Promise<NotificationRecord> {
      const createdAt = new Date().toISOString();
      const record: NotificationRecord = {
        ...input,
        id: randomUUID(),
        createdAt,
      };
      const dir = path.join(resolveRoot(), "notifications");
      const file = path.join(
        dir,
        `${createdAt.replace(/[:.]/g, "-")}-${record.id}.json`,
      );
      await mkdir(dir, { recursive: true });
      // Unique temp file + rename keeps the write atomic for readers.
      const tmp = `${file}.${randomUUID()}.tmp`;
      await writeFile(tmp, JSON.stringify(record, null, 2), "utf8");
      await rename(tmp, file);
      return record;
    },
  };
}
