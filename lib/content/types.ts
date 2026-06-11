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
