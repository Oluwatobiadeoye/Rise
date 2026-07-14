import { createDbContentSource } from "./db";
import type { ContentSource } from "./types";

/**
 * The single content entry point pages import from. Blog posts live in the
 * database; the consuming routes render at request time, where the connection
 * is available.
 */
export const content: ContentSource = createDbContentSource();

export type { ContentSource, Post, PostMeta } from "./types";
