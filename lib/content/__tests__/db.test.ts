import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Post, PostMeta } from "../types";

vi.mock("server-only", () => ({}));

const listPublished = vi.fn();
const getPublishedBySlug = vi.fn();
vi.mock("@/lib/db/blog", () => ({
  blogStore: {
    listPublished: () => listPublished(),
    getPublishedBySlug: (slug: string) => getPublishedBySlug(slug),
  },
}));

import { createDbContentSource } from "../db";

const meta: PostMeta = {
  slug: "a-post",
  title: "A post",
  date: "2026-01-01",
  excerpt: "x",
  author: "RISE",
  readingMinutes: 1,
  cover: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createDbContentSource", () => {
  it("lists published posts from the store", async () => {
    listPublished.mockResolvedValue([meta]);
    const source = createDbContentSource();
    await expect(source.listPosts()).resolves.toEqual([meta]);
  });

  it("sanitizes the body at read time", async () => {
    const dirty: Post = {
      ...meta,
      bodyHtml: "<p>ok</p><script>alert(1)</script>",
    };
    getPublishedBySlug.mockResolvedValue(dirty);
    const source = createDbContentSource();
    const post = await source.getPost("a-post");
    expect(post?.bodyHtml).toContain("<p>ok</p>");
    expect(post?.bodyHtml.toLowerCase()).not.toContain("<script");
  });

  it("returns null for an unknown/unpublished slug", async () => {
    getPublishedBySlug.mockResolvedValue(null);
    const source = createDbContentSource();
    await expect(source.getPost("missing")).resolves.toBeNull();
  });

  it("propagates store errors (no filesystem fallback)", async () => {
    listPublished.mockRejectedValue(new Error("connection refused"));
    const source = createDbContentSource();
    await expect(source.listPosts()).rejects.toThrow("connection refused");
  });
});
