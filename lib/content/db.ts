import "server-only";

import { blogStore } from "@/lib/db/blog";
import { sanitizePostHtml } from "@/lib/blog/sanitize";
import type { ContentSource, Post, PostMeta } from "./types";

/**
 * Database-backed {@link ContentSource} for the public blog. Bodies are
 * sanitized again at read time (never trusting stored HTML), and every query is
 * guarded by a fallback: if the `posts` table is missing or the connection
 * fails (e.g. a deploy that ships the source swap before migrations run), it
 * degrades to the filesystem source instead of erroring the public site.
 */
export function createDbContentSource(fallback: ContentSource): ContentSource {
  return {
    async listPosts(): Promise<PostMeta[]> {
      try {
        return await blogStore.listPublished();
      } catch (error) {
        console.error("Blog DB listPosts failed; using fallback source.", error);
        return fallback.listPosts();
      }
    },

    async getPost(slug: string): Promise<Post | null> {
      try {
        const post = await blogStore.getPublishedBySlug(slug);
        if (!post) return null;
        return { ...post, bodyHtml: sanitizePostHtml(post.bodyHtml) };
      } catch (error) {
        console.error("Blog DB getPost failed; using fallback source.", error);
        return fallback.getPost(slug);
      }
    },
  };
}
