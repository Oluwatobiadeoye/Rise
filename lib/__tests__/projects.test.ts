import { describe, it, expect } from "vitest";
import { projects, getProject } from "@/lib/projects";

describe("projects roster", () => {
  it("exposes the expected project slugs in order", () => {
    expect(projects.map((p) => p.slug)).toEqual([
      "the-oyo-project",
      "foundations-of-impact",
    ]);
  });

  it("resolves a project by slug and returns undefined otherwise", () => {
    expect(getProject("the-oyo-project")?.name).toBe("The Oyo Project (TOP)");
    expect(getProject("does-not-exist")).toBeUndefined();
  });

  it("gives The Oyo Project three tiers with the expected anchors", () => {
    const top = getProject("the-oyo-project");
    expect(top?.tiers?.map((t) => t.slug)).toEqual([
      "rise-foundations",
      "rise-horizons",
      "rise-impact-network",
    ]);
  });

  it("points the Impact Network CTA at a deliberate dead path", () => {
    const network = getProject("the-oyo-project")?.tiers?.find(
      (t) => t.slug === "rise-impact-network",
    );
    expect(network?.cta?.[0]).toEqual({
      label: "Join the community",
      href: "/get-involved/impact-network",
    });
  });

  it("gives Foundations highlights and a gallery grouped by three schools", () => {
    const foundations = getProject("foundations-of-impact");
    expect(foundations?.highlights?.length).toBeGreaterThan(0);
    expect(foundations?.gallery?.map((g) => g.school)).toEqual([
      "Aatan Baptist Comprehensive High School",
      "Best Legacy International Secondary School",
      "SPED International Secondary School",
    ]);
  });

  it("requires non-empty alt text on every gallery photo", () => {
    for (const project of projects) {
      for (const school of project.gallery ?? []) {
        for (const photo of school.photos) {
          expect(photo.alt.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });
});
