// @vitest-environment node
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

  describe("listNotifications", () => {
    it("returns an empty array when the directory does not exist", async () => {
      const notifier = createFsNotifier(root);
      await expect(notifier.listNotifications()).resolves.toEqual([]);
    });

    it("returns records newest first and filters by kind", async () => {
      const notifier = createFsNotifier(root);
      const first = await notifier.send(input);
      // Ensure a strictly later createdAt for deterministic ordering.
      await new Promise((resolve) => setTimeout(resolve, 5));
      const second = await notifier.send({
        ...input,
        kind: "decision-email",
        to: "applicant@example.invalid",
        submission: null,
      });

      const all = await notifier.listNotifications();
      expect(all.map((r) => r.id)).toEqual([second.id, first.id]);

      const decisions = await notifier.listNotifications({
        kind: "decision-email",
      });
      expect(decisions).toHaveLength(1);
      expect(decisions[0].id).toBe(second.id);
    });

    it("skips a corrupt file with a console.error and returns the rest", async () => {
      const notifier = createFsNotifier(root);
      const good = await notifier.send(input);

      const dir = path.join(root, "notifications");
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, "corrupt.json"), "{ not json", "utf8");

      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      const records = await notifier.listNotifications();
      expect(records).toHaveLength(1);
      expect(records[0].id).toBe(good.id);
      expect(spy).toHaveBeenCalledOnce();
      spy.mockRestore();
    });
  });
});
