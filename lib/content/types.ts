/** Listing-level post data; safe to serialize across the server boundary. */
export type PostMeta = {
  slug: string;
  title: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  excerpt: string;
  author: string;
  cover: { src: string; alt: string; width: number; height: number } | null;
};

export type Post = PostMeta & {
  /** Rendered HTML for the post body. */
  bodyHtml: string;
};

export type GalleryItem = {
  id: string;
  /** Public path under /gallery/. */
  src: string;
  alt: string;
  caption: string | null;
  width: number;
  height: number;
  takenAt: string | null;
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
  /** Gallery items in manifest order. */
  listGalleryItems(): Promise<GalleryItem[]>;
}
