import "server-only";

import { and, desc, eq } from "drizzle-orm";
import type {
  AdminPost,
  AdminPostSummary,
  Post,
  PostCover,
  PostInput,
  PostMeta,
  PostStatus,
} from "@/lib/content/types";
import { getDb, isDatabaseConfigured } from "./client";
import { posts } from "./schema";

type PostRow = typeof posts.$inferSelect;

/**
 * Persistence for blog posts. Reads for the public site (`listPublished`,
 * `getPublishedBySlug`) return only published rows; the admin methods see every
 * status. The stored `bodyHtml` is returned verbatim — callers sanitize on read.
 */
export interface BlogStore {
  /** Published posts, newest first, as listing metadata. */
  listPublished(): Promise<PostMeta[]>;
  /** A published post by slug (raw stored HTML), or null. */
  getPublishedBySlug(slug: string): Promise<Post | null>;

  /** Every post (any status), newest activity first. */
  listAll(): Promise<AdminPostSummary[]>;
  /** Full admin post by id, or null. */
  getById(id: string): Promise<AdminPost | null>;

  /** Creates a draft, returning the stored record. */
  create(input: PostInput): Promise<AdminPost>;
  /** Overwrites the editable fields of a post. Throws if missing. */
  update(id: string, input: PostInput): Promise<AdminPost>;
  /** Marks published, stamping publishedAt (and firstPublishedAt once). */
  publish(id: string): Promise<AdminPost>;
  /** Returns a published post to draft. */
  unpublish(id: string): Promise<AdminPost>;
  /** Withdraws a post (recoverable, never shown publicly). */
  archive(id: string): Promise<AdminPost>;
}

function rowToCover(row: PostRow): PostCover | null {
  if (
    !row.coverSrc ||
    row.coverAlt === null ||
    row.coverWidth === null ||
    row.coverHeight === null
  ) {
    return null;
  }
  return {
    src: row.coverSrc,
    alt: row.coverAlt,
    width: row.coverWidth,
    height: row.coverHeight,
  };
}

function rowToPostMeta(row: PostRow): PostMeta {
  return {
    slug: row.slug,
    title: row.title,
    // The public template expects a YYYY-MM-DD date; published rows always have
    // publishedAt, but fall back to createdAt defensively.
    date: (row.publishedAt ?? row.createdAt).slice(0, 10),
    excerpt: row.excerpt,
    author: row.author,
    readingMinutes: row.readingMinutes,
    cover: rowToCover(row),
  };
}

function rowToPost(row: PostRow): Post {
  return { ...rowToPostMeta(row), bodyHtml: row.bodyHtml };
}

function rowToAdminPost(row: PostRow): AdminPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    author: row.author,
    bodyHtml: row.bodyHtml,
    readingMinutes: row.readingMinutes,
    cover: rowToCover(row),
    status: row.status as PostStatus,
    publishedAt: row.publishedAt,
    firstPublishedAt: row.firstPublishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function rowToAdminSummary(row: PostRow): AdminPostSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status as PostStatus,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
  };
}

/** Maps an input's cover to the table's nullable column group. */
function coverColumns(cover: PostCover | null) {
  return {
    coverSrc: cover?.src ?? null,
    coverAlt: cover?.alt ?? null,
    coverWidth: cover?.width ?? null,
    coverHeight: cover?.height ?? null,
  };
}

