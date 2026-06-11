import { createFsContentSource } from "./fs";
import type { ContentSource } from "./types";

/** The single content entry point pages import from. */
export const content: ContentSource = createFsContentSource();

export type { ContentSource, Post, PostMeta } from "./types";
