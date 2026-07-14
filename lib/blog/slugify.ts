/** The slug shape the DB CHECK and the public route both require. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Turns an arbitrary title into a valid kebab-case slug. Diacritics are
 * transliterated (so Yoruba titles like "Ìdàgbàsókè" become "idagbasoke"),
 * symbols collapse to single hyphens, and the result always satisfies
 * {@link SLUG_PATTERN} (or is empty when the title has no alphanumerics).
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    // Strip combining diacritical marks left by NFKD decomposition.
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    // Anything that is not a-z or 0-9 becomes a separator.
    .replace(/[^a-z0-9]+/g, "-")
    // Trim leading/trailing hyphens.
    .replace(/^-+|-+$/g, "");
}

/** Whether a value is a valid slug. */
export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}