function createDrizzleBlogStore(): BlogStore {
  async function requireById(id: string): Promise<PostRow> {
    const db = getDb();
    const [row] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (!row) throw new Error(`Post not found: ${id}`);
    return row;
  }

  return {
    async listPublished(): Promise<PostMeta[]> {
      const db = getDb();
      const rows = await db
        .select()
        .from(posts)
        .where(eq(posts.status, "published"))
        .orderBy(desc(posts.publishedAt));
      return rows.map(rowToPostMeta);
    },

    async getPublishedBySlug(slug: string): Promise<Post | null> {
      const db = getDb();
      const [row] = await db
        .select()
        .from(posts)
        .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
        .limit(1);
      return row ? rowToPost(row) : null;
    },

    async listAll(): Promise<AdminPostSummary[]> {
      const db = getDb();
      const rows = await db
        .select()
        .from(posts)
        .orderBy(desc(posts.updatedAt));
      return rows.map(rowToAdminSummary);
    },

    async getById(id: string): Promise<AdminPost | null> {
      const db = getDb();
      const [row] = await db
        .select()
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1);
      return row ? rowToAdminPost(row) : null;
    },

    async create(input: PostInput): Promise<AdminPost> {
      const db = getDb();
      try {
        const [row] = await db
          .insert(posts)
          .values({
            slug: input.slug,
            title: input.title,
            excerpt: input.excerpt,
            author: input.author,
            bodyHtml: input.bodyHtml,
            readingMinutes: input.readingMinutes,
            ...coverColumns(input.cover),
          })
          .returning();
        return rowToAdminPost(row);
      } catch (error) {
        if ((error as { code?: string }).code === "23505") {
          throw new Error("A post with that URL slug already exists.");
        }
        throw error;
      }
    },

    async update(id: string, input: PostInput): Promise<AdminPost> {
      const db = getDb();
      try {
        const rows = await db
          .update(posts)
          .set({
            slug: input.slug,
            title: input.title,
            excerpt: input.excerpt,
            author: input.author,
            bodyHtml: input.bodyHtml,
            readingMinutes: input.readingMinutes,
            ...coverColumns(input.cover),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(posts.id, id))
          .returning();
        if (rows.length === 0) throw new Error(`Post not found: ${id}`);
        return rowToAdminPost(rows[0]);
      } catch (error) {
        if ((error as { code?: string }).code === "23505") {
          throw new Error("A post with that URL slug already exists.");
        }
        throw error;
      }
    },

    async publish(id: string): Promise<AdminPost> {
      const db = getDb();
      const existing = await requireById(id);
      const now = new Date().toISOString();
      const rows = await db
        .update(posts)
        .set({
          status: "published",
          publishedAt: now,
          firstPublishedAt: existing.firstPublishedAt ?? now,
          updatedAt: now,
        })
        .where(eq(posts.id, id))
        .returning();
      return rowToAdminPost(rows[0]);
    },

    async unpublish(id: string): Promise<AdminPost> {
      const db = getDb();
      // publishedAt and firstPublishedAt are intentionally retained so the
      // original publish date and the slug lock survive a re-publish. The
      // public list excludes the row by status, not by date.
      const rows = await db
        .update(posts)
        .set({ status: "draft", updatedAt: new Date().toISOString() })
        .where(eq(posts.id, id))
        .returning();
      if (rows.length === 0) throw new Error(`Post not found: ${id}`);
      return rowToAdminPost(rows[0]);
    },

    async archive(id: string): Promise<AdminPost> {
      const db = getDb();
      const rows = await db
        .update(posts)
        .set({ status: "archived", updatedAt: new Date().toISOString() })
        .where(eq(posts.id, id))
        .returning();
      if (rows.length === 0) throw new Error(`Post not found: ${id}`);
      return rowToAdminPost(rows[0]);
    },
  };
}

const UNCONFIGURED = "Blog authoring requires a configured database.";

/**
 * A stub used when no database is configured (local dev without keys, tests):
 * reads are empty, writes refuse. The public site falls back to the filesystem
 * content source separately, so this only affects the admin authoring path.
 */
function createUnconfiguredBlogStore(): BlogStore {
  const noWrite = (): never => {
    throw new Error(UNCONFIGURED);
  };
  return {
    async listPublished() {
      return [];
    },
    async getPublishedBySlug() {
      return null;
    },
    async listAll() {
      return [];
    },
    async getById() {
      return null;
    },
    create: noWrite,
    update: noWrite,
    publish: noWrite,
    unpublish: noWrite,
    archive: noWrite,
  };
}

/** The single blog store the app depends on, gated on database configuration. */
export const blogStore: BlogStore = isDatabaseConfigured()
  ? createDrizzleBlogStore()
  : createUnconfiguredBlogStore();
