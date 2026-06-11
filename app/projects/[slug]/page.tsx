import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProjectIntro } from "@/components/projects/ProjectIntro";
import { TierSection } from "@/components/projects/TierSection";
import { ImpactHighlights } from "@/components/projects/ImpactHighlights";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { getProject, projects } from "@/lib/projects";
import { pageMetadata } from "@/lib/metadata";

type PageParams = { slug: string };

export function generateStaticParams(): PageParams[] {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return pageMetadata({
    title: project.name,
    description: project.summary,
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const eyebrow =
    project.status === "active"
      ? "Flagship programme"
      : `Past project · ${project.period}`;

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={project.name} lede={project.lede} />

      <ProjectIntro
        paragraphs={project.intro}
        emphasize={project.tiers ? "Agboole" : undefined}
      />

      {project.tiers?.map((tier, index) => (
        <TierSection key={tier.slug} tier={tier} tinted={index % 2 === 1} />
      ))}

      {project.highlights ? (
        <ImpactHighlights highlights={project.highlights} />
      ) : null}

      {project.gallery ? <ProjectGallery schools={project.gallery} /> : null}
    </>
  );
}
