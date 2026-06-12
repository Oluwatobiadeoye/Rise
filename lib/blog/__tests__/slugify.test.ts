import { describe, expect, it } from "vitest";
import { isValidSlug, slugify, SLUG_PATTERN } from "../slugify";

describe("slugify", () => {
  it("lower-cases and hyphenates words", () => {
    expect(slugify("Stories From RISE")).toBe("stories-from-rise");
  });

  it("transliterates diacritics (Yoruba-safe)", () => {
    expect(slugify("Ìdàgbàsókè")).toBe("idagbasoke");
  });

  it("collapses symbols and ampersands into single hyphens", () => {
    expect(slugify("RISE & TOP 2026: Impact!!")).toBe("rise-top-2026-impact");
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("  --Hello--  ")).toBe("hello");
  });

  it("always yields a valid slug or empty string", () => {
    for (const input of ["Hello World", "Ìdàgbàsókè", "a/b\\c", "2026", ""]) {
      const slug = slugify(input);
      expect(slug === "" || SLUG_PATTERN.test(slug)).toBe(true);
    }
  });

  it("returns empty for input with no alphanumerics", () => {
    expect(slugify("!!! ---")).toBe("");
  });
});

describe("isValidSlug", () => {
  it("accepts kebab-case", () => {
    expect(isValidSlug("a-valid-slug-2026")).toBe(true);
  });

  it("rejects uppercase, spaces, leading/trailing/double hyphens", () => {
    for (const bad of ["Bad", "has space", "-lead", "trail-", "double--hyphen", ""]) {
      expect(isValidSlug(bad)).toBe(false);
    }
  });
});
