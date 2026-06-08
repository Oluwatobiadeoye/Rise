import type { MetadataRoute } from "next";

import { projects } from "@/lib/projects";
import { routes, siteConfig } from "@/lib/site";

type EntryDescriptor = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

export default function sitemap(): MetadataRoute.Sitemap {
  // A single shared instant keeps every entry's lastModified consistent.
  const lastModified = new Date();

  const staticEntries: ReadonlyArray<EntryDescriptor> = [
    { path: routes.home, changeFrequency: "monthly", priority: 1.0 },
    { path: routes.about, changeFrequency: "monthly", priority: 0.8 },
    { path: routes.team, changeFrequency: "monthly", priority: 0.8 },
    { path: routes.projects, changeFrequency: "monthly", priority: 0.8 },
    { path: routes.getInvolved, changeFrequency: "monthly", priority: 0.8 },
    { path: routes.mentor, changeFrequency: "monthly", priority: 0.7 },
    { path: routes.mentee, changeFrequency: "monthly", priority: 0.7 },
    { path: routes.contact, changeFrequency: "yearly", priority: 0.5 },
    { path: routes.faq, changeFrequency: "yearly", priority: 0.5 },
  ];

  const projectEntries: ReadonlyArray<EntryDescriptor> = projects.map(
    (project) => ({
      path: `/projects/${project.slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  return [...staticEntries, ...projectEntries].map(
    ({ path, changeFrequency, priority }) => ({
      url: `${siteConfig.url}${path}`,
      lastModified,
      changeFrequency,
      priority,
    }),
  );
}
