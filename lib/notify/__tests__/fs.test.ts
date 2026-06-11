// @vitest-environment node
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFsNotifier } from "../fs";
import type { NotificationInput } from "@/lib/types";

const input: NotificationInput = {
  kind: "submission-received",
  to: "team@example.invalid",
  subject: "New contact submission from Ada Obi",
  body: "New contact submission received.",
  submission: { type: "contact", id: "abc-123" },
};

describe("createFsNotifier", () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), "rise-notify-"));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("writes one JSON file per notification and returns the record", async () => {
    const notifier = createFsNotifier(root);
    const record = await notifier.send(input);

    expect(record).toMatchObject(input);
    expect(record.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(new Date(record.createdAt).toISOString()).toBe(record.createdAt);

    const dir = path.join(root, "notifications");
    const files = await readdir(dir);
    expect(files).toHaveLength(1);
    expect(files[0]).toContain(record.id);
    expect(files[0].endsWith(".json")).toBe(true);
    expect(files[0]).not.toContain(":");

    const stored = JSON.parse(await readFile(path.join(dir, files[0]), "utf8"));
    expect(stored).toEqual(record);
  });

  it("keeps null submission references intact", async () => {
    const notifier = createFsNotifier(root);
    const record = await notifier.send({ ...input, submission: null });
    expect(record.submission).toBeNull();
  });
});
