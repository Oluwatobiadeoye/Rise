import "server-only";

import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { imageSize } from "image-size";

const BUCKET = "blog";
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_DIMENSION = 10_000;

// Detected image type -> stored extension + canonical content type. The type is
// derived from the file's magic bytes (via image-size), never from the
// client-supplied filename or content-type header, so a renamed/spoofed upload
// (e.g. HTML or SVG posing as a PNG) is rejected rather than stored.
const TYPE_MAP: Record<string, { ext: string; contentType: string }> = {
  jpg: { ext: "jpg", contentType: "image/jpeg" },
  png: { ext: "png", contentType: "image/png" },
  webp: { ext: "webp", contentType: "image/webp" },
};

export type UploadedImage = { url: string; width: number; height: number };

let client: ReturnType<typeof createClient> | null = null;
function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Image storage is not configured.");
  }
  if (!client) {
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

/** Whether the storage backend has the credentials it needs. */
export function isStorageConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Validates an uploaded image by its bytes and stores it in the public `blog`
 * bucket under a random key, returning its public URL and dimensions. Throws a
 * user-safe Error on any validation failure (the caller maps it to a field
 * message). Never trusts the declared content-type or filename.
 */
export async function uploadImage(bytes: Uint8Array): Promise<UploadedImage> {
  if (bytes.byteLength === 0) throw new Error("The image file is empty.");
  if (bytes.byteLength > MAX_BYTES) {
    throw new Error("Image is larger than 8 MB.");
  }

  const buffer = Buffer.from(bytes);
  let dimensions: { width?: number; height?: number; type?: string };
  try {
    dimensions = imageSize(buffer);
  } catch {
    throw new Error("That file is not a valid image.");
  }

  const mapping = dimensions.type ? TYPE_MAP[dimensions.type] : undefined;
  if (!mapping) {
    throw new Error("Images must be JPEG, PNG, or WebP.");
  }
  const { width, height } = dimensions;
  if (
    !width ||
    !height ||
    width > MAX_DIMENSION ||
    height > MAX_DIMENSION
  ) {
    throw new Error("Image dimensions are missing or too large.");
  }

  const key = `${randomUUID()}.${mapping.ext}`;
  const supabase = getClient();
  const { error } = await supabase.storage.from(BUCKET).upload(key, buffer, {
    contentType: mapping.contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    throw new Error("The image could not be uploaded. Please try again.");
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return { url: data.publicUrl, width, height };
}
