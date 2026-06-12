// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminPost } from "@/lib/content/types";

// Hoisted so the (hoisted) vi.mock factories below can reference them.
const { store, requireCan, uploadImage, checkRateLimit } = vi.hoisted(() => ({
  store: {
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    publish: vi.fn(),
    unpublish: vi.fn(),
    archive: vi.fn(),
  },
  requireCan: vi.fn(),
  uploadImage: vi.fn(),
  checkRateLimit: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/admin/permissions", () => ({ requireCan }));
vi.mock("@/lib/db/blog", () => ({ blogStore: store }));
vi.mock("@/lib/blog/storage", () => ({ uploadImage }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit }));

import {
  saveBlogPost,
  publishBlogPost,
  uploadBlogImage,
} from "../blog";

const adminPost = (over: Partial<AdminPost> = {}): AdminPost => ({
  id: "p1",
  slug: "my-post",
  title: "My post",
  excerpt: "An excerpt",
  author: "RISE",
  bodyHtml: "<p>Body text here.</p>",
  readingMinutes: 1,
  cover: null,
  status: "draft",
  publishedAt: null,
  firstPublishedAt: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...over,
});

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  requireCan.mockResolvedValue({ id: "admin1", role: "owner" });
  checkRateLimit.mockReturnValue(true);
  store.create.mockResolvedValue(adminPost());
  store.update.mockResolvedValue(adminPost());
});

describe("saveBlogPost", () => {
  it("requires the manage-blog capability", async () => {
    await saveBlogPost(null, form({ title: "x" }));
    expect(requireCan).toHaveBeenCalled();
  });

  it("returns a field error when the title is missing", async () => {
    const result = await saveBlogPost(null, form({ title: "" }));
    expect(result).toEqual({ ok: false, error: expect.any(String), field: "title" });
    expect(store.create).not.toHaveBeenCalled();
  });

  it("creates a new draft and returns its id and slug", async () => {
    store.create.mockResolvedValue(adminPost());
    const result = await saveBlogPost(null, form({ title: "My post", slug: "my-post" }));
    expect(store.create).toHaveBeenCalled();
    expect(result).toEqual({ ok: true, id: "p1", slug: "my-post" });
  });

  it("locks the slug to the stored value once first published", async () => {
    store.getById.mockResolvedValue(
      adminPost({ slug: "original-slug", firstPublishedAt: "2026-01-01T00:00:00Z" }),
    );
    store.update.mockResolvedValue(adminPost({ slug: "original-slug" }));
    await saveBlogPost(null, form({ id: "p1", title: "Renamed", slug: "a-new-slug" }));
    expect(store.update).toHaveBeenCalledWith(
      "p1",
      expect.objectContaining({ slug: "original-slug" }),
    );
  });
});

describe("publishBlogPost", () => {
  it("blocks publishing without an excerpt", async () => {
    store.create.mockResolvedValue(adminPost({ excerpt: "" }));
    const result = await publishBlogPost(null, form({ title: "My post", slug: "my-post", excerpt: "" }));
    expect(result).toMatchObject({ ok: false, field: "excerpt" });
    expect(store.publish).not.toHaveBeenCalled();
  });

  it("blocks publishing with an empty body", async () => {
    store.create.mockResolvedValue(adminPost({ bodyHtml: "" }));
    const result = await publishBlogPost(
      null,
      form({ title: "My post", slug: "my-post", excerpt: "ok", bodyHtml: "" }),
    );
    expect(result).toMatchObject({ ok: false, field: "bodyHtml" });
    expect(store.publish).not.toHaveBeenCalled();
  });

  it("publishes a valid post", async () => {
    store.create.mockResolvedValue(adminPost());
    store.publish.mockResolvedValue(adminPost({ status: "published" }));
    const result = await publishBlogPost(
      null,
      form({ title: "My post", slug: "my-post", excerpt: "ok", bodyHtml: "<p>Body</p>" }),
    );
    expect(store.publish).toHaveBeenCalledWith("p1");
    expect(result).toEqual({ ok: true, id: "p1", slug: "my-post" });
  });
});

describe("uploadBlogImage", () => {
  it("rejects when over the rate limit", async () => {
    checkRateLimit.mockReturnValue(false);
    const fd = new FormData();
    fd.set("file", new File([new Uint8Array([1, 2, 3])], "x.png", { type: "image/png" }));
    const result = await uploadBlogImage(null, fd);
    expect(result.ok).toBe(false);
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("rejects when no file is provided", async () => {
    const result = await uploadBlogImage(null, new FormData());
    expect(result.ok).toBe(false);
  });

  it("returns the uploaded URL and dimensions", async () => {
    uploadImage.mockResolvedValue({ url: "https://e/blog/x.png", width: 800, height: 600 });
    const fd = new FormData();
    fd.set("file", new File([new Uint8Array([1, 2, 3])], "x.png", { type: "image/png" }));
    const result = await uploadBlogImage(null, fd);
    expect(result).toEqual({ ok: true, url: "https://e/blog/x.png", width: 800, height: 600 });
  });
});
