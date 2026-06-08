import { describe, expect, it } from "vitest";

import { projects } from "@/lib/projects";
import { routes, siteConfig } from "@/lib/site";

import robots from "../robots";
import sitemap from "../sitemap";

const url = (path: string) => `${siteConfig.url}${path}`;

const expectedUrls = [
  url(routes.home),
  url(routes.about),
  url(routes.team),
  url(routes.projects),
  url(routes.getInvolved),
  url(routes.mentor),
  url(routes.mentee),
  url(routes.contact),
  url(routes.faq),
  ...projects.map((project) => url(`/projects/${project.slug}`)),
];

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);

  it("contains exactly the expected url set with no leakage or duplicates", () => {
    expect([...urls].sort()).toEqual([...expectedUrls].sort());
  });

  it("includes the home page", () => {
    expect(urls).toContain(url(routes.home));
  });

  it("includes every project detail slug", () => {
    for (const project of projects) {
      expect(urls).toContain(url(`/projects/${project.slug}`));
    }
  });

  it("includes get-involved, contact, and faq", () => {
    expect(urls).toContain(url(routes.getInvolved));
    expect(urls).toContain(url(routes.contact));
    expect(urls).toContain(url(routes.faq));
  });

  it("gives every entry a Date lastModified and a numeric priority", () => {
    for (const entry of entries) {
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(typeof entry.priority).toBe("number");
    }
  });

  it("gives the home page the maximum priority", () => {
    const homeEntry = entries.find((entry) => entry.url === url(routes.home));
    expect(homeEntry).toBeDefined();
    const maxPriority = Math.max(
      ...entries.map((entry) => entry.priority ?? 0),
    );
    expect(homeEntry?.priority).toBe(maxPriority);
  });
});

describe("robots", () => {
  const result = robots();

  it("exposes the sitemap url", () => {
    expect(result.sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
  });

  it("allows all user agents", () => {
    const rules = result.rules;
    expect(Array.isArray(rules)).toBe(false);
    const rule = rules as { userAgent?: string | string[]; allow?: string | string[] };
    expect(rule.userAgent).toBe("*");
    expect(rule.allow).toBe("/");
  });
});
