import { isDatabaseConfigured } from "@/lib/db/client";
import { createDbContentSource } from "./db";
import { createFsContentSource } from "./fs";
import type { ContentSource } from "./types";

// The filesystem source is always constructed: it backs local dev and tests
// with no database, and serves as the graceful fallback for the DB source.
const fsSource = createFsContentSource();

/**
 * The single content entry point pages import from. It reads blog posts from
 * the database when `DATABASE_URL` is configured (the production authoring
 * path) and falls back to the filesystem markdown otherwise.
 */
export const content: ContentSource = isDatabaseConfigured()
  ? createDbContentSource(fsSource)
  : fsSource;

export type { ContentSource, Post, PostMeta } from "./types";
