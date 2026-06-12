"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { requireCan } from "@/lib/admin/permissions";
import { blogStore } from "@/lib/db/blog";
import { sanitizePostHtml } from "@/lib/blog/sanitize";
import { readingMinutesFromHtml } from "@/lib/blog/reading-time";
import { isValidSlug, slugify } from "@/lib/blog/slugify";
import { uploadImage } from "@/lib/blog/storage";
import { checkRateLimit } from "@/lib/rate-limit";
import type { AdminPost, PostCover, PostInput } from "@/lib/content/types";

const TITLE_MAX = 200;
const EXCERPT_MAX = 300;
const BODY_MAX = 200_000;

/** Typed result consumed by the editor via useActionState. */
export type BlogActionResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string; field?: string };

export type UploadActionResult =
  | { ok: true; url: string; width: number; height: number }
  | { ok: false; error: string };

function fieldError(field: string, error: string): BlogActionResult {
  return { ok: false, error, field };
}

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/** Parses the cover column group; returns an error result if it is incomplete. */
function parseCover(
  form: FormData,
): { cover: PostCover | null } | BlogActionResult {
  const src = str(form, "coverSrc");
  if (!src) return { cover: null };
  // Only accept a site-relative path or an image from our own storage origin,
  // so a stored cover URL can never point at an arbitrary external origin.
  const storageOrigin = process.env.SUPABASE_URL;
  const trusted =
    src.startsWith("/") ||
    (storageOrigin ? src.startsWith(`${storageOrigin}/storage/`) : false);
  if (!trusted) {
    return fieldError("cover", "The cover image has an unexpected source.");
  }
  const alt = str(form, "coverAlt");
  if (!alt) {
    return fieldError("coverAlt", "Add alt text describing the cover image.");
  }
  const width = Number(form.get("coverWidth"));
  const height = Number(form.get("coverHeight"));
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    return fieldError("cover", "The cover image is missing its dimensions.");
  }
  return { cover: { src, alt, width, height } };
}

/**
 * Validates and assembles a {@link PostInput} from the form, honouring the slug
 * lock: once a post has been published, its slug is fixed to the stored value
 * regardless of what the form submits, so shared URLs never change.
 */
function buildInput(
  form: FormData,
  existing: AdminPost | null,
  authorName: string,
): { input: PostInput } | BlogActionResult {
  const title = str(form, "title");
  if (!title) return fieldError("title", "A title is required.");
  if (title.length > TITLE_MAX) return fieldError("title", "Title is too long.");

  const excerpt = str(form, "excerpt");
  if (excerpt.length > EXCERPT_MAX) {
    return fieldError("excerpt", "Excerpt is too long.");
  }

  // The author is the post's creator, captured from the session — never a form
  // field. An existing post keeps its original author when edited by someone else.
  const author = existing ? existing.author : authorName;

  // Slug: locked to the stored value once first published; otherwise taken from
  // the form (or derived from the title) and validated.
  let slug: string;
  if (existing?.firstPublishedAt) {
    slug = existing.slug;
  } else {
    // The slug is derived from the title (the client sends the derived value,
    // but we re-derive defensively). The only failure is a title with no
    // letters or numbers, which is really a title problem — report it there.
    slug = slugify(str(form, "slug") || title);
    if (!slug || !isValidSlug(slug)) {
      return fieldError(
        "title",
        "Add a title with letters or numbers so the post can have a web address.",
      );
    }
  }

  const rawBody = str(form, "bodyHtml");
  if (rawBody.length > BODY_MAX) {
    return fieldError("bodyHtml", "The post body is too long.");
  }
  const bodyHtml = sanitizePostHtml(rawBody);

  const cover = parseCover(form);
  if ("ok" in cover) return cover;

  return {
    input: {
      slug,
      title,
      excerpt,
      author,
      bodyHtml,
      readingMinutes: readingMinutesFromHtml(bodyHtml),
      cover: cover.cover,
    },
  };
}

function revalidatePost(slug: string, id: string): void {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
}

/** Loads the existing post for an update, or null for a create. */
async function loadExisting(form: FormData): Promise<AdminPost | null> {
  const id = str(form, "id");
  if (!id) return null;
  return blogStore.getById(id);
}

async function upsert(
  form: FormData,
  authorName: string,
): Promise<{ post: AdminPost } | BlogActionResult> {
  const existing = await loadExisting(form);
  const built = buildInput(form, existing, authorName);
  if ("ok" in built) return built;

  try {
    const post = existing
      ? await blogStore.update(existing.id, built.input)
      : await blogStore.create(built.input);
    return { post };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save the post.";
    // Surface the duplicate-slug message against the slug field.
    if (message.includes("slug")) return fieldError("slug", message);
    return { ok: false, error: message };
  }
}

/** Saves a post's content, preserving its current status (draft stays draft). */
export async function saveBlogPost(
  _prev: BlogActionResult | null,
  form: FormData,
): Promise<BlogActionResult> {
  const admin = await requireCan("manage-blog");
  const result = await upsert(form, admin.name);
  if ("ok" in result) return result;
  const { post } = result;
  revalidatePost(post.slug, post.id);
  return { ok: true, id: post.id, slug: post.slug };
}

/** Saves the post and makes it public, validating it is publishable. */
export async function publishBlogPost(
  _prev: BlogActionResult | null,
  form: FormData,
): Promise<BlogActionResult> {
  const admin = await requireCan("manage-blog");

  const result = await upsert(form, admin.name);
  if ("ok" in result) return result;
  const { post } = result;

  if (!post.excerpt) {
    return fieldError("excerpt", "Add a short excerpt before publishing.");
  }
  const bodyText = post.bodyHtml.replace(/<[^>]+>/g, "").trim();
  if (!bodyText) {
    return fieldError("bodyHtml", "Write the post body before publishing.");
  }

  const published = await blogStore.publish(post.id);
  revalidatePost(published.slug, published.id);
  return { ok: true, id: published.id, slug: published.slug };
}

/** Returns a published post to draft (removes it from the public site). */
export async function unpublishBlogPost(
  _prev: BlogActionResult | null,
  form: FormData,
): Promise<BlogActionResult> {
  await requireCan("manage-blog");
  const id = str(form, "id");
  if (!id) return { ok: false, error: "Missing post id." };
  const post = await blogStore.unpublish(id);
  revalidatePost(post.slug, post.id);
  return { ok: true, id: post.id, slug: post.slug };
}

/** Archives a post (recoverable; never shown publicly). */
export async function archiveBlogPost(
  _prev: BlogActionResult | null,
  form: FormData,
): Promise<BlogActionResult> {
  await requireCan("manage-blog");
  const id = str(form, "id");
  if (!id) return { ok: false, error: "Missing post id." };
  const post = await blogStore.archive(id);
  revalidatePost(post.slug, post.id);
  return { ok: true, id: post.id, slug: post.slug };
}

/** Uploads a cover/inline image and returns its public URL and dimensions. */
export async function uploadBlogImage(
  _prev: UploadActionResult | null,
  form: FormData,
): Promise<UploadActionResult> {
  const admin = await requireCan("manage-blog");

  // Generous ceiling: an author may add a cover plus several inline images to
  // one post, but a runaway loop is still capped.
  if (!checkRateLimit(`blog-upload:${admin.id}`, { limit: 40, windowMs: 600_000 })) {
    return { ok: false, error: "Too many uploads. Please wait a moment." };
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image to upload." };
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { url, width, height } = await uploadImage(bytes);
    return { ok: true, url, width, height };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The upload failed.";
    return { ok: false, error: message };
  }
}
