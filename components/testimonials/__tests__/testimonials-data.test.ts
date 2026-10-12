import { describe, it, expect } from "vitest";
import { excerptOf, featuredTestimonials, testimonials } from "@/lib/testimonials";

describe("testimonials data", () => {
  it("has all nine testimonials with unique slugs", () => {
    expect(testimonials).toHaveLength(9);
    expect(new Set(testimonials.map((t) => t.slug)).size).toBe(9);
  });

  it("gives every testimonial a headline, body, role, and school", () => {
    for (const t of testimonials) {
      expect(t.headline).not.toBe("");
      expect(t.paragraphs.length).toBeGreaterThan(0);
      expect(t.roles.length).toBeGreaterThan(0);
      expect(t.school).not.toBe("");
    }
  });

  it("avoids em dashes in visible copy", () => {
    for (const t of testimonials) {
      const copy = [t.headline, ...t.paragraphs, ...t.roles, t.school].join(" ");
      expect(copy).not.toContain("—");
    }
  });

  it("features exactly five testimonials drawn from the full list", () => {
    expect(featuredTestimonials).toHaveLength(5);
    for (const t of featuredTestimonials) expect(testimonials).toContain(t);
  });

  it("gives every testimonial a real paragraph as its excerpt", () => {
    for (const t of testimonials) expect(t.paragraphs).toContain(excerptOf(t));
  });

  it("shows Maryam's Sustainable Development Goals memory rather than her one-line opener", () => {
    const maryam = testimonials.find((t) => t.slug === "maryam-thabit")!;
    expect(excerptOf(maryam)).toMatch(/printed copies of the SDGs/);
  });
});
