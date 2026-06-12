import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ContentSource, Post, PostMeta } from "../types";

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

const fallback: ContentSource = {
  listPosts: vi.fn(async () => [{ ...meta, slug: "from-fallback" }]),
  getPost: vi.fn(async () => ({ ...meta, slug: "from-fallback", bodyHtml: "<p>fb</p>" })),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("createDbContentSource", () => {
  it("lists published posts from the store", async () => {
    listPublished.mockResolvedValue([meta]);
    const source = createDbContentSource(fallback);
    await expect(source.listPosts()).resolves.toEqual([meta]);
    expect(fallback.listPosts).not.toHaveBeenCalled();
  });

  it("sanitizes the body at read time", async () => {
    const dirty: Post = { ...meta, bodyHtml: "<p>ok</p><script>alert(1)</script>" };
    getPublishedBySlug.mockResolvedValue(dirty);
    const source = createDbContentSource(fallback);
    const post = await source.getPost("a-post");
    expect(post?.bodyHtml).toContain("<p>ok</p>");
    expect(post?.bodyHtml.toLowerCase()).not.toContain("<script");
  });

  it("returns null for an unknown/unpublished slug", async () => {
    getPublishedBySlug.mockResolvedValue(null);
    const source = createDbContentSource(fallback);
    await expect(source.getPost("missing")).resolves.toBeNull();
  });

  it("falls back to the filesystem source when listPublished throws", async () => {
    listPublished.mockRejectedValue(new Error('relation "posts" does not exist'));
    const source = createDbContentSource(fallback);
    const posts = await source.listPosts();
    expect(posts[0].slug).toBe("from-fallback");
    expect(fallback.listPosts).toHaveBeenCalled();
  });

  it("falls back to the filesystem source when getPost throws", async () => {
    getPublishedBySlug.mockRejectedValue(new Error("connection refused"));
    const source = createDbContentSource(fallback);
    const post = await source.getPost("a-post");
    expect(post?.slug).toBe("from-fallback");
    expect(fallback.getPost).toHaveBeenCalledWith("a-post");
  });
});
