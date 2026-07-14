import "server-only";

import { blogStore } from "@/lib/db/blog";
import { sanitizePostHtml } from "@/lib/blog/sanitize";
import type { ContentSource, Post, PostMeta } from "./types";

/**
 * Database-backed {@link ContentSource} for the public blog. Bodies are
 * sanitized again at read time, never trusting stored HTML. The blog pages and
 * the sitemap that consume this render at request time, where the database
 * connection is always available.
 */
export function createDbContentSource(): ContentSource {
  return {
    async listPosts(): Promise<PostMeta[]> {
      return blogStore.listPublished();
    },

    async getPost(slug: string): Promise<Post | null> {
      const post = await blogStore.getPublishedBySlug(slug);
      if (!post) return null;
      return { ...post, bodyHtml: sanitizePostHtml(post.bodyHtml) };
    },
  };
}
