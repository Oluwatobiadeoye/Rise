/**
 * Minimal className joiner — filters out falsy values and joins with spaces.
 * Dependency-free; order your classes intentionally (no conflict resolution).
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
