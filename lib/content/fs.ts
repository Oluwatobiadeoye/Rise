import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Marked } from "marked";
import type { ContentSource, Post, PostMeta } from "./types";

/*
 * Markdown here is committed to this repository and goes through pull-request
 * review before it ships, so the rendered HTML is trusted for
 * dangerouslySetInnerHTML. An adapter that pulls from a remote Content
 * Management System (CMS) must sanitize its output before rendering.
 */
const markdown = new Marked({ gfm: true });

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const REQUIRED_KEYS = ["title", "slug", "date", "excerpt", "author"] as const;

type ParsedPostFile = {
  meta: PostMeta;
  draft: boolean;
  body: string;
};

/** Resolved per call so the content root can be redirected via environment. */
function resolveRoot(root?: string): string {
  return (
    root ?? process.env.RISE_CONTENT_DIR ?? path.join(process.cwd(), "content")
  );
}

function fail(file: string, message: string): never {
  throw new Error(`Invalid content in ${file}: ${message}`);
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

function stripQuotes(value: string): string {
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * Minimal flat frontmatter parser: the file must open with `---`, carry one
 * `key: value` pair per line, and close with `---`; everything after the
 * closing fence is the markdown body. Deliberately not YAML: no nesting,
 * no lists, no multi-line values.
 */
function parseFrontmatter(
  file: string,
  input: string,
): { fields: Record<string, string>; body: string } {
  // Normalize Windows line endings so a CRLF-saved file parses identically.
  const raw = input.replace(/\r\n/g, "\n");
  if (!raw.startsWith("---\n")) {
    fail(file, "file must start with a `---` frontmatter fence");
  }
  const closeIndex = raw.indexOf("\n---\n", 3);
  if (closeIndex === -1) {
    fail(file, "frontmatter is missing its closing `---` fence");
  }

  const block = raw.slice(4, closeIndex);
  const body = raw.slice(closeIndex + 5);
  const fields: Record<string, string> = {};

  for (const line of block.split("\n")) {
    if (line.trim() === "") continue;
    const separator = line.indexOf(":");
    if (separator === -1) {
      fail(file, `frontmatter line ${JSON.stringify(line)} is not key: value`);
    }
    const key = line.slice(0, separator).trim();
    const value = stripQuotes(line.slice(separator + 1).trim());
    fields[key] = value;
  }

  return { fields, body };
}

function parseCover(
  file: string,
  fields: Record<string, string>,
): PostMeta["cover"] {
  const cover = fields.cover?.trim();
  if (!cover) return null;

  if (!cover.startsWith("/blog/")) {
    fail(file, `field "cover" must be a public path starting with /blog/`);
  }
  if (!fields.coverAlt?.trim()) {
    fail(file, `field "coverAlt" is required when "cover" is set`);
  }

  const dimensions: number[] = [];
  for (const key of ["coverWidth", "coverHeight"] as const) {
    const value = fields[key]?.trim();
    if (!value || !/^\d+$/.test(value) || Number.parseInt(value, 10) <= 0) {
      fail(
        file,
        `field "${key}" must be a positive integer when "cover" is set`,
      );
    }
    dimensions.push(Number.parseInt(value, 10));
  }

  return {
    src: cover,
    alt: fields.coverAlt.trim(),
    width: dimensions[0],
    height: dimensions[1],
  };
}

function parsePostFile(file: string, raw: string): ParsedPostFile {
  const { fields, body } = parseFrontmatter(file, raw);

  for (const key of REQUIRED_KEYS) {
    if (!fields[key]?.trim()) {
      fail(file, `required field "${key}" is missing or empty`);
    }
  }

  const slug = fields.slug.trim();
  if (!SLUG_PATTERN.test(slug)) {
    fail(file, `field "slug" (${JSON.stringify(slug)}) must be kebab-case`);
  }

  const date = fields.date.trim();
  if (!DATE_PATTERN.test(date) || Number.isNaN(Date.parse(date))) {
    fail(file, `field "date" (${JSON.stringify(date)}) must be YYYY-MM-DD`);
  }

  const draftValue = fields.draft?.trim() ?? "false";
  if (draftValue !== "true" && draftValue !== "false") {
    fail(file, `field "draft" must be "true" or "false"`);
  }

  return {
    meta: {
      slug,
      title: fields.title.trim(),
      date,
      excerpt: fields.excerpt.trim(),
      author: fields.author.trim(),
      cover: parseCover(file, fields),
    },
    draft: draftValue === "true",
    body,
  };
}

/** Reads and validates every post file, including drafts. */
async function readAllPosts(root: string): Promise<ParsedPostFile[]> {
  const blogDir = path.join(root, "blog");

  let entries: string[];
  try {
    entries = await readdir(blogDir);
  } catch (error) {
    // An absent blog directory is the designed launch state, not a failure.
    if (isMissingFileError(error)) return [];
    throw error;
  }

  const files = entries.filter((name) => name.endsWith(".md")).sort();
  const posts: ParsedPostFile[] = [];
  const seenSlugs = new Map<string, string>();

  for (const name of files) {
    const filePath = path.join(blogDir, name);
    const raw = await readFile(filePath, "utf8");
    const post = parsePostFile(filePath, raw);

    const existing = seenSlugs.get(post.meta.slug);
    if (existing) {
      fail(
        filePath,
        `slug "${post.meta.slug}" is already used by ${existing}`,
      );
    }
    seenSlugs.set(post.meta.slug, filePath);
    posts.push(post);
  }

  return posts;
}

export function createFsContentSource(root?: string): ContentSource {
  return {
    async listPosts(): Promise<PostMeta[]> {
      const posts = await readAllPosts(resolveRoot(root));
      return posts
        .filter((post) => !post.draft)
        .sort((a, b) => b.meta.date.localeCompare(a.meta.date))
        .map((post) => post.meta);
    },

    async getPost(slug: string): Promise<Post | null> {
      const posts = await readAllPosts(resolveRoot(root));
      const post = posts.find((p) => p.meta.slug === slug);
      if (!post || post.draft) return null;
      const bodyHtml = await markdown.parse(post.body, { async: true });
      return { ...post.meta, bodyHtml };
    },
  };
}
