// Attribution slug from a `?from=` entry point. Constrained to a short
// alphanumeric/hyphen token so it is safe to store and echo as plain text.
const FROM_PATTERN = /^[a-z0-9][a-z0-9-]{0,39}$/i;

/** Returns the slug when it matches the safe shape, otherwise null. */
export function sanitizeFromSlug(value: unknown): string | null {
  return typeof value === "string" && FROM_PATTERN.test(value) ? value : null;
}
