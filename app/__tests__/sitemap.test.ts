import { describe, expect, it, vi } from "vitest";

import type { PostMeta } from "@/lib/content/types";
import { projects } from "@/lib/projects";
import { routes, siteConfig } from "@/lib/site";

import robots from "../robots";
import sitemap from "../sitemap";

const fixturePosts: PostMeta[] = [
  {
    slug: "welcoming-our-first-cohort",
    title: "Welcoming our first cohort",
    date: "2026-01-10",
    excerpt: "Meet the students starting their RISE journey this year.",
    author: "Dara Olawale",
    cover: null,
  },
  {
    slug: "bootcamp-recap",
    title: "Bootcamp recap",
    date: "2026-03-05",
    excerpt: "Highlights from our latest leadership bootcamp.",
    author: "Ayo Adekunle",
    cover: null,
  },
];

vi.mock("@/lib/content", () => ({
  content: {
    listPosts: () => Promise.resolve(fixturePosts),
    getPost: vi.fn(),
  },
}));

const url = (path: string) => `${siteConfig.url}${path}`;

const expectedUrls = [
  url(routes.home),
  url(routes.about),
  url(routes.team),
  url(routes.projects),
  url(routes.blog),
  url(routes.getInvolved),
  url(routes.mentor),
  url(routes.mentee),
  url(routes.contact),
  url(routes.faq),
  url(routes.privacy),
  ...projects.map((project) => url(`/projects/${project.slug}`)),
  ...fixturePosts.map((post) => url(`/blog/${post.slug}`)),
];

describe("sitemap", () => {
  const entriesPromise = sitemap();

  it("contains exactly the expected url set with no leakage or duplicates", async () => {
    const urls = (await entriesPromise).map((entry) => entry.url);
    expect([...urls].sort()).toEqual([...expectedUrls].sort());
  });

  it("includes the home page", async () => {
    const urls = (await entriesPromise).map((entry) => entry.url);
    expect(urls).toContain(url(routes.home));
  });

  it("includes every project detail slug", async () => {
    const urls = (await entriesPromise).map((entry) => entry.url);
    for (const project of projects) {
      expect(urls).toContain(url(`/projects/${project.slug}`));
    }
  });

  it("includes get-involved, contact, and faq", async () => {
    const urls = (await entriesPromise).map((entry) => entry.url);
    expect(urls).toContain(url(routes.getInvolved));
    expect(urls).toContain(url(routes.contact));
    expect(urls).toContain(url(routes.faq));
  });

  it("lists the blog index as a weekly entry", async () => {
    const entries = await entriesPromise;
    for (const path of [routes.blog]) {
      const entry = entries.find((candidate) => candidate.url === url(path));
      expect(entry).toBeDefined();
      expect(entry?.changeFrequency).toBe("weekly");
      expect(entry?.priority).toBe(0.6);
    }
  });

  it("adds one entry per published post, dated to the post", async () => {
    const entries = await entriesPromise;
    for (const post of fixturePosts) {
      const entry = entries.find(
        (candidate) => candidate.url === url(`/blog/${post.slug}`),
      );
      expect(entry).toBeDefined();
      expect(entry?.lastModified).toEqual(new Date(post.date));
      expect(entry?.changeFrequency).toBe("yearly");
      expect(entry?.priority).toBe(0.6);
    }
  });

  it("gives every entry a Date lastModified and a numeric priority", async () => {
    for (const entry of await entriesPromise) {
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(typeof entry.priority).toBe("number");
    }
  });

  it("gives the home page the maximum priority", async () => {
    const entries = await entriesPromise;
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
