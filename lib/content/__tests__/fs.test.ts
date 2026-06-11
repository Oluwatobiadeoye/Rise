// @vitest-environment node
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createFsContentSource } from "../fs";

const fixture = (name: string) =>
  path.join(import.meta.dirname, "fixtures", name);

const populated = createFsContentSource(fixture("populated"));
const empty = createFsContentSource(fixture("empty"));
const missing = createFsContentSource(fixture("does-not-exist"));

describe("listPosts", () => {
  it("returns published posts newest first", async () => {
    const posts = await populated.listPosts();
    expect(posts.map((post) => post.slug)).toEqual([
      "bootcamp-recap-three-days-in-oyo",
      "welcoming-our-first-cohort",
    ]);
  });

  it("excludes drafts", async () => {
    const posts = await populated.listPosts();
    expect(posts.find((post) => post.slug === "not-ready-yet")).toBeUndefined();
  });

  it("parses frontmatter, stripping surrounding quotes", async () => {
    const posts = await populated.listPosts();
    const recap = posts[0];
    expect(recap.title).toBe("Bootcamp recap: three days in Oyo");
    expect(recap.excerpt).toBe("Highlights from our latest leadership bootcamp.");
    expect(recap.author).toBe("Ayo Adekunle");
    expect(recap.date).toBe("2026-03-05");
  });

  it("builds the cover object when cover fields are present", async () => {
    const posts = await populated.listPosts();
    expect(posts[0].cover).toEqual({
      src: "/blog/bootcamp-recap/cover.jpg",
      alt: "Students gathered outside the bootcamp venue",
      width: 1600,
      height: 900,
    });
    expect(posts[1].cover).toBeNull();
  });

  it("returns [] for an empty blog directory", async () => {
    await expect(empty.listPosts()).resolves.toEqual([]);
  });

  it("returns [] when the blog directory does not exist", async () => {
    await expect(missing.listPosts()).resolves.toEqual([]);
  });
});

describe("getPost", () => {
  it("renders the markdown body to HTML", async () => {
    const post = await populated.getPost("welcoming-our-first-cohort");
    expect(post).not.toBeNull();
    expect(post?.bodyHtml).toContain("<h2>A strong start</h2>");
    expect(post?.bodyHtml).toContain("<li>Orientation week</li>");
    expect(post?.bodyHtml).toContain('<a href="/projects">our programmes</a>');
  });

  it("returns null for an unknown slug", async () => {
    await expect(populated.getPost("no-such-post")).resolves.toBeNull();
  });

  it("returns null for a draft", async () => {
    await expect(populated.getPost("not-ready-yet")).resolves.toBeNull();
  });
});

describe("validation errors", () => {
  const expectListError = async (name: string, pattern: RegExp) => {
    const source = createFsContentSource(fixture(name));
    await expect(source.listPosts()).rejects.toThrow(pattern);
  };

  it("names the file and field for a missing required field", async () => {
    await expectListError(
      "invalid-missing-title",
      /post\.md.*"title" is missing or empty/,
    );
  });

  it("rejects a slug that is not kebab-case", async () => {
    await expectListError("invalid-bad-slug", /post\.md.*"slug".*kebab-case/);
  });

  it("rejects a date that is not YYYY-MM-DD", async () => {
    await expectListError("invalid-bad-date", /post\.md.*"date".*YYYY-MM-DD/);
  });

  it("rejects duplicate slugs across files", async () => {
    await expectListError(
      "invalid-duplicate-slug",
      /b\.md.*slug "same-slug" is already used by .*a\.md/,
    );
  });

  it("rejects a cover without alt text", async () => {
    await expectListError(
      "invalid-cover-no-alt",
      /post\.md.*"coverAlt" is required when "cover" is set/,
    );
  });

  it("rejects a cover without dimensions", async () => {
    await expectListError(
      "invalid-cover-no-dimensions",
      /post\.md.*"coverWidth" must be a positive integer/,
    );
  });
});

describe("listGalleryItems", () => {
  it("returns items in manifest order with optional fields normalised", async () => {
    const items = await populated.listGalleryItems();
    expect(items.map((item) => item.id)).toEqual([
      "bootcamp-opening",
      "mentor-circle",
    ]);
    expect(items[0]).toEqual({
      id: "bootcamp-opening",
      src: "/gallery/bootcamp-opening.jpg",
      alt: "Students at the bootcamp opening ceremony",
      caption: "Opening day",
      width: 1600,
      height: 1200,
      takenAt: "2026-03-02",
    });
    expect(items[1].caption).toBeNull();
    expect(items[1].takenAt).toBeNull();
  });

  it("returns [] for an empty manifest", async () => {
    await expect(empty.listGalleryItems()).resolves.toEqual([]);
  });

  it("returns [] when the manifest does not exist", async () => {
    await expect(missing.listGalleryItems()).resolves.toEqual([]);
  });

  it("rejects duplicate ids", async () => {
    const source = createFsContentSource(fixture("invalid-gallery-duplicate-id"));
    await expect(source.listGalleryItems()).rejects.toThrow(
      /manifest\.json.*duplicate id "repeat"/,
    );
  });

  it("rejects an item without alt text", async () => {
    const source = createFsContentSource(fixture("invalid-gallery-missing-alt"));
    await expect(source.listGalleryItems()).rejects.toThrow(
      /manifest\.json.*item 0.*"alt" is missing or empty/,
    );
  });
});

describe("lazy root resolution", () => {
  it("honours RISE_CONTENT_DIR set after the source is created", async () => {
    const source = createFsContentSource();
    const previous = process.env.RISE_CONTENT_DIR;
    process.env.RISE_CONTENT_DIR = fixture("populated");
    try {
      const posts = await source.listPosts();
      expect(posts).toHaveLength(2);
    } finally {
      if (previous === undefined) delete process.env.RISE_CONTENT_DIR;
      else process.env.RISE_CONTENT_DIR = previous;
    }
  });
});
