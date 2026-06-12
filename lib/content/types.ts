/** Listing-level post data; safe to serialize across the server boundary. */
export type PostMeta = {
  slug: string;
  title: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  excerpt: string;
  author: string;
  /** Estimated reading time of the body, in whole minutes (minimum 1). */
  readingMinutes: number;
  cover: { src: string; alt: string; width: number; height: number } | null;
};

export type Post = PostMeta & {
  /** Rendered HTML for the post body. */
  bodyHtml: string;
};

/** Lifecycle of a blog post in the admin store. */
export type PostStatus = "draft" | "published" | "archived";

/** A post's cover image (all fields present together, or no cover at all). */
export type PostCover = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/** Listing-level admin view: every post regardless of status. */
export type AdminPostSummary = {
  id: string;
  slug: string;
  title: string;
  status: PostStatus;
  /** Null until first published. */
  publishedAt: string | null;
  updatedAt: string;
};

/** Full admin view of a post, including draft/unpublished bodies. */
export type AdminPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  bodyHtml: string;
  readingMinutes: number;
  cover: PostCover | null;
  status: PostStatus;
  publishedAt: string | null;
  /** Set the first time the post is published; locks the slug thereafter. */
  firstPublishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Fields an author supplies when creating or updating a post. */
export type PostInput = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  bodyHtml: string;
  readingMinutes: number;
  cover: PostCover | null;
};

/**
 * The content access interface pages depend on. The filesystem source
 * implements it today; a hosted Content Management System (CMS) adapter can
 * replace it later without touching pages.
 */
export interface ContentSource {
  /** Published posts only, newest first. */
  listPosts(): Promise<PostMeta[]>;
  /** Full post by slug; null for unknown slugs and drafts. */
  getPost(slug: string): Promise<Post | null>;
}
