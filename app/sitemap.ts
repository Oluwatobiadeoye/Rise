import type { MetadataRoute } from "next";

import { content } from "@/lib/content";
import { projects } from "@/lib/projects";
import { routes, siteConfig } from "@/lib/site";

type EntryDescriptor = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  lastModified?: Date;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A single shared instant keeps every static entry's lastModified consistent.
  const lastModified = new Date();

  const staticEntries: ReadonlyArray<EntryDescriptor> = [
    { path: routes.home, changeFrequency: "monthly", priority: 1.0 },
    { path: routes.about, changeFrequency: "monthly", priority: 0.8 },
    { path: routes.team, changeFrequency: "monthly", priority: 0.8 },
    { path: routes.projects, changeFrequency: "monthly", priority: 0.8 },
    { path: routes.blog, changeFrequency: "weekly", priority: 0.6 },
    { path: routes.gallery, changeFrequency: "weekly", priority: 0.6 },
    { path: routes.getInvolved, changeFrequency: "monthly", priority: 0.8 },
    { path: routes.mentor, changeFrequency: "monthly", priority: 0.7 },
    { path: routes.mentee, changeFrequency: "monthly", priority: 0.7 },
    { path: routes.contact, changeFrequency: "yearly", priority: 0.5 },
    { path: routes.faq, changeFrequency: "yearly", priority: 0.5 },
    { path: routes.privacy, changeFrequency: "yearly", priority: 0.3 },
  ];

  const projectEntries: ReadonlyArray<EntryDescriptor> = projects.map(
    (project) => ({
      path: `/projects/${project.slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  const posts = await content.listPosts();
  const postEntries: ReadonlyArray<EntryDescriptor> = posts.map((post) => ({
    path: `/blog/${post.slug}`,
    changeFrequency: "yearly",
    priority: 0.6,
    lastModified: new Date(post.date),
  }));

  return [...staticEntries, ...projectEntries, ...postEntries].map(
    (entry) => ({
      url: `${siteConfig.url}${entry.path}`,
      lastModified: entry.lastModified ?? lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
    }),
  );
}
