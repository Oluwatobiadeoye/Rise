import { describe, it, expect } from "vitest";
import { generateMetadata, generateStaticParams } from "../[slug]/page";

describe("project detail route", () => {
  it("prerenders a param for every project", () => {
    expect(generateStaticParams()).toEqual([
      { slug: "the-oyo-project" },
      { slug: "foundations-of-impact" },
    ]);
  });

  it("builds per-project metadata for a known slug", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "the-oyo-project" }),
    });
    expect(meta.title).toBe("The Oyo Project (TOP)");
    expect(meta.alternates?.canonical).toBe("/projects/the-oyo-project");
  });

  it("returns empty metadata for an unknown slug", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "nope" }),
    });
    expect(meta).toEqual({});
  });
});
